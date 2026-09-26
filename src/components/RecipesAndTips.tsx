import React from 'react';
import { BookOpen, ArrowRight, Newspaper } from 'lucide-react';
import { RECIPES, RECIPE_CATEGORIES } from '../data/recipes';
import { RecipeCard } from './RecipeCard';

/** Home page teaser: featured recipes with links to the full Recetas and Blog pages. */
export const RecipesAndTips: React.FC = () => {
  const featured = RECIPES.filter(r => r.featured).slice(0, 3);

  return (
    <section id="recetas-tips" className="py-12 sm:py-16 bg-[#F7F5F0]/80 backdrop-blur-[2px] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#7B4382]" />
            <span>Recetas con Arándanos de Alta Montaña</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F183C] tracking-tight font-display">
            Recetas fáciles con arándanos Fresh Pick
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-700">
            Smoothies, desayunos, postres saludables, ensaladas y más: ideas para disfrutar tus arándanos todos los días.
          </p>
        </div>

        {/* Category shortcuts */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {RECIPE_CATEGORIES.map(c => (
            <a
              key={c.id}
              href={`/recetas?categoria=${c.id}`}
              className="px-3 py-1.5 rounded-full bg-white border border-[#DFCEE6] text-xs font-semibold text-[#2F183C] hover:border-[#7B4382] hover:text-[#7B4382] transition-colors"
            >
              {c.emoji} {c.name}
            </a>
          ))}
        </div>

        {/* Featured recipes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map(recipe => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <a
            href="/recetas"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 fp-btn-primary text-sm"
          >
            <span>Ver todas las recetas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/noticias"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 fp-btn-secondary text-sm"
          >
            <Newspaper className="w-4 h-4" />
            <span>Ver noticias de arándanos</span>
          </a>
        </div>

      </div>
    </section>
  );
};
