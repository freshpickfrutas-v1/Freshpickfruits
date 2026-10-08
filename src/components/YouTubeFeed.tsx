import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { FEATURED_VIDEOS } from '../data/featuredVideos';
import { CachedVideo, readCache, writeCache } from '../lib/youtubeCache';

interface Props {
  seccion: 'recetas' | 'noticias';
  /** Pestaña activa; 'todas' / 'todos' usa la búsqueda general de la sección. */
  categoria: string;
}

/** Videos destacados + los aprobados por Gemini para la pestaña activa. Solo iframes: nada se aloja en el servidor. */
export const YouTubeFeed: React.FC<Props> = ({ seccion, categoria }) => {
  const [dinamicos, setDinamicos] = useState<CachedVideo[]>([]);
  const [activo, setActivo] = useState<string | null>(null);

  useEffect(() => {
    const cat = categoria === 'todas' || categoria === 'todos' ? '' : categoria;
    const key = `${seccion}_${cat || 'general'}`;
    const cached = readCache(key);
    if (cached) {
      setDinamicos(cached);
      return;
    }
    setDinamicos([]);
    const ctrl = new AbortController();
    fetch(`/api/youtube/search?seccion=${seccion}&categoria=${encodeURIComponent(cat)}`, { signal: ctrl.signal })
      .then(r => (r.ok ? r.json() : { videos: [] }))
      .then(({ videos }: { videos: CachedVideo[] }) => {
        const lista = Array.isArray(videos) ? videos : [];
        if (lista.length) writeCache(key, lista);
        setDinamicos(lista);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [seccion, categoria]);

  const destacados = FEATURED_VIDEOS[seccion];
  const ids = new Set(destacados.map(v => v.id));
  const videos = [...destacados, ...dinamicos.filter(v => !ids.has(v.id))];

  return (
    <section className="mt-12 sm:mt-16" aria-label="Videos recomendados">
      <h2 className="text-xl sm:text-2xl font-bold font-display">
        {seccion === 'recetas' ? 'Recetas en video' : 'Salud y nutrición en video'}
      </h2>
      <p className="text-sm text-stone-600 mt-1">
        Videos de creadores independientes sobre bienestar, nutrición y cocina saludable con arándanos.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => (
          <figure key={v.id} className="bg-white rounded-2xl border border-[#EADBEE] shadow-sm overflow-hidden">
            <div className="relative aspect-video w-full bg-stone-100">
              {activo === v.id ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                  title={v.title}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setActivo(v.id)}
                  className="group absolute inset-0 h-full w-full cursor-pointer"
                  aria-label={`Reproducir: ${v.title}`}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2F183C]/90 text-[#DDA83A] shadow-lg">
                      <Play className="h-6 w-6 fill-current" />
                    </span>
                  </span>
                </button>
              )}
            </div>
            <figcaption className="p-4">
              <p className="text-sm font-semibold leading-snug text-[#2F183C]">{v.title}</p>
              <p className="mt-1 text-xs text-stone-500">{v.channel}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};
