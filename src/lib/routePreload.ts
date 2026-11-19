import { loadArticle, loadArticleIndex, loadRecipe, loadRecipeIndex } from '../data/content';
import { matchContentRoute } from './routes';
import { splitLang } from './i18n';

/** Carga los datos que necesita una ruta antes de mostrarla, para que las páginas lean sin esperas. */
export function preloadRoute(rawPathname: string): Promise<unknown> {
  const { lang, path: pathname } = splitLang(rawPathname);
  // La portada muestra las últimas noticias y recetas destacadas: el primer pintado debe traerlas, igual que el HTML prerenderizado.
  if (pathname === '/') return Promise.all([loadRecipeIndex(lang), loadArticleIndex(lang)]);
  const route = matchContentRoute(pathname);
  if (!route) return Promise.resolve();
  switch (route.type) {
    case 'recetas-biblioteca':
      return loadRecipeIndex(lang);
    case 'noticias-biblioteca':
      return loadArticleIndex(lang);
    case 'recetas-detalle':
      return Promise.all([loadRecipe(route.slug, lang), loadRecipeIndex(lang)]);
    case 'noticias-detalle':
      // El índice de recetas alimenta las "recetas relacionadas" del artículo.
      return Promise.all([loadArticle(route.slug, lang), loadArticleIndex(lang), loadRecipeIndex(lang)]);
  }
}
