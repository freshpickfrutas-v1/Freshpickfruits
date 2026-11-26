// GET /api/cron/video-diario            → publica en Facebook e Instagram (Reels) los videos del registro que aún no salieron.
// GET /api/cron/video-diario?simular=1  → ensayo: revisa el archivo y escribe los textos, pero NO publica ni guarda nada.
// Los videos se listan en public/videos-diarios.json (archivo subido a la página en /videos/). Lo llama Vercel Cron cada día
// y también se puede llamar a mano. Autorizado con "Authorization: Bearer <CRON_SECRET>".
// El estado de cada video (qué red ya salió) vive en Firestore: colección social_videos. Repetir la llamada no duplica nada.
import { adminDb } from '../_lib/admin.js';
import {
  SITIO, faltanVariablesMeta, generarPiezas, intentar, publicarFacebookVideo,
  crearContenedorReel, estadoContenedor, publicarContenedor, type Piezas,
} from '../_lib/social.js';

interface VideoDiario {
  id: string; archivo: string; titulo: string; descripcion?: string; noticiaSlug?: string; fecha?: string;
}

const esperar = (ms: number) => new Promise(r => setTimeout(r, ms));

export default async function handler(req: any, res: any) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers?.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'No autorizado' });

  const simular = req.query?.simular === '1' || req.query?.simular === 'true';
  const faltan = faltanVariablesMeta(true, true);
  if (faltan.length && !simular) return res.status(500).json({ error: `Faltan variables en Vercel: ${faltan.join(', ')}` });

  let lista: VideoDiario[] = [];
  try {
    const r = await fetch(`${SITIO}/videos-diarios.json`, { headers: { 'Cache-Control': 'no-cache' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    lista = (await r.json()) as VideoDiario[];
  } catch (err: any) {
    return res.status(502).json({ error: `No se pudo leer el registro de videos: ${String(err?.message ?? err)}` });
  }

  const col = adminDb().collection('social_videos');
  const resultados: any[] = [];

  for (const v of lista) {
    if (!v?.id || !v.archivo) continue;
    const ref = col.doc(v.id);
    const est: any = (await ref.get()).data() ?? {};
    if (est.facebook?.ok && est.instagram?.ok) { resultados.push({ id: v.id, estado: 'ya publicado' }); continue; }

    const url = `${SITIO}${v.archivo}`;
    const head = await fetch(url, { method: 'HEAD' }).catch(() => null);
    if (!head?.ok) { resultados.push({ id: v.id, estado: `el archivo aún no está disponible (${url})` }); continue; }

    const enlaceNoticia = v.noticiaSlug ? `${SITIO}/noticias/${v.noticiaSlug}` : SITIO;
    try {
      if (!est.piezas) {
        est.piezas = (await generarPiezas({ tipo: 'video', title: v.titulo, excerpt: v.descripcion, url: enlaceNoticia })) satisfies Piezas;
      }
    } catch (err: any) {
      resultados.push({ id: v.id, estado: `no se pudieron escribir los textos: ${String(err?.message ?? err).slice(0, 160)}` });
      continue;
    }
    const piezas: Piezas = est.piezas;
    const textoFacebook = `${piezas.facebook.copy}\n\n${enlaceNoticia}`;
    const textoInstagram = `${piezas.instagram.copy}\n\n${piezas.instagram.hashtags.join(' ')}`.slice(0, 2200);

    if (simular) {
      resultados.push({ id: v.id, estado: 'simulación: todo listo, no se publicó nada', archivo: url, bytes: Number(head.headers.get('content-length') ?? 0), tipo: head.headers.get('content-type'), textoFacebook, textoInstagram });
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
          if (e.codigo === 'FINISHED') { ig.id = (await publicarContenedor(ig.containerId)).id; ig.ok = true; delete ig.error; break; }
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

  return res.status(200).json({ simulacion: simular, resultados });
}
