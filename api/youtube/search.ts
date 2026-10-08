// GET /api/youtube/search?seccion=recetas|noticias&categoria=<id>
// Busca en YouTube (solo videos incrustables, en español), pasa cada uno por el filtro de Gemini y
// devuelve únicamente los aprobados. Ningún video se guarda: el sitio solo los incrusta con iframe.
import { moderar, pareceComercial, queriesPara, Seccion, VideoAprobado } from '../_lib/youtube.js';

const MAX_VIDEOS = 6;

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

    // La CDN de Vercel guarda la respuesta 24 h: cero impacto en la cuota por visita.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
    return res.status(200).json({ videos });
  } catch {
    return res.status(200).json({ videos: [] });
  }
}
