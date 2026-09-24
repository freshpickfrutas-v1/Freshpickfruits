import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { ArticleCard } from '../components/ArticleCard';
import { OrderCta } from '../components/OrderCta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BLOG_CATEGORIES, BLOG_ARTICLES, sortedArticles } from '../data/blog';
import { BlogCategoryId } from '../types';
import { usePageMeta } from '../lib/seo';

type Filter = BlogCategoryId | 'todos';

function readFilterFromUrl(): Filter {
  const param = new URLSearchParams(window.location.search).get('categoria');
  return BLOG_CATEGORIES.some(c => c.id === param) ? (param as BlogCategoryId) : 'todos';
}

export default function BlogPage() {
  const [filter, setFilter] = useState<Filter>(readFilterFromUrl);

  usePageMeta({
    title: 'Noticias de Arándanos: Salud, Nutrición y Cultivo | Fresh Pick',
    description: 'Artículos sobre los beneficios de los arándanos, nutrición, salud digestiva, estilo de vida saludable y el cultivo de arándanos de alta montaña en Guasca, Colombia.',
    path: '/blog'
  });

  const selectFilter = (next: Filter) => {
    setFilter(next);
    window.history.replaceState({}, '', next === 'todos' ? '/blog' : `/blog?categoria=${next}`);
  };

  const all = sortedArticles();
  const visible = filter === 'todos' ? all : all.filter(a => a.category === filter);
  const [lead, ...rest] = visible;
  const activeCategory = BLOG_CATEGORIES.find(c => c.id === filter);
  const countFor = (id: BlogCategoryId) => BLOG_ARTICLES.filter(a => a.category === id).length;

  return (
    <SiteShell>
      <section className="fp-gradient-hero border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-10 sm:pb-14">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Noticias de Arándanos' }]} />

          <div className="max-w-3xl mt-6">
            <div className="fp-pill text-xs shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>Noticias de Arándanos</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              Salud, nutrición y todo sobre los arándanos
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-700 leading-relaxed">
              Información clara y confiable sobre los beneficios de los arándanos, cómo incluirlos en tu día a día y cómo los cultivamos a más de 2.800 m.s.n.m.
            </p>
          </div>

          <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
            <div className="flex sm:flex-wrap gap-2 w-max sm:w-auto pb-1" role="tablist" aria-label="Filtrar artículos por categoría">
              <Chip active={filter === 'todos'} onClick={() => selectFilter('todos')} label="Todos los artículos" count={BLOG_ARTICLES.length} />
              {BLOG_CATEGORIES.map(c => (
                <Chip key={c.id} active={filter === c.id} onClick={() => selectFilter(c.id)} label={c.name} count={countFor(c.id)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7F5F0]/90 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeCategory && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold font-display">{activeCategory.name}</h2>
              <p className="text-sm text-stone-600 mt-1">{activeCategory.description}</p>
            </div>
          )}

          {lead ? (
            <div className="space-y-6 sm:space-y-8">
              <ArticleCard article={lead} large />
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {rest.map(a => <ArticleCard key={a.slug} article={a} />)}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#DFCEE6] bg-white/70 p-10 text-center">
              <p className="font-semibold text-[#2F183C]">Muy pronto publicaremos artículos en esta categoría.</p>
              <button onClick={() => selectFilter('todos')} className="mt-3 text-sm font-bold text-[#7B4382] hover:text-[#2F183C] cursor-pointer">
                Ver todos los artículos
              </button>
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

const Chip: React.FC<{ active: boolean; onClick: () => void; label: string; count: number }> = ({ active, onClick, label, count }) => (
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
