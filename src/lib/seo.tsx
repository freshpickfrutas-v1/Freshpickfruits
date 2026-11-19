import React, { useEffect } from 'react';
import { Lang, useLang, withLang } from './i18n';

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

function setAlternates(alternates: { es: string; en: string }) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  for (const [hreflang, href] of [['es', alternates.es], ['en', alternates.en], ['x-default', alternates.es]]) {
    const el = document.createElement('link');
    el.rel = 'alternate';
    el.hreflang = hreflang;
    el.href = href;
    document.head.appendChild(el);
  }
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
  /** Lo completa usePageMeta con el idioma de la ruta. */
  lang?: Lang;
}

/** Valores finales de las etiquetas <head> de una página (los usa el navegador y el prerender). */
export function resolvePageMeta({ title, description, path, image, type = 'website', noindex = false, lang = 'es' }: PageMeta) {
  const imageUrl = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/logo.jpg`;
  const alternates = { es: `${SITE_URL}${path}`, en: `${SITE_URL}${withLang(path, 'en')}` };
  return { title, description, url: alternates[lang], alternates, lang, imageUrl, type, robots: noindex ? 'noindex, follow' : 'index, follow' };
}

// Prerender (Node): el hook no corre efectos, así que la página registra aquí su meta mientras se renderiza.
let collected: PageMeta | null = null;
export const resetCollectedMeta = () => { collected = null; };
export const takeCollectedMeta = () => collected;

/** Sets per-page <title>, description, canonical and Open Graph tags. */
export function usePageMeta(input: PageMeta) {
  const lang = useLang();
  const meta = { ...input, lang };
  if (typeof window === 'undefined') collected = meta;

  const { title, description, path, image, type, noindex } = meta;
  useEffect(() => {
    const defaultDescription =
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '';
    const v = resolvePageMeta({ title, description, path, image, type, noindex, lang });
    document.title = v.title;
    setMeta('meta[name="description"]', 'name', 'description', v.description);
    setCanonical(v.url);
    setMeta('meta[name="robots"]', 'name', 'robots', v.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', v.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', v.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', v.url);
    setMeta('meta[property="og:type"]', 'property', 'og:type', v.type);
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', lang === 'en' ? 'en_US' : 'es_CO');
    setAlternates(v.alternates);
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
  }, [title, description, path, image, type, noindex, lang]);
}

/** Renders a JSON-LD <script> block for structured data (Recipe, BlogPosting, etc.). */
export const JsonLd: React.FC<{ data: object }> = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
);
