// Contenido de recetas y noticias, cargado bajo demanda desde /data (ver scripts/generar-contenido.mjs).
//
// - El índice (resumen liviano de todo lo publicado) alimenta los listados, filtros y búsqueda.
// - Cada receta o noticia completa se pide solo cuando se abre.
// - Todo queda en memoria; las páginas leen de forma síncrona. Antes de mostrar una ruta se precarga
//   lo que necesita (ver lib/routePreload.ts). En el prerender, el script de build llena este almacén.
import { useEffect, useState } from 'react';
import { ArticleSummary, BlogArticle, Recipe, RecipeSummary } from '../types';

interface Store {
  recetasIndex?: RecipeSummary[];
  noticiasIndex?: ArticleSummary[];
  recipes: Map<string, Recipe | null>;
  articles: Map<string, BlogArticle | null>;
}

const store: Store = { recipes: new Map(), articles: new Map() };
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

export const loadRecipeIndex = () =>
  store.recetasIndex ? Promise.resolve() : once<RecipeSummary[]>('/data/recetas-index.json', d => { if (d) store.recetasIndex = d; });

export const loadArticleIndex = () =>
  store.noticiasIndex ? Promise.resolve() : once<ArticleSummary[]>('/data/noticias-index.json', d => { if (d) store.noticiasIndex = d; });

export const loadRecipe = (slug: string) =>
  store.recipes.has(slug) ? Promise.resolve() : once<Recipe>(`/data/recetas/${encodeURIComponent(slug)}.json`, d => { store.recipes.set(slug, d); });

export const loadArticle = (slug: string) =>
  store.articles.has(slug) ? Promise.resolve() : once<BlogArticle>(`/data/noticias/${encodeURIComponent(slug)}.json`, d => { store.articles.set(slug, d); });

/** Índice de recetas publicadas, de la más reciente a la más antigua. Vacío mientras no se haya cargado. */
export const recipeIndex = (): RecipeSummary[] => store.recetasIndex ?? [];
export const articleIndex = (): ArticleSummary[] => store.noticiasIndex ?? [];
export const getRecipe = (slug: string): Recipe | undefined => store.recipes.get(slug) ?? undefined;
export const getArticle = (slug: string): BlogArticle | undefined => store.articles.get(slug) ?? undefined;
export const getRecipeSummary = (slug: string) => recipeIndex().find(r => r.slug === slug);

/** Llena el almacén sin pasar por la red (prerender en el build). */
export function seedContent(data: { recetas: Recipe[]; noticias: BlogArticle[]; recetasIndex: RecipeSummary[]; noticiasIndex: ArticleSummary[] }) {
  store.recetasIndex = data.recetasIndex;
  store.noticiasIndex = data.noticiasIndex;
  data.recetas.forEach(r => store.recipes.set(r.slug, r));
  data.noticias.forEach(a => store.articles.set(a.slug, a));
}

function useIndex<T>(read: () => T[], load: () => Promise<void>, loaded: () => boolean): T[] | null {
  const [, force] = useState(0);
  useEffect(() => {
    if (!loaded()) load().then(() => force(n => n + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return loaded() ? read() : null;
}

/** Para secciones de la portada: pide el índice si aún no está y devuelve null mientras llega. */
export const useRecipeIndex = () => useIndex(recipeIndex, loadRecipeIndex, () => !!store.recetasIndex);
export const useArticleIndex = () => useIndex(articleIndex, loadArticleIndex, () => !!store.noticiasIndex);
