import React, { createContext, useContext } from 'react';

/**
 * Idioma del sitio. Español en la raíz (`/recetas`), inglés bajo `/en` (`/en/recetas`).
 * El idioma sale de la URL, así el HTML prerenderizado y el navegador siempre coinciden.
 * Los textos se escriben junto a su traducción: `t('Hola', 'Hello')`.
 */
export type Lang = 'es' | 'en';

export const LANG_STORAGE_KEY = 'fp-lang';

/** Separa el prefijo de idioma: "/en/recetas" → { lang: 'en', path: '/recetas' }. */
export function splitLang(pathname: string): { lang: Lang; path: string } {
  const m = pathname.match(/^\/en(\/.*)?$/);
  return m ? { lang: 'en', path: m[1] || '/' } : { lang: 'es', path: pathname || '/' };
}

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');
const hasLangPrefix = (href: string) => /^\/en(?:[/?#]|$)/.test(href);

/** Agrega el prefijo de idioma a un enlace interno ("/recetas?q=a#x" → "/en/recetas?q=a#x"). */
export function withLang(href: string, lang: Lang): string {
  if (lang !== 'en' || !isInternal(href) || hasLangPrefix(href)) return href;
  // El panel del equipo solo existe en español.
  if (/^\/admin(?:[/?#]|$)/.test(href)) return href;
  if (href === '/') return '/en';
  if (href.startsWith('/#') || href.startsWith('/?')) return `/en${href.slice(1)}`;
  return `/en${href}`;
}

/** Quita el prefijo de idioma de un enlace interno. */
export function withoutLang(href: string): string {
  if (!hasLangPrefix(href)) return href;
  const rest = href.slice(3);
  return rest === '' ? '/' : rest.startsWith('/') ? rest : `/${rest}`;
}

/** Mismo enlace en el otro idioma (para el selector ES | EN). */
export function switchLangHref(href: string, to: Lang): string {
  return withLang(withoutLang(href), to);
}

const LangContext = createContext<Lang>('es');

export const LangProvider: React.FC<{ lang: Lang; children: React.ReactNode }> = ({ lang, children }) => (
  <LangContext.Provider value={lang}>{children}</LangContext.Provider>
);

export const useLang = (): Lang => useContext(LangContext);

/** `const t = useT(); t('Hola', 'Hello')` — devuelve el texto del idioma activo. */
export function useT() {
  const lang = useLang();
  return <T,>(es: T, en: T): T => (lang === 'en' ? en : es);
}

/** Enlace interno ya traducido al idioma activo (para href de <a>). */
export function useHref() {
  const lang = useLang();
  return (href: string) => withLang(href, lang);
}

export const dateLocale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-CO');
