import { BLOG_ARTICLES } from '../data/blog';
import { RECIPES, recipeCategories, recipeTotalMinutes } from '../data/recipes';
import { articleTagIds, normalize, recipeTagIds, tagLabel } from './tagging.mjs';
import { LibraryEntry } from './library';

const byNewest = (a: LibraryEntry, b: LibraryEntry) => b.date.localeCompare(a.date);

/** Una entrada por noticia publicada, con etiquetas automáticas y texto de búsqueda. */
export const ARTICLE_ENTRIES: LibraryEntry[] = BLOG_ARTICLES.map(a => {
  const tags: string[] = articleTagIds(a);
  const headings = a.blocks.filter(b => b.type === 'h2' || b.type === 'h3').map(b => ('text' in b ? b.text : ''));
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    date: a.date,
    categories: [a.category],
    tags,
    search: normalize([a.title, a.excerpt, a.metaDescription, ...headings, ...tags.map(tagLabel)].join(' ')),
    minutes: undefined
  };
}).sort(byNewest);

/** Una entrada por receta publicada; la búsqueda incluye los ingredientes. */
export const RECIPE_ENTRIES: LibraryEntry[] = RECIPES.map(r => {
  const tags: string[] = recipeTagIds(r);
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    date: r.date ?? '',
    categories: recipeCategories(r),
    tags,
    search: normalize([r.title, r.excerpt, ...r.ingredients.map(i => i.text), ...tags.map(tagLabel)].join(' ')),
    minutes: recipeTotalMinutes(r),
    difficulty: r.difficulty
  };
}).sort(byNewest);
