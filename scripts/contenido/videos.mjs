// Video de relleno: los días que no sale una receta o una noticia, se publica un video de YouTube en su lugar.
// El video solo se incrusta (iframe); aquí únicamente se guarda su ID en src/content/videos/<fecha>-<seccion>.json.
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, ROOT } from './config.mjs';
import { generarJson } from './gemini.mjs';
import { leerCarpetaJson, log } from './util.mjs';
import { CANALES_DE_CONFIANZA, QUERIES, SENALES_COMERCIALES, SYSTEM_PROMPT } from './youtubeReglas.mjs';

export const CARPETA_VIDEOS = path.join(ROOT, 'src', 'content', 'videos');
const MAX_CANDIDATOS = 8;
const SITIO = 'https://www.freshpickfruits.com';

const ESQUEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['approved', 'rejected'] },
    reason: { type: 'string' },
    rule: { type: 'string' }
  },
  required: ['status', 'reason', 'rule']
};

async function youtube(ruta, params) {
  const url = `https://www.googleapis.com/youtube/v3/${ruta}?${new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY_2 || process.env.YOUTUBE_API_KEY })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube ${ruta}: HTTP ${res.status}`);
  return res.json();
}

/** IDs que ya se usaron: videos de relleno anteriores y los destacados fijos de src/data/featuredVideos.ts. */
function idsUsados() {
  const usados = new Set(leerCarpetaJson(CARPETA_VIDEOS).map(v => v.id));
  try {
    const fijos = fs.readFileSync(path.join(ROOT, 'src', 'data', 'featuredVideos.ts'), 'utf8');
    for (const m of fijos.matchAll(/id:\s*'([\w-]{11})'/g)) usados.add(m[1]);
  } catch {
    /* sin archivo: no hay destacados que excluir */
  }
  return usados;
}

/** Un solo video por día, de cualquier sección. */
function hayVideoHoy(fecha) {
  try {
    return fs.readdirSync(CARPETA_VIDEOS).some(f => f.startsWith(`${fecha}-`) && f.endsWith('.json'));
  } catch {
    return false;
  }
}

/** YouTube marca como 'creativeCommon' (CC BY) los videos que se pueden reutilizar citando al autor. */
async function esCreativeCommons(id) {
  try {
    const d = await youtube('videos', { part: 'status', id });
    return d.items?.[0]?.status?.license === 'creativeCommon';
  } catch {
    return false;
  }
}

const aCandidato = i => ({
  id: i.id?.videoId,
  title: String(i.snippet?.title ?? ''),
  description: String(i.snippet?.description ?? ''),
  channel: String(i.snippet?.channelTitle ?? '')
});

async function deCanalesDeConfianza() {
  const out = [];
  for (const handle of CANALES_DE_CONFIANZA) {
    try {
      const channelId = (await youtube('channels', { part: 'id', forHandle: handle })).items?.[0]?.id;
      if (!channelId) continue;
      const data = await youtube('search', {
        part: 'snippet', channelId, q: 'arándanos', type: 'video', videoEmbeddable: 'true', order: 'date', maxResults: '10'
      });
      for (const i of data.items ?? []) {
        const c = aCandidato(i);
        if (c.id && /ar[aá]ndano/i.test(`${c.title} ${c.description}`)) out.push(c);
      }
    } catch (err) {
      log(`   (canal de confianza ${handle} no disponible: ${err.message})`);
    }
  }
  return out;
}

/**
 * Respaldo sin clave de YouTube en GitHub: pide los videos ya aprobados a la búsqueda del propio sitio
 * (api/youtube/search, que usa la clave de Vercel y el filtro de Gemini). No sabe de licencias CC.
 */
async function deSitio(seccion, fecha, desplazamiento = 0) {
  const categorias = Object.keys(QUERIES[seccion]).filter(k => k !== '_default');
  const dia = Math.floor(Date.parse(fecha) / 86_400_000);
  const categoria = categorias[(dia + desplazamiento) % categorias.length];
  const res = await fetch(`${SITIO}/api/youtube/search?seccion=${seccion}&categoria=${encodeURIComponent(categoria)}`);
  if (!res.ok) throw new Error(`búsqueda del sitio: HTTP ${res.status}`);
  const data = await res.json();
  return (data.videos ?? []).filter(v => v.id).map(v => ({ id: v.id, title: String(v.title ?? ''), description: '', channel: String(v.channel ?? '') }));
}

async function deBusqueda(seccion, fecha, { soloCC = false } = {}) {
  const todas = Object.values(QUERIES[seccion]).flat();
  const dia = Math.floor(Date.parse(fecha) / 86_400_000);
  const q = todas[dia % todas.length]; // cambia de búsqueda cada día
  const data = await youtube('search', {
    part: 'snippet', q, type: 'video', videoEmbeddable: 'true', relevanceLanguage: 'es', regionCode: 'CO',
    safeSearch: 'strict', maxResults: '15', ...(soloCC ? { videoLicense: 'creativeCommon' } : {})
  });
  return (data.items ?? []).map(aCandidato).filter(c => c.id && !SENALES_COMERCIALES.test(`${c.channel} ${c.title} ${c.description.slice(0, 600)}`));
}

/** Fail-closed: si Gemini falla o duda, el video se descarta. */
async function aprobado(c) {
  try {
    const r = await generarJson({
      nombre: `moderar video ${c.id}`,
      sistema: JSON.stringify(SYSTEM_PROMPT),
      prompt: `<video>\ncanal: ${c.channel}\ntítulo: ${c.title}\ndescripción: ${c.description.slice(0, 1500)}\n</video>`,
      schema: ESQUEMA,
      temperatura: 0
    });
    if (r.status !== 'approved') log(`   Video descartado "${c.title}" (${c.channel}): ${r.reason}`);
    return r.status === 'approved';
  } catch (err) {
    if (err.fatal) throw err;
    log(`   Video sin moderar, se descarta "${c.title}": ${err.message}`);
    return false;
  }
}

/**
 * Elige un video nuevo para la sección ('recetas' | 'noticias'). Devuelve { pieza, archivos } o null.
 * Primero los canales de confianza (Dr. Carlos Jaramillo); luego la búsqueda, con filtro de Gemini.
 */
export async function crearVideoRelleno(seccion, { fecha, yaEnRevision = [] }) {
  const ruta = path.join('src', 'content', 'videos', `${fecha}-${seccion}.json`);
  if (hayVideoHoy(fecha)) return null; // ya hay uno hoy (un solo video por día)

  const usados = idsUsados();
  for (const id of yaEnRevision) usados.add(id);
  let elegido = null;
  let licencia = 'youtube-estandar';

  // Sin clave de YouTube en GitHub: se usa la búsqueda del sitio (usa la clave de Vercel; sin preferencia por licencia CC).
  const sinClave = !(process.env.YOUTUBE_API_KEY_2 || process.env.YOUTUBE_API_KEY);
  if (sinClave) {
    log('   Sin YOUTUBE_API_KEY en GitHub: se usa la búsqueda del sitio (sin preferencia por licencia CC).');
    const total = Object.keys(QUERIES[seccion]).filter(k => k !== '_default').length;
    for (let k = 0; k < total && !elegido; k++) {
      elegido = (await deSitio(seccion, fecha, k)).find(c => !usados.has(c.id)) ?? null;
    }
  }

  // 1) Preferencia: videos Creative Commons (CC BY), que luego se pueden republicar en redes citando al autor.
  const conCC = sinClave ? [] : (await deBusqueda(seccion, fecha, { soloCC: true })).filter(c => !usados.has(c.id)).slice(0, MAX_CANDIDATOS);
  for (const c of conCC) {
    if ((await aprobado(c)) && (await esCreativeCommons(c.id))) {
      elegido = c;
      licencia = 'cc-by';
      break;
    }
  }

  // 2) Canales de confianza (solo noticias).
  if (!sinClave && !elegido && seccion === 'noticias') {
    const confianza = (await deCanalesDeConfianza()).filter(c => !usados.has(c.id));
    if (confianza.length) {
      elegido = confianza[0];
      licencia = 'canal-de-confianza';
    }
  }

  // 3) Búsqueda normal (se incrusta en el sitio; no se puede republicar sin permiso).
  if (!sinClave && !elegido) {
    const candidatos = (await deBusqueda(seccion, fecha)).filter(c => !usados.has(c.id)).slice(0, MAX_CANDIDATOS);
    for (const c of candidatos) {
      if (await aprobado(c)) {
        elegido = c;
        break;
      }
    }
  }
  if (!elegido) return null;

  const pieza = { seccion, id: elegido.id, title: elegido.title, channel: elegido.channel, date: fecha, motivo: 'relleno', licencia, republicable: licencia === 'cc-by' };
  return { pieza, archivos: [{ ruta, contenido: JSON.stringify(pieza, null, 2) + '\n' }] };
}
