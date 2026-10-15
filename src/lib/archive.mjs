// Reglas de la biblioteca que comparten la web (TypeScript) y los scripts de build (Node):
// tamaño de página, qué páginas de archivo existen y cuáles se indexan.

/** Piezas por página en recetas y noticias. */
export const PAGE_SIZE = 12;

/** Una etiqueta solo tiene página indexable cuando agrupa al menos esta cantidad de piezas. */
export const MIN_TAG_PAGE_ITEMS = 3;

export const QUICK_RECIPE_MAX_MINUTES = 15;

export function recipeTotalMinutes(recipe) {
  return (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0) + (recipe.restMinutes ?? 0);
}

/** Categorías de una receta; "recetas-rapidas" se asigna sola con 15 minutos o menos. */
export function recipeCategoryIds(recipe) {
  const ids = [recipe.category, ...(recipe.extraCategories ?? [])];
  if (recipeTotalMinutes(recipe) <= QUICK_RECIPE_MAX_MINUTES) ids.push('recetas-rapidas');
  return ids;
}

/**
 * Páginas de archivo de una sección: año, mes, categoría y etiqueta (esta última solo con
 * MIN_TAG_PAGE_ITEMS o más piezas). Devuelve la ruta relativa (p. ej. "/2026/10") y las piezas que agrupa.
 */
export function archiveHubs(items, categoryIdsOf, tagIdsOf) {
  const groups = new Map();
  const add = (key, item) => groups.set(key, [...(groups.get(key) ?? []), item]);
  for (const item of items) {
    const [year, month] = (item.date ?? '').split('-');
    if (year && month) {
      add(`/${year}`, item);
      add(`/${year}/${month}`, item);
    }
    categoryIdsOf(item).forEach(c => add(`/categoria/${c}`, item));
    tagIdsOf(item).forEach(t => add(`/etiqueta/${t}`, item));
  }
  return [...groups.entries()]
    .filter(([key, group]) => !key.startsWith('/etiqueta/') || group.length >= MIN_TAG_PAGE_ITEMS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, group]) => ({ path, items: group }));
}
