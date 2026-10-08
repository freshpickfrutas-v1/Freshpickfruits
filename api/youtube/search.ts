// GET /api/youtube/search?seccion=recetas|noticias&categoria=<id>
// Busca en YouTube (solo videos incrustables, en español), pasa cada uno por el filtro de Gemini y
// devuelve únicamente los aprobados. Ningún video se guarda: el sitio solo los incrusta con iframe.
import { CANALES_DE_CONFIANZA, moderar, pareceComercial, queriesPara, Seccion, VideoAprobado } from '../_lib/youtube.js';

const MAX_VIDEOS = 6;

const idsDeCanal = new Map<string, string | null>();

/** Videos de arándanos de los canales de confianza (p. ej. el Dr. Carlos Jaramillo), los más recientes primero. */
async function videosDeConfianza(key: string): Promise<VideoAprobado[]> {
  const out: VideoAprobado[] = [];
  for (const handle of CANALES_DE_CONFIANZA) {
    try {
      if (!idsDeCanal.has(handle)) {
        const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${key}`);
        idsDeCanal.set(handle, (await r.json()).items?.[0]?.id ?? null);
      }
      const channelId = idsDeCanal.get(handle);
      if (!channelId) continue;
      const params = new URLSearchParams({
        part: 'snippet', channelId, q: 'arándanos', type: 'video', videoEmbeddable: 'true',
        order: 'date', maxResults: '10', key
      });
      const data = await (await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)).json();
      for (const i of data.items ?? []) {
        const title = String(i.snippet?.title ?? '');
        const desc = String(i.snippet?.description ?? '');
        if (i.id?.videoId && /ar[aá]ndano/i.test(`${title} ${desc}`)) {
          out.push({ id: i.id.videoId, title, channel: String(i.snippet?.channelTitle ?? '') });
        }
      }
    } catch {
      /* si falla, solo se omiten estos videos */
    }
  }
  return out;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const key = process.env.YOUTUBE_API_KEY;
  // Sin claves configuradas el sitio solo muestra los videos destacados.
  if (!key || !process.env.GEMINI_API_KEY) return res.status(200).json({ videos: [] });

  const seccion: Seccion = req.query?.seccion === 'noticias' ? 'noticias' : 'recetas';
  const categoria = String(req.query?.categoria ?? '').slice(0, 60);
  const queries = queriesPara(seccion, categoria);
  const q = queries[Math.floor(Date.now() / 86_400_000) % queries.length]; // alterna la búsqueda cada día

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q,
      type: 'video',
      videoEmbeddable: 'true',
      relevanceLanguage: 'es',
      regionCode: 'CO',
      safeSearch: 'strict',
      maxResults: '10',
      key
    });
    const yt = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!yt.ok) return res.status(200).json({ videos: [] });
    const data = await yt.json();

    const candidatos = (data.items ?? [])
      .map((i: any) => ({
        id: i.id?.videoId as string,
        title: String(i.snippet?.title ?? ''),
        description: String(i.snippet?.description ?? ''),
        channel: String(i.snippet?.channelTitle ?? '')
      }))
      .filter((v: any) => v.id && !pareceComercial(v));

    const veredictos = await Promise.all(candidatos.map((v: any) => moderar(v)));
    const videos: VideoAprobado[] = candidatos
      .filter((_: any, i: number) => veredictos[i].status === 'approved')
      .slice(0, MAX_VIDEOS)
      .map((v: any) => ({ id: v.id, title: v.title, channel: v.channel }));

    const confianza = seccion === 'noticias' ? await videosDeConfianza(key) : [];
    const vistos = new Set(confianza.map(v => v.id));
    const todos = [...confianza, ...videos.filter(v => !vistos.has(v.id))].slice(0, MAX_VIDEOS);

    // La CDN de Vercel guarda la respuesta 24 h: cero impacto en la cuota por visita.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
    return res.status(200).json({ videos: todos });
  } catch {
    return res.status(200).json({ videos: [] });
  }
}
