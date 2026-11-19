import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { RecipeCard } from '../components/RecipeCard';
import { OrderCta } from '../components/OrderCta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { YouTubeFeed } from '../components/YouTubeFeed';
import { ActiveFilters, LibraryApi, LibrarySearch, LibrarySidebar, Pagination, ResultsBar, describeFilters } from '../components/LibraryControls';
import { visibleVideos } from '../data/featuredVideos';
import { recipeCategoriesFor } from '../data/recipes';
import { useLang, useT, withLang } from '../lib/i18n';
import { recipeIndex } from '../data/content';
import { recipeEntries } from '../lib/libraryEntries';
import {
  LibraryEntry,
  activeFilterCount,
  canonicalState,
  computeFacets,
  filterEntries,
  isIndexable,
  paginate,
  serializeLibraryUrl,
  sortEntries,
  useLibraryState
} from '../lib/library';
import { JsonLd, SITE_URL, usePageMeta } from '../lib/seo';

const BASE = '/recetas';

export default function RecipesPage() {
  const t = useT();
  const lang = useLang();
  const RECIPE_CATEGORIES = recipeCategoriesFor(lang);
  const lib = useLibraryState(BASE);
  const { state } = lib;
  const index = recipeIndex();
  const RECIPE_ENTRIES = recipeEntries(index);

  const facets = useMemo(() => computeFacets(RECIPE_ENTRIES, state), [state, RECIPE_ENTRIES]);
  const results = useMemo(() => sortEntries(filterEntries(RECIPE_ENTRIES, state), state, lang), [state, RECIPE_ENTRIES, lang]);
  const page = paginate<LibraryEntry>(results, state.pagina);
  const bySlug = new Map(index.map(r => [r.slug, r]));
  const recipes = page.items.map(e => bySlug.get(e.slug)!).filter(Boolean);

  const categoryName = (id: string) => RECIPE_CATEGORIES.find(c => c.id === id)?.name;
  const category = state.categoria ? RECIPE_CATEGORIES.find(c => c.id === state.categoria) : undefined;
  const filterParts = describeFilters(state, categoryName, lang);
  const isDefault = activeFilterCount(state) === 0 && state.orden === 'recientes';
  const heading = state.q.trim() ? t(`Resultados para “${state.q.trim()}”`, `Results for “${state.q.trim()}”`) : filterParts.join(' · ') || t('Todas las recetas', 'All recipes');

  const indexable = isIndexable(state, results.length);
  const canonical = indexable ? { ...state, pagina: page.page } : canonicalState(state);
  const pageSuffix = page.page > 1 ? t(` (página ${page.page})`, ` (page ${page.page})`) : '';
  usePageMeta({
    title: isDefault && page.page === 1
      ? t('Recetas con Arándanos Frescos | Fresh Pick - Arándanos de Alta Montaña', 'Fresh Blueberry Recipes | Fresh Pick - High-Mountain Blueberries')
      : `${heading} – ${t('Recetas con Arándanos', 'Blueberry Recipes')}${pageSuffix} | Fresh Pick`,
    description: filterParts.length === 0 || !indexable
      ? t('Recetas fáciles y saludables con arándanos frescos: smoothies, desayunos, postres saludables, snacks, ensaladas, bebidas y conservas. Paso a paso con arándanos Fresh Pick.', 'Easy, healthy recipes with fresh blueberries: smoothies, breakfasts, healthy desserts, snacks, salads, drinks and preserves. Step by step with Fresh Pick blueberries.')
      : t(`Archivo de recetas con arándanos: ${filterParts.join(', ').toLowerCase()}. ${results.length} recetas fáciles y saludables paso a paso con arándanos Fresh Pick.`, `Blueberry recipe archive: ${filterParts.join(', ').toLowerCase()}. ${results.length} easy, healthy step-by-step recipes with Fresh Pick blueberries.`),
    path: serializeLibraryUrl(BASE, canonical),
    noindex: !indexable
  });

  const scrollToResults = () => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const hasFilter = filterParts.length > 0 || state.q.trim() !== '' || !!state.tiempo || !!state.dificultad;
  const crumbs = [
    { label: t('Inicio', 'Home'), href: '/' },
    hasFilter ? { label: t('Recetas', 'Recipes'), href: BASE } : { label: t('Recetas', 'Recipes') },
    ...(hasFilter ? [{ label: filterParts.join(' · ') || t('Búsqueda', 'Search') }] : [])
  ];

  return (
    <SiteShell>
      <section className="fp-gradient-hero border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-10 sm:pb-14">
          <Breadcrumbs items={crumbs} />

          <div className="max-w-3xl mt-6">
            <div className="fp-pill text-xs shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>{t(`Biblioteca de recetas · ${RECIPE_ENTRIES.length} recetas`, `Recipe library · ${RECIPE_ENTRIES.length} recipes`)}</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              {t('Recetas con arándanos frescos', 'Fresh blueberry recipes')}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-700 leading-relaxed">
              {t('Ideas fáciles y deliciosas donde el arándano Fresh Pick es el protagonista. Busca por ingrediente o explora por categoría, tiempo, dificultad y fecha: todas las recetas siguen aquí.', 'Easy, delicious ideas where the Fresh Pick blueberry is the star. Search by ingredient or browse by category, time, difficulty and date: every recipe is still here.')}
            </p>
          </div>

          <div className="mt-6 max-w-3xl">
            <LibrarySearch lib={lib} label={t('Buscar recetas', 'Search recipes')} placeholder={t('Busca por receta o ingrediente: avena, limón, yogur…', 'Search by recipe or ingredient: oats, lemon, yogurt…')} />
          </div>

          <div className="mt-5 flex gap-2" role="tablist" aria-label={t('Contenido de recetas', 'Recipe content')}>
            <TabLink href={BASE} active={state.vista !== 'videos'} label={t('🍽️ Recetas', '🍽️ Recipes')} count={RECIPE_ENTRIES.length} lib={lib} />
            <TabLink href={`${BASE}?vista=videos`} active={state.vista === 'videos'} label="🎬 Videos" count={visibleVideos('recetas').length} lib={lib} video />
          </div>
        </div>
      </section>

      <section className="bg-[#F7F5F0]/90 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {state.vista === 'videos' ? (
            <YouTubeFeed seccion="recetas" categoria="videos" />
          ) : (
            <div id="resultados" className="grid lg:grid-cols-[17rem_minmax(0,1fr)] gap-8 scroll-mt-24">
              <LibrarySidebar lib={lib} facets={facets} categories={RECIPE_CATEGORIES} recipeFilters />

              <div className="min-w-0 space-y-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display">{heading}</h2>
                  <p className="text-sm text-stone-600 mt-1">
                    {category && !state.q.trim() && filterParts.length === 1
                      ? category.description
                      : t('Explora todas nuestras recetas con arándanos frescos de alta montaña.', 'Explore all our recipes with fresh high-mountain blueberries.')}
                  </p>
                </div>
                <ActiveFilters lib={lib} categories={RECIPE_CATEGORIES} />
                <ResultsBar lib={lib} page={page} noun={t('recetas', 'recipes')} />

                {recipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                    {recipes.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} />)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DFCEE6] bg-white/70 p-10 text-center">
                    <p className="text-3xl" aria-hidden="true">{category?.emoji ?? '🔎'}</p>
                    <p className="mt-2 font-semibold text-[#2F183C]">{t('No encontramos recetas con esos filtros.', 'We found no recipes with those filters.')}</p>
                    <p className="text-sm text-stone-600 mt-1">{t('Prueba con otro ingrediente o quita algún filtro.', 'Try another ingredient or remove a filter.')}</p>
                    <a
                      href={BASE}
                      onClick={e => { e.preventDefault(); lib.update({ q: '', categoria: undefined, etiqueta: undefined, anio: undefined, mes: undefined, tiempo: undefined, dificultad: undefined, orden: 'recientes' }); }}
                      className="mt-3 inline-block text-sm font-bold text-[#7B4382] hover:text-[#2F183C]"
                    >
                      {t('Ver todas las recetas', 'See all recipes')}
                    </a>
                  </div>
                )}

                <Pagination lib={lib} page={page} onChange={scrollToResults} />

                {page.page === 1 && (
                  <div className="pt-6">
                    <YouTubeFeed seccion="recetas" categoria={state.categoria ?? 'todas'} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 sm:mt-16">
            <OrderCta
              title={t('¿Listo para cocinar? Pide tus arándanos Fresh Pick', 'Ready to cook? Order your Fresh Pick blueberries')}
              whatsappMessage={t('Hola Fresh Pick, vi sus recetas y quiero pedir arándanos frescos', 'Hello Fresh Pick, I saw your recipes and would like to order fresh blueberries')}
            />
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t('Recetas con arándanos frescos Fresh Pick', 'Fresh Pick fresh blueberry recipes'),
          itemListElement: recipes.map((r, i) => ({
            '@type': 'ListItem',
            position: page.from + i,
            url: `${SITE_URL}${withLang(`/recetas/${r.slug}`, lang)}`
          }))
        }}
      />
    </SiteShell>
  );
}

const TabLink: React.FC<{ href: string; active: boolean; label: string; count: number; lib: LibraryApi; video?: boolean }> = ({ href, active, label, count, lib, video }) => (
  <a
    href={href}
    role="tab"
    aria-selected={active}
    onClick={e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      lib.update(video ? { vista: 'videos' } : { vista: undefined, q: '', categoria: undefined, etiqueta: undefined, anio: undefined, mes: undefined, tiempo: undefined, dificultad: undefined });
    }}
    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors whitespace-nowrap ${
      active
        ? 'bg-[#2F183C] text-white border-[#2F183C] shadow-md'
        : 'bg-white text-[#2F183C] border-[#DFCEE6] hover:border-[#7B4382] hover:text-[#7B4382]'
    }`}
  >
    <span>{label}</span>
    <span className={`text-xs font-bold px-1.5 rounded-full ${active ? 'bg-[#DDA83A] text-[#2F183C]' : 'bg-[#F5ECF9] text-[#7B4382]'}`}>{count}</span>
  </a>
);
