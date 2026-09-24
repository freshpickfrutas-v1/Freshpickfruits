import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { RecipeCard } from '../components/RecipeCard';
import { OrderCta } from '../components/OrderCta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RECIPES, RECIPE_CATEGORIES, recipeCategories } from '../data/recipes';
import { RecipeCategoryId } from '../types';
import { JsonLd, SITE_URL, usePageMeta } from '../lib/seo';

type Filter = RecipeCategoryId | 'todas';

function readFilterFromUrl(): Filter {
  const param = new URLSearchParams(window.location.search).get('categoria');
  return RECIPE_CATEGORIES.some(c => c.id === param) ? (param as RecipeCategoryId) : 'todas';
}

export default function RecipesPage() {
  const [filter, setFilter] = useState<Filter>(readFilterFromUrl);

  usePageMeta({
    title: 'Recetas con Arándanos Frescos | Fresh Pick - Arándanos de Alta Montaña',
    description: 'Recetas fáciles y saludables con arándanos frescos: smoothies, desayunos, postres saludables, snacks, ensaladas, bebidas y conservas. Paso a paso con arándanos Fresh Pick.',
    path: '/recetas'
  });

  const selectFilter = (next: Filter) => {
    setFilter(next);
    // Keep the filter in the URL so it can be shared, without adding history entries.
    const url = next === 'todas' ? '/recetas' : `/recetas?categoria=${next}`;
    window.history.replaceState({}, '', url);
  };

  const visible = filter === 'todas' ? RECIPES : RECIPES.filter(r => recipeCategories(r).includes(filter));
  const activeCategory = RECIPE_CATEGORIES.find(c => c.id === filter);
  const countFor = (id: RecipeCategoryId) => RECIPES.filter(r => recipeCategories(r).includes(id)).length;

  return (
    <SiteShell>
      <section className="fp-gradient-hero border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-10 sm:pb-14">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Recetas' }]} />

          <div className="max-w-3xl mt-6">
            <div className="fp-pill text-xs shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>Recetas con Arándanos de Alta Montaña</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              Recetas con arándanos frescos
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-700 leading-relaxed">
              Ideas fáciles y deliciosas donde el arándano Fresh Pick es el protagonista: desde un smoothie de 5 minutos
              hasta postres, ensaladas y conservas para toda la semana.
            </p>
          </div>

          {/* Category filters */}
          <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
            <div className="flex sm:flex-wrap gap-2 w-max sm:w-auto pb-1" role="tablist" aria-label="Filtrar recetas por categoría">
              <FilterChip active={filter === 'todas'} onClick={() => selectFilter('todas')} label="Todas las recetas" count={RECIPES.length} />
              {RECIPE_CATEGORIES.map(c => (
                <FilterChip
                  key={c.id}
                  active={filter === c.id}
                  onClick={() => selectFilter(c.id)}
                  label={`${c.emoji} ${c.name}`}
                  count={countFor(c.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7F5F0]/90 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold font-display">
              {activeCategory ? activeCategory.name : 'Todas las recetas'}
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              {activeCategory ? activeCategory.description : 'Explora todas nuestras recetas con arándanos frescos de alta montaña.'}
            </p>
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visible.map(recipe => (
                <RecipeCard key={recipe.slug} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#DFCEE6] bg-white/70 p-10 text-center">
              <p className="text-3xl" aria-hidden="true">{activeCategory?.emoji}</p>
              <p className="mt-2 font-semibold text-[#2F183C]">Muy pronto tendremos recetas en esta categoría.</p>
              <button
                onClick={() => selectFilter('todas')}
                className="mt-3 text-sm font-bold text-[#7B4382] hover:text-[#2F183C] cursor-pointer"
              >
                Ver todas las recetas
              </button>
            </div>
          )}

          <div className="mt-12 sm:mt-16">
            <OrderCta
              title="¿Listo para cocinar? Pide tus arándanos Fresh Pick"
              whatsappMessage="Hola Fresh Pick, vi sus recetas y quiero pedir arándanos frescos"
            />
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Recetas con arándanos frescos Fresh Pick',
          itemListElement: RECIPES.map((r, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/recetas/${r.slug}`
          }))
        }}
      />
    </SiteShell>
  );
}

const FilterChip: React.FC<{ active: boolean; onClick: () => void; label: string; count: number }> = ({ active, onClick, label, count }) => (
  <button
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-[#2F183C] text-white border-[#2F183C] shadow-md'
        : 'bg-white text-[#2F183C] border-[#DFCEE6] hover:border-[#7B4382] hover:text-[#7B4382]'
    }`}
  >
    <span>{label}</span>
    <span className={`text-[11px] font-bold px-1.5 rounded-full ${active ? 'bg-[#DDA83A] text-[#2F183C]' : 'bg-[#F5ECF9] text-[#7B4382]'}`}>
      {count}
    </span>
  </button>
);
