import React from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { Recipe } from '../types';
import { formatMinutes, getRecipeCategory, recipeTotalMinutes } from '../data/recipes';
import { ContentImage } from './ContentImage';

export const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const category = getRecipeCategory(recipe.category);

  return (
    <a
      href={`/recetas/${recipe.slug}`}
      className="bg-white rounded-2xl border border-[#EADBEE] shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col group"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <ContentImage
          src={recipe.image}
          alt={recipe.imageAlt}
          label={category.name}
          emoji={category.emoji}
          className="group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-[#2F183C]/85 text-[#DDA83A] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#DDA83A]/30">
          <Clock className="w-3 h-3" />
          <span>{formatMinutes(recipeTotalMinutes(recipe))}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#7B4382] uppercase tracking-wider">
            {category.name}
          </span>
          <h3 className="text-lg font-bold text-[#2F183C] font-display mt-0.5 leading-snug">
            {recipe.title}
          </h3>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-3">
            {recipe.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-[#EADBEE] flex items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span>{recipe.difficulty}</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {recipe.servings}
            </span>
          </div>
          <span className="font-bold text-[#7B4382] group-hover:text-[#2F183C] flex items-center gap-0.5">
            Ver receta
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
};
