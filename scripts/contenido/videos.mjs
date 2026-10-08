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
  const url = `https://www.googleapis.com/youtube/v3/${ruta}?${new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY })}`;
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

async function deBusqueda(seccion, fecha) {
  const todas = Object.values(QUERIES[seccion]).flat();
  const dia = Math.floor(Date.parse(fecha) / 86_400_000);
  const q = todas[dia % todas.length]; // cambia de búsqueda cada día
  const data = await youtube('search', {
    part: 'snippet', q, type: 'video', videoEmbeddable: 'true', relevanceLanguage: 'es', regionCode: 'CO',
    safeSearch: 'strict', maxResults: '15'
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
export async function crearVideoRelleno(seccion, { fecha }) {
  if (!process.env.YOUTUBE_API_KEY) {
    log('   Sin YOUTUBE_API_KEY: no se puede buscar un video de relleno.');
    return null;
  }
  const ruta = path.join('src', 'content', 'videos', `${fecha}-${seccion}.json`);
  if (fs.existsSync(path.join(ROOT, ruta))) return null; // ya hay uno hoy

  const usados = idsUsados();
  let elegido = null;

  const confianza = (await deCanalesDeConfianza()).filter(c => !usados.has(c.id));
  if (seccion === 'noticias' && confianza.length) elegido = confianza[0];

  if (!elegido) {
    const candidatos = (await deBusqueda(seccion, fecha)).filter(c => !usados.has(c.id)).slice(0, MAX_CANDIDATOS);
    for (const c of candidatos) {
      if (await aprobado(c)) {
        elegido = c;
        break;
      }
    }
  }
  if (!elegido) return null;

  const pieza = { seccion, id: elegido.id, title: elegido.title, channel: elegido.channel, date: fecha, motivo: 'relleno' };
  return { pieza, archivos: [{ ruta, contenido: JSON.stringify(pieza, null, 2) + '\n' }] };
}
