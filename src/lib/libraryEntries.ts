import { ArticleSummary, RecipeSummary } from '../types';
import { recipeCategories, recipeTotalMinutes } from '../data/recipes';
import { LibraryEntry } from './library';

// Los índices llegan ordenados (más reciente primero); se reutiliza el resultado mientras el índice no cambie.
const cache = new WeakMap<object, LibraryEntry[]>();

function memo<T extends object>(index: T[], build: () => LibraryEntry[]) {
  let entries = cache.get(index);
  if (!entries) {
    entries = build();
    cache.set(index, entries);
  }
  return entries;
}

/** Entradas de la biblioteca de noticias a partir del índice cargado. */
export const articleEntries = (index: ArticleSummary[]): LibraryEntry[] =>
  memo(index, () =>
    index.map(a => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      date: a.date,
      categories: [a.category],
      tags: a.tags,
      search: a.search
    }))
  );

/** Entradas de la biblioteca de recetas a partir del índice cargado. */
export const recipeEntries = (index: RecipeSummary[]): LibraryEntry[] =>
  memo(index, () =>
    index.map(r => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      date: r.date ?? '',
      categories: recipeCategories(r),
      tags: r.tags,
      search: r.search,
      minutes: recipeTotalMinutes(r),
      difficulty: r.difficulty
    }))
  );
