import { Recipe, RecipeCategory, RecipeCategoryId, RecipeSummary } from '../types';
import { recipeCategoryIds, recipeTotalMinutes as totalMinutes } from '../lib/archive.mjs';

export const RECIPE_CATEGORIES: RecipeCategory[] = [
  {
    id: 'smoothies-batidos',
    name: 'Smoothies y Batidos',
    description: 'Batidos cremosos y llenos de color con arándanos frescos de alta montaña.',
    emoji: '🥤'
  },
  {
    id: 'desayunos',
    name: 'Desayunos',
    description: 'Empieza el día con arándanos: bowls, panqueques, avenas y más.',
    emoji: '🥞'
  },
  {
    id: 'postres-saludables',
    name: 'Postres Saludables',
    description: 'Dulces más livianos donde el arándano es el protagonista.',
    emoji: '🍰'
  },
  {
    id: 'snacks-meriendas',
    name: 'Snacks y Meriendas',
    description: 'Opciones prácticas para la lonchera, la oficina o media tarde.',
    emoji: '🥣'
  },
  {
    id: 'ensaladas-platos-frescos',
    name: 'Ensaladas y Platos Frescos',
    description: 'El toque dulce y ácido del arándano en platos salados y frescos.',
    emoji: '🥗'
  },
  {
    id: 'bebidas-refrescos',
    name: 'Bebidas y Refrescos',
    description: 'Aguas saborizadas, refrescos y bebidas frías sin complicaciones.',
    emoji: '🧊'
  },
  {
    id: 'preparaciones-conservas',
    name: 'Preparaciones y Conservas',
    description: 'Mermeladas, compotas y salsas para tener arándanos toda la semana.',
    emoji: '🍯'
  },
  {
    id: 'recetas-rapidas',
    name: 'Recetas Rápidas (15 min o menos)',
    description: 'Todo listo en 15 minutos o menos, ideal para el día a día.',
    emoji: '⏱️'
  }
];

/** Total time including rest; a recipe is "rápida" when this is 15 minutes or less. */
export function recipeTotalMinutes(recipe: Pick<Recipe, 'prepMinutes' | 'cookMinutes' | 'restMinutes'>): number {
  return totalMinutes(recipe);
}

export function recipeCategories(recipe: Pick<RecipeSummary, 'category' | 'extraCategories' | 'prepMinutes' | 'cookMinutes' | 'restMinutes'>): RecipeCategoryId[] {
  return recipeCategoryIds(recipe) as RecipeCategoryId[];
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function getRecipeCategory(id: RecipeCategoryId) {
  return RECIPE_CATEGORIES.find(c => c.id === id)!;
}
