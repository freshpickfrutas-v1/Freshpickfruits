/** Rutas de contenido (biblioteca y detalle). Las usan App, la precarga de datos y el prerender. */
export type ContentRoute =
  | { type: 'recetas-biblioteca' }
  | { type: 'recetas-detalle'; slug: string }
  | { type: 'noticias-biblioteca' }
  | { type: 'noticias-detalle'; slug: string };

// /<sección>, /<sección>/pagina/2, /<sección>/2026[/10][/pagina/2], /<sección>/categoria/x, /<sección>/etiqueta/x
const library = (section: string) =>
  new RegExp(`^/${section}(/(pagina|categoria|etiqueta)/.+|/\\d{4}(/\\d{1,2})?(/pagina/\\d+)?)?$`);
const RECIPES_LIBRARY = library('recetas');
const NEWS_LIBRARY = library('noticias');

export function matchContentRoute(pathname: string): ContentRoute | null {
  if (RECIPES_LIBRARY.test(pathname)) return { type: 'recetas-biblioteca' };
  if (NEWS_LIBRARY.test(pathname)) return { type: 'noticias-biblioteca' };
  const recipe = pathname.match(/^\/recetas\/([^/]+)$/);
  if (recipe) return { type: 'recetas-detalle', slug: decodeURIComponent(recipe[1]) };
  const article = pathname.match(/^\/noticias\/([^/]+)$/);
  if (article) return { type: 'noticias-detalle', slug: decodeURIComponent(article[1]) };
  return null;
}
