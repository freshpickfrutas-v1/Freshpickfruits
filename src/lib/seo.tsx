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

interface PageMeta {
  title: string;
  description: string;
  /** Path starting with "/", e.g. "/recetas". */
  path: string;
  image?: string;
  type?: 'website' | 'article';
}

/** Sets per-page <title>, description, canonical and Open Graph tags. */
export function usePageMeta({ title, description, path, image, type = 'website' }: PageMeta) {
  useEffect(() => {
    const defaultDescription =
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '';
    const url = `${SITE_URL}${path}`;
    const imageUrl = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/logo.jpg`;
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setCanonical(url);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]', 'name', 'description', defaultDescription);
      setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
      setCanonical(`${SITE_URL}/`);
    };
  }, [title, description, path, image, type]);
}

/** Renders a JSON-LD <script> block for structured data (Recipe, BlogPosting, etc.). */
export const JsonLd: React.FC<{ data: object }> = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
);
