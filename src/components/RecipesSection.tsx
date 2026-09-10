import React, { useState } from 'react';
import { recipes } from '../data/mockData';
import { Recipe } from '../types';
import { BookOpen, Clock, ChevronRight, X, Utensils } from 'lucide-react';

export const RecipesSection: React.FC = () => {
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  return (
    <section id="recetas-tips" className="py-16 sm:py-24 bg-stone-50/70 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Inspiración Culinaria & Consejos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            Recetas Saludables con Fresh Pick Frutas
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600">
            Descubre formas deliciosas de integrar arándanos, moras y frambuesas frescas en tus desayunos, meriendas y postres gourmet.
          </p>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={recipe.image || recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{recipe.prepTime}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    {recipe.difficulty}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 font-display mt-0.5">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {recipe.description || recipe.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    {recipe.ingredients.length} ingredientes
                  </span>
                  <button
                    onClick={() => setActiveRecipe(recipe)}
                    className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Receta</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recipe Detail Modal */}
        {activeRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">
              <div className="relative aspect-[16/8] bg-stone-900">
                <img
                  src={activeRecipe.image || activeRecipe.imageUrl}
                  alt={activeRecipe.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setActiveRecipe(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
                  aria-label="Cerrar receta"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-xs text-blue-300 font-semibold">
                    {activeRecipe.prepTime} · Dificultad {activeRecipe.difficulty}
                  </span>
                  <h3 className="text-xl font-bold font-display">{activeRecipe.title}</h3>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-stone-700 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-blue-700" />
                    <span>Ingredientes</span>
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                    {activeRecipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
                    Paso a paso:
                  </h4>
                  <ol className="space-y-2 list-decimal list-inside text-stone-600 leading-relaxed">
                    {activeRecipe.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 text-right">
                <button
                  onClick={() => setActiveRecipe(null)}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
