// Caché de 24 h en localStorage de los videos ya aprobados (solo IDs y títulos, nunca el video).
const TTL_MS = 24 * 60 * 60 * 1000;
const PREFIX = 'fp_yt_';

export interface CachedVideo {
  id: string;
  title: string;
  channel: string;
}

export function readCache(key: string): CachedVideo[] | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (typeof t !== 'number' || Date.now() - t > TTL_MS || !Array.isArray(v)) return null;
    return v;
  } catch {
    return null;
  }
}

export function writeCache(key: string, videos: CachedVideo[]) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: videos }));
  } catch {
    /* modo privado o almacenamiento lleno: se ignora */
  }
}
