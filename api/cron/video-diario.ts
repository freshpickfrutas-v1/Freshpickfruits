// Video diario de Instinct: de su correo a la página, Facebook e Instagram, sin intervención.
//
//   GET /api/cron/video-diario?fase=correo    → lee Gmail, baja el video nuevo y lo sube a la página (commit + despliegue).
//                                               También prepara 3 borradores de redes (recetas y noticias) para el panel.
//   GET /api/cron/video-diario?fase=publicar  → publica en Facebook e Instagram (Reels) los videos del registro que aún no salieron.
//   GET /api/cron/video-diario                → las dos fases seguidas (para pruebas a mano; el despliegue tarda 1-2 min, así que
//                                               la publicación del video recién subido saldrá en la siguiente llamada).
//   Agrega &simular=1 para ensayar: revisa todo, no publica ni guarda nada.
//
// Vercel Cron lo llama dos veces al día (vercel.json): primero "correo" y una hora después "publicar".
// Autorizado con "Authorization: Bearer <CRON_SECRET>". El estado vive en Firestore: correos_videos (correos ya vistos)
// y social_videos (qué red ya publicó cada video). Repetir una llamada nunca duplica nada.
import { adminDb } from '../_lib/admin.js';
import {
  SITIO, crearBorradores, faltanVariablesMeta, generarPiezas, intentar, publicarFacebookVideo,
  crearContenedorReel, estadoContenedor, publicarContenedor, type Piezas,
} from '../_lib/social.js';
import { buscarCorreosConVideo, descargarVideo, faltanVariablesGmail, gmailConfigurado } from '../_lib/gmail.js';
import { subirVideo, type EntradaVideo } from '../_lib/repo.js';
import { buscarNoticia, fechaBogota, medirMp4, slugify } from '../_lib/video.js';

interface VideoDiario {
  id: string; archivo: string; titulo: string; descripcion?: string; noticiaSlug?: string; fecha?: string;
}

const esperar = (ms: number) => new Promise(r => setTimeout(r, ms));

async function leerJson(ruta: string): Promise<any> {
  const r = await fetch(`${SITIO}${ruta}`, { headers: { 'Cache-Control': 'no-cache' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} al leer ${ruta}`);
  return r.json();
}

// ---------------------------------------------------------------------------------------------------------------
// Fase 1: del correo a la página
// ---------------------------------------------------------------------------------------------------------------
async function faseCorreo(db: FirebaseFirestore.Firestore, simular: boolean): Promise<any> {
  if (!gmailConfigurado()) return { estado: `sin configurar: faltan ${faltanVariablesGmail().join(', ')} en Vercel` };
  const col = db.collection('correos_videos');
  const correos = await buscarCorreosConVideo(3);

  const nuevos = [];
  for (const c of correos) if (!(await col.doc(c.messageId).get()).exists) nuevos.push(c);
  if (!nuevos.length) return { estado: 'no hay correos nuevos con video', revisados: correos.length };

  // Solo se publica el más reciente; los demás de esos días se marcan como omitidos.
  const [c, ...otros] = nuevos;
  const id = `${fechaBogota(c.fecha)}-${slugify(c.archivo.replace(/\.mp4$/i, ''))}`;
  const ahora = new Date().toISOString();

  const registro: VideoDiario[] = await leerJson('/videos-diarios.json').catch(() => []);
  if (registro.some(v => v.id === id)) {
    if (!simular) await col.doc(c.messageId).set({ videoId: id, asunto: c.asunto, estado: 'ya-en-registro', procesadoEn: ahora });
    return { estado: `el video ${id} ya estaba en el registro`, correo: c.asunto, simulacion: simular };
  }

  const mp4 = await descargarVideo(c);
  const medidas = medirMp4(mp4);
  const noticias: any[] = await leerJson('/data/noticias-index.json').catch(() => []);
  const noticiaSlug = buscarNoticia(c.titulo, noticias) ?? undefined;
  const noticia = noticias.find(n => n.slug === noticiaSlug);

  const entrada: EntradaVideo = {
    id, archivo: `/videos/${id}.mp4`, titulo: c.titulo, descripcion: noticia?.excerpt, noticiaSlug,
    fecha: fechaBogota(c.fecha), ...medidas, bytes: mp4.length, origen: 'correo de Instinct (Gmail)',
  };
  const r = await subirVideo({ mp4, entrada, simular });

  if (!simular) {
    await col.doc(c.messageId).set({ videoId: id, asunto: c.asunto, estado: 'subido', commit: r.commit, pr: r.pr ?? null, procesadoEn: ahora });
    for (const o of otros) await col.doc(o.messageId).set({ asunto: o.asunto, estado: 'omitido', procesadoEn: ahora });
  }
  return {
    estado: simular ? 'simulación: todo listo para subir (no se cambió nada)' : 'video subido a la página; se despliega en 1-2 minutos',
    video: id, correo: c.asunto, medidas, noticia: r.noticia ?? 'ninguna coincidencia: queda sin noticia', commit: r.commit, pr: r.pr ?? null,
    omitidos: simular ? otros.length : undefined,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Fase 2: de la página a Facebook e Instagram
// ---------------------------------------------------------------------------------------------------------------
async function fasePublicar(db: FirebaseFirestore.Firestore, simular: boolean): Promise<any> {
  const faltan = faltanVariablesMeta(true, true);
  if (faltan.length && !simular) return { error: `Faltan variables en Vercel: ${faltan.join(', ')}` };

  let lista: VideoDiario[] = [];
  try {
    lista = await leerJson('/videos-diarios.json');
  } catch (err: any) {
    return { error: `No se pudo leer el registro de videos: ${String(err?.message ?? err)}` };
  }

  const col = db.collection('social_videos');
  const resultados: any[] = [];

  for (const v of lista) {
    if (!v?.id || !v.archivo) continue;
    const ref = col.doc(v.id);
    const est: any = (await ref.get()).data() ?? {};
    if (est.facebook?.ok && est.instagram?.ok) { resultados.push({ id: v.id, estado: 'ya publicado' }); continue; }

    const url = `${SITIO}${v.archivo}`;
    const head = await fetch(url, { method: 'HEAD' }).catch(() => null);
    if (!head?.ok) { resultados.push({ id: v.id, estado: `el archivo aún no está disponible (${url}); se reintenta en la próxima llamada` }); continue; }

    const enlaceNoticia = v.noticiaSlug ? `${SITIO}/noticias/${v.noticiaSlug}` : SITIO;
    try {
      if (!est.piezas) est.piezas = await generarPiezas({ tipo: 'video', title: v.titulo, excerpt: v.descripcion, url: enlaceNoticia });
    } catch (err: any) {
      resultados.push({ id: v.id, estado: `no se pudieron escribir los textos: ${String(err?.message ?? err).slice(0, 160)}` });
      continue;
    }
    const piezas: Piezas = est.piezas;
    const textoFacebook = `${piezas.facebook.copy}\n\n${enlaceNoticia}`;
    const textoInstagram = `${piezas.instagram.copy}\n\n${piezas.instagram.hashtags.join(' ')}`.slice(0, 2200);

    if (simular) {
      resultados.push({ id: v.id, estado: 'simulación: todo listo, no se publicó nada', archivo: url, bytes: Number(head.headers.get('content-length') ?? 0), textoFacebook, textoInstagram });
      continue;
    }

    // Facebook: Meta descarga el video desde la dirección pública.
    if (!est.facebook?.ok) est.facebook = await intentar(() => publicarFacebookVideo(url, textoFacebook, v.titulo));

    // Instagram (Reel): se crea el contenedor, se espera a que Meta procese el video y se publica.
    // Si tarda más de lo que permite la función, el contenedor queda guardado y la próxima llamada continúa.
    if (!est.instagram?.ok) {
      const ig: any = { ...(est.instagram ?? {}), ok: false };
      try {
        if (!ig.containerId) ig.containerId = await crearContenedorReel(url, textoInstagram);
        for (let i = 0; i < 8; i++) {
          const e = await estadoContenedor(ig.containerId);
          if (e.codigo === 'FINISHED') { ig.id = (await publicarContenedor(ig.containerId)).id; ig.ok = true; delete ig.error; delete ig.pendiente; break; }
          if (e.codigo === 'ERROR' || e.codigo === 'EXPIRED') { ig.error = `Instagram no pudo procesar el video (${e.detalle ?? e.codigo})`; delete ig.containerId; break; }
          await esperar(5000);
        }
        if (!ig.ok && !ig.error) ig.pendiente = 'Instagram sigue procesando el video; se publicará en la próxima llamada';
      } catch (err: any) {
        console.error('video-diario instagram', err);
        ig.error = String(err?.message ?? err).slice(0, 300);
      }
      est.instagram = ig;
    }

    await ref.set({ ...est, titulo: v.titulo, archivo: v.archivo, actualizadoEn: new Date().toISOString() }, { merge: true });
    resultados.push({ id: v.id, facebook: est.facebook, instagram: est.instagram });
  }
  return { resultados };
}

// ---------------------------------------------------------------------------------------------------------------

export default async function handler(req: any, res: any) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers?.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'No autorizado' });

  const simular = req.query?.simular === '1' || req.query?.simular === 'true';
  const fase = String(req.query?.fase ?? '');
  const inicio = Date.now();
  const db = adminDb();
  const salida: any = { simulacion: simular, fase: fase || 'todo' };

  if (fase !== 'publicar') {
    try {
      salida.correo = await faseCorreo(db, simular);
    } catch (err: any) {
      console.error('video-diario correo', err);
      salida.correo = { error: String(err?.message ?? err).slice(0, 300) };
    }
    // Aprovecha la misma llamada diaria para preparar borradores de redes de las recetas y noticias (sin publicar nada).
    if (!simular) {
      try {
        salida.borradores = await crearBorradores(Date.now() - inicio < 20_000 ? 3 : 1);
      } catch (err: any) {
        salida.borradores = { error: String(err?.message ?? err).slice(0, 200) };
      }
    }
  }
  if (fase !== 'correo') {
    try {
      salida.publicacion = await fasePublicar(db, simular);
    } catch (err: any) {
      console.error('video-diario publicar', err);
      salida.publicacion = { error: String(err?.message ?? err).slice(0, 300) };
    }
  }
  return res.status(200).json(salida);
}
