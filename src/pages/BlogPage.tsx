import React, { useMemo } from 'react';
import { Newspaper } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { ArticleCard } from '../components/ArticleCard';
import { OrderCta } from '../components/OrderCta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { YouTubeFeed } from '../components/YouTubeFeed';
import { ActiveFilters, LibraryApi, LibrarySearch, LibrarySidebar, Pagination, ResultsBar, describeFilters } from '../components/LibraryControls';
import { visibleVideos } from '../data/featuredVideos';
import { BLOG_CATEGORIES } from '../data/blog';
import { articleIndex } from '../data/content';
import { articleEntries } from '../lib/libraryEntries';
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
import { usePageMeta } from '../lib/seo';

const BASE = '/noticias';

export default function BlogPage() {
  const lib = useLibraryState(BASE);
  const { state } = lib;
  const index = articleIndex();
  const ARTICLE_ENTRIES = articleEntries(index);

  const facets = useMemo(() => computeFacets(ARTICLE_ENTRIES, state), [state, ARTICLE_ENTRIES]);
  const results = useMemo(() => sortEntries(filterEntries(ARTICLE_ENTRIES, state), state), [state, ARTICLE_ENTRIES]);
  const page = paginate<LibraryEntry>(results, state.pagina);
  const bySlug = new Map(index.map(a => [a.slug, a]));
  const articles = page.items.map(e => bySlug.get(e.slug)!).filter(Boolean);

  const categoryName = (id: string) => BLOG_CATEGORIES.find(c => c.id === id)?.name;
  const category = state.categoria ? BLOG_CATEGORIES.find(c => c.id === state.categoria) : undefined;
  const filterParts = describeFilters(state, categoryName);
  const isDefault = activeFilterCount(state) === 0 && state.orden === 'recientes';
  const heading = state.q.trim() ? `Resultados para “${state.q.trim()}”` : filterParts.join(' · ') || 'Todos los artículos';

  const indexable = isIndexable(state, results.length);
  const canonical = indexable ? { ...state, pagina: page.page } : canonicalState(state);
  const pageSuffix = page.page > 1 ? ` (página ${page.page})` : '';
  usePageMeta({
    title: isDefault && page.page === 1
      ? 'Noticias de Arándanos | Fresh Pick'
      : `${heading} – Noticias de Arándanos${pageSuffix} | Fresh Pick`,
    description: filterParts.length === 0 || !indexable
      ? 'Noticias de arándanos al día: nuevos estudios de salud y nutrición, cosechas, mercado y exportación, y el cultivo de arándanos de alta montaña en Guasca, Colombia.'
      : `Archivo de noticias de arándanos sobre ${filterParts.join(', ').toLowerCase()}: ${results.length} artículos de salud, nutrición y cultivo de alta montaña en Guasca, Colombia.`,
    path: serializeLibraryUrl(BASE, canonical),
    noindex: !indexable
  });

  const scrollToResults = () => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const showLead = isDefault && page.page === 1 && articles.length > 0;
  const [lead, ...rest] = showLead ? articles : [undefined, ...articles];
  const grid = showLead ? rest : articles;

  const hasFilter = filterParts.length > 0 || state.q.trim() !== '';
  const crumbs = [
    { label: 'Inicio', href: '/' },
    hasFilter ? { label: 'Noticias de Arándanos', href: BASE } : { label: 'Noticias de Arándanos' },
    ...(hasFilter ? [{ label: filterParts.join(' · ') || 'Búsqueda' }] : [])
  ];

  return (
    <SiteShell>
      <section className="fp-gradient-hero border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-10 sm:pb-14">
          <Breadcrumbs items={crumbs} />

          <div className="max-w-3xl mt-6">
            <div className="fp-pill text-xs shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>Biblioteca de noticias · {ARTICLE_ENTRIES.length} artículos</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              Salud, nutrición y todo sobre los arándanos
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-700 leading-relaxed">
              Todo lo que hemos publicado, siempre disponible. Busca por tema o explora por fecha, categoría y etiquetas.
            </p>
          </div>

          <div className="mt-6 max-w-3xl">
            <LibrarySearch lib={lib} label="Buscar en las noticias" placeholder="Busca por tema: corazón, antioxidantes, cosecha…" />
          </div>

          <div className="mt-5 flex gap-2" role="tablist" aria-label="Contenido de noticias">
            <TabLink href={BASE} active={state.vista !== 'videos'} label="📰 Artículos" count={ARTICLE_ENTRIES.length} lib={lib} />
            <TabLink href={`${BASE}?vista=videos`} active={state.vista === 'videos'} label="🎬 Videos" count={visibleVideos('noticias').length} lib={lib} video />
          </div>
        </div>
      </section>

      <section className="bg-[#F7F5F0]/90 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {state.vista === 'videos' ? (
            <YouTubeFeed seccion="noticias" categoria="videos" />
          ) : (
            <div id="resultados" className="grid lg:grid-cols-[17rem_minmax(0,1fr)] gap-8 scroll-mt-24">
              <LibrarySidebar lib={lib} facets={facets} categories={BLOG_CATEGORIES} />

              <div className="min-w-0 space-y-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display">{heading}</h2>
                  {category && !state.q.trim() && filterParts.length === 1 && (
                    <p className="text-sm text-stone-600 mt-1">{category.description}</p>
                  )}
                </div>
                <ActiveFilters lib={lib} categories={BLOG_CATEGORIES} />
                <ResultsBar lib={lib} page={page} noun="artículos" />

                {articles.length > 0 ? (
                  <div className="space-y-6 sm:space-y-8">
                    {lead && <ArticleCard article={lead} large />}
                    {grid.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                        {grid.map(a => <ArticleCard key={a.slug} article={a} />)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DFCEE6] bg-white/70 p-10 text-center">
                    <p className="font-semibold text-[#2F183C]">No encontramos artículos con esos filtros.</p>
                    <p className="text-sm text-stone-600 mt-1">Prueba con otra palabra o quita algún filtro.</p>
                    <a
                      href={BASE}
                      onClick={e => { e.preventDefault(); lib.update({ q: '', categoria: undefined, etiqueta: undefined, anio: undefined, mes: undefined, orden: 'recientes' }); }}
                      className="mt-3 inline-block text-sm font-bold text-[#7B4382] hover:text-[#2F183C]"
                    >
                      Ver todos los artículos
                    </a>
                  </div>
                )}

                <Pagination lib={lib} page={page} onChange={scrollToResults} />

                {page.page === 1 && (
                  <div className="pt-6">
                    <YouTubeFeed seccion="noticias" categoria={state.categoria ?? 'todos'} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 sm:mt-16">
            <OrderCta whatsappMessage="Hola Fresh Pick, leí sus noticias de arándanos y quiero pedir arándanos frescos" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

const TabLink: React.FC<{
  href: string;
  active: boolean;
  label: string;
  count: number;
  lib: LibraryApi;
  video?: boolean;
}> = ({ href, active, label, count, lib, video }) => (
  <a
    href={href}
    role="tab"
    aria-selected={active}
    onClick={e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      lib.update(video ? { vista: 'videos' } : { vista: undefined, q: '', categoria: undefined, etiqueta: undefined, anio: undefined, mes: undefined });
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
