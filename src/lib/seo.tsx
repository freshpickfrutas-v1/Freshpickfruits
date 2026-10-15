import React, { useEffect } from 'react';

export const SITE_URL = 'https://www.freshpickfruits.com';

const DEFAULT_TITLE = 'Fresh Pick - Arándanos Premium de Alta Montaña | Guasca, Colombia';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export interface PageMeta {
  title: string;
  description: string;
  /** Path starting with "/", e.g. "/recetas". */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  /** Páginas de búsqueda o filtros combinados: no se indexan, pero Google sigue sus enlaces. */
  noindex?: boolean;
}

/** Valores finales de las etiquetas <head> de una página (los usa el navegador y el prerender). */
export function resolvePageMeta({ title, description, path, image, type = 'website', noindex = false }: PageMeta) {
  const imageUrl = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/logo.jpg`;
  return { title, description, url: `${SITE_URL}${path}`, imageUrl, type, robots: noindex ? 'noindex, follow' : 'index, follow' };
}

// Prerender (Node): el hook no corre efectos, así que la página registra aquí su meta mientras se renderiza.
let collected: PageMeta | null = null;
export const resetCollectedMeta = () => { collected = null; };
export const takeCollectedMeta = () => collected;

/** Sets per-page <title>, description, canonical and Open Graph tags. */
export function usePageMeta(meta: PageMeta) {
  if (typeof window === 'undefined') collected = meta;

  const { title, description, path, image, type, noindex } = meta;
  useEffect(() => {
    const defaultDescription =
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '';
    const v = resolvePageMeta({ title, description, path, image, type, noindex });
    document.title = v.title;
    setMeta('meta[name="description"]', 'name', 'description', v.description);
    setCanonical(v.url);
    setMeta('meta[name="robots"]', 'name', 'robots', v.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', v.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', v.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', v.url);
    setMeta('meta[property="og:type"]', 'property', 'og:type', v.type);
    setMeta('meta[property="og:image"]', 'property', 'og:image', v.imageUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', v.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', v.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', v.imageUrl);
    return () => {
      setMeta('meta[name="robots"]', 'name', 'robots', 'index, follow');
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]', 'name', 'description', defaultDescription);
      setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
      setCanonical(`${SITE_URL}/`);
    };
  }, [title, description, path, image, type, noindex]);
}

/** Renders a JSON-LD <script> block for structured data (Recipe, BlogPosting, etc.). */
export const JsonLd: React.FC<{ data: object }> = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
);
