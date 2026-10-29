import { loadArticle, loadArticleIndex, loadRecipe, loadRecipeIndex } from '../data/content';
import { matchContentRoute } from './routes';

/** Carga los datos que necesita una ruta antes de mostrarla, para que las páginas lean sin esperas. */
export function preloadRoute(pathname: string): Promise<unknown> {
  // La portada muestra las últimas noticias y recetas destacadas: el primer pintado debe traerlas, igual que el HTML prerenderizado.
  if (pathname === '/') return Promise.all([loadRecipeIndex(), loadArticleIndex()]);
  const route = matchContentRoute(pathname);
  if (!route) return Promise.resolve();
  switch (route.type) {
    case 'recetas-biblioteca':
      return loadRecipeIndex();
    case 'noticias-biblioteca':
      return loadArticleIndex();
    case 'recetas-detalle':
      return Promise.all([loadRecipe(route.slug), loadRecipeIndex()]);
    case 'noticias-detalle':
      // El índice de recetas alimenta las "recetas relacionadas" del artículo.
      return Promise.all([loadArticle(route.slug), loadArticleIndex(), loadRecipeIndex()]);
  }
}
