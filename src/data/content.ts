// Contenido de recetas y noticias, cargado bajo demanda desde /data (ver scripts/generar-contenido.mjs).
//
// - El índice (resumen liviano de todo lo publicado) alimenta los listados, filtros y búsqueda.
// - Cada receta o noticia completa se pide solo cuando se abre.
// - Todo queda en memoria; las páginas leen de forma síncrona. Antes de mostrar una ruta se precarga
//   lo que necesita (ver lib/routePreload.ts). En el prerender, el script de build llena este almacén.
import { useEffect, useState } from 'react';
import { ArticleSummary, BlogArticle, Recipe, RecipeSummary } from '../types';
import { ContentKind, hiddenVersion, isHidden } from '../lib/hiddenContent';
import type { Lang } from '../lib/i18n';

interface Store {
  recetasIndex?: RecipeSummary[];
  noticiasIndex?: ArticleSummary[];
  recipes: Map<string, Recipe | null>;
  articles: Map<string, BlogArticle | null>;
}

const stores: Record<Lang, Store> = {
  es: { recipes: new Map(), articles: new Map() },
  en: { recipes: new Map(), articles: new Map() }
};
// Idioma que leen las páginas; lo fija App con la ruta que se está mostrando.
let current: Lang = 'es';
export const setContentLang = (lang: Lang) => { current = lang; };
const store = new Proxy({} as Store, { get: (_, key) => stores[current][key as keyof Store] , set: (_, key, value) => { (stores[current] as any)[key] = value; return true; } });
const dataDir = (lang: Lang) => (lang === 'en' ? '/data/en' : '/data');
const inflight = new Map<string, Promise<unknown>>();

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Una sola petición por URL aunque varias páginas la pidan a la vez. */
function once<T>(url: string, apply: (data: T | null) => void): Promise<void> {
  let request = inflight.get(url) as Promise<void> | undefined;
  if (!request) {
    request = fetchJson<T>(url).then(apply).finally(() => inflight.delete(url));
    inflight.set(url, request);
  }
  return request;
}

export const loadRecipeIndex = (lang: Lang = current) =>
  stores[lang].recetasIndex ? Promise.resolve() : once<RecipeSummary[]>(`${dataDir(lang)}/recetas-index.json`, d => { if (d) stores[lang].recetasIndex = d; });

export const loadArticleIndex = (lang: Lang = current) =>
  stores[lang].noticiasIndex ? Promise.resolve() : once<ArticleSummary[]>(`${dataDir(lang)}/noticias-index.json`, d => { if (d) stores[lang].noticiasIndex = d; });

export const loadRecipe = (slug: string, lang: Lang = current) =>
  stores[lang].recipes.has(slug) ? Promise.resolve() : once<Recipe>(`${dataDir(lang)}/recetas/${encodeURIComponent(slug)}.json`, d => { stores[lang].recipes.set(slug, d); });

export const loadArticle = (slug: string, lang: Lang = current) =>
  stores[lang].articles.has(slug) ? Promise.resolve() : once<BlogArticle>(`${dataDir(lang)}/noticias/${encodeURIComponent(slug)}.json`, d => { stores[lang].articles.set(slug, d); });

// El admin puede ocultar recetas y noticias (lib/hiddenContent.ts): el sitio no las muestra, pero siguen en la biblioteca.
const visibleCache = new WeakMap<object, { v: number; list: unknown[] }>();
function visible<T extends { slug: string }>(list: T[], tipo: ContentKind): T[] {
  const v = hiddenVersion();
  const hit = visibleCache.get(list);
  if (hit && hit.v === v) return hit.list as T[];
  const out = list.filter(i => !isHidden(tipo, i.slug));
  visibleCache.set(list, { v, list: out });
  return out;
}

/** Índice de recetas publicadas, de la más reciente a la más antigua. Vacío mientras no se haya cargado. */
export const recipeIndex = (): RecipeSummary[] => visible(store.recetasIndex ?? [], 'receta');
export const articleIndex = (): ArticleSummary[] => visible(store.noticiasIndex ?? [], 'noticia');
/** Todo lo publicado, incluso lo oculto por el admin (solo para el panel de administración). */
export const fullRecipeIndex = (): RecipeSummary[] => store.recetasIndex ?? [];
export const fullArticleIndex = (): ArticleSummary[] => store.noticiasIndex ?? [];
export const getRecipe = (slug: string): Recipe | undefined => (isHidden('receta', slug) ? undefined : store.recipes.get(slug) ?? undefined);
export const getArticle = (slug: string): BlogArticle | undefined => (isHidden('noticia', slug) ? undefined : store.articles.get(slug) ?? undefined);
export const getRecipeSummary = (slug: string) => recipeIndex().find(r => r.slug === slug);

/** Llena el almacén sin pasar por la red (prerender en el build). */
export function seedContent(data: { recetas: Recipe[]; noticias: BlogArticle[]; recetasIndex: RecipeSummary[]; noticiasIndex: ArticleSummary[] }, lang: Lang = 'es') {
  const target = stores[lang];
  target.recetasIndex = data.recetasIndex;
  target.noticiasIndex = data.noticiasIndex;
  data.recetas.forEach(r => target.recipes.set(r.slug, r));
  data.noticias.forEach(a => target.articles.set(a.slug, a));
}

function useIndex<T>(read: () => T[], load: (lang: Lang) => Promise<void>, loaded: () => boolean): T[] | null {
  const [, force] = useState(0);
  useEffect(() => {
    if (!loaded()) load(current).then(() => force(n => n + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return loaded() ? read() : null;
}

/** Para secciones de la portada: pide el índice si aún no está y devuelve null mientras llega. */
export const useRecipeIndex = () => useIndex(recipeIndex, loadRecipeIndex, () => !!store.recetasIndex);
export const useArticleIndex = () => useIndex(articleIndex, loadArticleIndex, () => !!store.noticiasIndex);
export const useFullRecipeIndex = () => useIndex(fullRecipeIndex, loadRecipeIndex, () => !!store.recetasIndex);
export const useFullArticleIndex = () => useIndex(fullArticleIndex, loadArticleIndex, () => !!store.noticiasIndex);
