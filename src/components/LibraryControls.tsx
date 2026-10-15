import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Facets,
  LibraryState,
  MONTH_NAMES,
  Page,
  SortId,
  activeFilterCount,
  monthLabel
} from '../lib/library';
import { tagLabel } from '../lib/tagging.mjs';

export interface LibraryApi {
  state: LibraryState;
  update: (patch: Partial<LibraryState>, options?: { replace?: boolean }) => void;
  hrefFor: (patch: Partial<LibraryState>) => string;
}

export interface CategoryOption {
  id: string;
  name: string;
  emoji?: string;
}

/** Enlace real (rastreable por Google) que cambia el filtro sin recargar la página. */
const FilterLink: React.FC<{ lib: LibraryApi; patch: Partial<LibraryState>; className: string; children: React.ReactNode }> = ({ lib, patch, className, children }) => (
  <a
    href={lib.hrefFor(patch)}
    className={className}
    onClick={e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      lib.update(patch);
    }}
  >
    {children}
  </a>
);

/** Barra de búsqueda: filtra mientras se escribe (con una pequeña pausa) y también al presionar Enter. */
export const LibrarySearch: React.FC<{ lib: LibraryApi; placeholder: string; label: string }> = ({ lib, placeholder, label }) => {
  const [value, setValue] = useState(lib.state.q);

  // Si el estado cambia desde fuera (botón atrás, "Limpiar filtros"), el campo lo refleja.
  useEffect(() => setValue(lib.state.q), [lib.state.q]);

  useEffect(() => {
    if (value.trim() === lib.state.q.trim()) return;
    const timer = window.setTimeout(() => lib.update({ q: value }, { replace: true }), 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      role="search"
      onSubmit={e => {
        e.preventDefault();
        lib.update({ q: value });
      }}
      className="relative"
    >
      <label htmlFor="library-search" className="sr-only">{label}</label>
      <Search className="w-5 h-5 text-[#7B4382] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
      <input
        id="library-search"
        type="search"
        value={value}
        maxLength={100}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#DFCEE6] bg-white pl-12 pr-12 py-3.5 text-sm sm:text-base text-[#2F183C] placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7B4382]/40 focus:border-[#7B4382]"
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(''); lib.update({ q: '' }); }}
          aria-label="Borrar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-stone-500 hover:bg-[#F5ECF9] hover:text-[#2F183C] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};

const rowClass = (active: boolean) =>
  `flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
    active ? 'bg-[#2F183C] text-white font-semibold' : 'text-[#2F183C] hover:bg-[#F5ECF9]'
  }`;

const countClass = (active: boolean) =>
  `text-[11px] font-bold px-1.5 rounded-full ${active ? 'bg-[#DDA83A] text-[#2F183C]' : 'bg-[#F5ECF9] text-[#7B4382]'}`;

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7B4382] mb-2">{title}</h3>
    {children}
  </div>
);

const TIME_OPTIONS = [
  { value: 15, label: '15 min o menos' },
  { value: 30, label: '30 min o menos' },
  { value: 60, label: '1 hora o menos' }
];

const DIFFICULTIES = ['Fácil', 'Intermedio', 'Avanzado'];

const COLLAPSED_TAGS = 12;

/** Panel lateral: categorías, fecha (año > mes), etiquetas y, en recetas, tiempo y dificultad. */
export const LibrarySidebar: React.FC<{
  lib: LibraryApi;
  facets: Facets;
  categories: CategoryOption[];
  recipeFilters?: boolean;
}> = ({ lib, facets, categories, recipeFilters = false }) => {
  const { state } = lib;
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState(false);
  const active = activeFilterCount(state) - (state.q.trim() ? 1 : 0);

  const visibleTags = allTags ? facets.tags : facets.tags.slice(0, COLLAPSED_TAGS);
  const tagList = state.etiqueta && !visibleTags.some(t => t.id === state.etiqueta)
    ? [{ id: state.etiqueta, count: 0 }, ...visibleTags]
    : visibleTags;

  return (
    <aside aria-label="Filtros">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="lg:hidden w-full flex items-center justify-between gap-2 rounded-xl border border-[#DFCEE6] bg-white px-4 py-3 text-sm font-bold text-[#2F183C] cursor-pointer"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#7B4382]" />
          Filtros{active > 0 ? ` (${active})` : ''}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`${open ? 'block' : 'hidden'} lg:block mt-3 lg:mt-0 space-y-6 rounded-2xl border border-[#EADBEE] bg-white p-4 sm:p-5`}>
        <Group title="Categoría">
          <ul className="space-y-0.5">
            <li>
              <FilterLink lib={lib} patch={{ categoria: undefined }} className={rowClass(!state.categoria)}>
                <span>Todas</span>
              </FilterLink>
            </li>
            {categories.map(c => {
              const count = facets.categories.get(c.id) ?? 0;
              const isActive = state.categoria === c.id;
              if (count === 0 && !isActive) return null;
              return (
                <li key={c.id}>
                  <FilterLink lib={lib} patch={{ categoria: c.id }} className={rowClass(isActive)}>
                    <span>{c.emoji ? `${c.emoji} ` : ''}{c.name}</span>
                    <span className={countClass(isActive)}>{count}</span>
                  </FilterLink>
                </li>
              );
            })}
          </ul>
        </Group>

        {facets.years.length > 0 && (
          <Group title="Fecha">
            <ul className="space-y-0.5">
              {facets.years.map(y => {
                const yearActive = state.anio === y.year;
                return (
                  <li key={y.year}>
                    <FilterLink lib={lib} patch={yearActive && state.mes === undefined ? { anio: undefined } : { anio: y.year, mes: undefined }} className={rowClass(yearActive && state.mes === undefined)}>
                      <span>{y.year}</span>
                      <span className={countClass(yearActive && state.mes === undefined)}>{y.count}</span>
                    </FilterLink>
                    {yearActive && (
                      <ul className="mt-0.5 ml-3 pl-2 border-l border-[#EADBEE] space-y-0.5">
                        {y.months.map(m => {
                          const monthActive = state.mes === m.month;
                          return (
                            <li key={m.month}>
                              <FilterLink lib={lib} patch={monthActive ? { mes: undefined } : { anio: y.year, mes: m.month }} className={rowClass(monthActive)}>
                                <span>{monthLabel(m.month)}</span>
                                <span className={countClass(monthActive)}>{m.count}</span>
                              </FilterLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </Group>
        )}

        {recipeFilters && (
          <>
            <Group title="Tiempo total">
              <ul className="space-y-0.5">
                {TIME_OPTIONS.map(t => (
                  <li key={t.value}>
                    <FilterLink lib={lib} patch={{ tiempo: state.tiempo === t.value ? undefined : t.value }} className={rowClass(state.tiempo === t.value)}>
                      <span>{t.label}</span>
                    </FilterLink>
                  </li>
                ))}
              </ul>
            </Group>
            <Group title="Dificultad">
              <ul className="space-y-0.5">
                {DIFFICULTIES.map(d => (
                  <li key={d}>
                    <FilterLink lib={lib} patch={{ dificultad: state.dificultad === d ? undefined : d }} className={rowClass(state.dificultad === d)}>
                      <span>{d}</span>
                    </FilterLink>
                  </li>
                ))}
              </ul>
            </Group>
          </>
        )}

        {tagList.length > 0 && (
          <Group title="Etiquetas">
            <div className="flex flex-wrap gap-1.5">
              {tagList.map(t => {
                const isActive = state.etiqueta === t.id;
                return (
                  <FilterLink
                    key={t.id}
                    lib={lib}
                    patch={{ etiqueta: isActive ? undefined : t.id }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      isActive ? 'bg-[#2F183C] text-white border-[#2F183C]' : 'bg-white text-[#2F183C] border-[#DFCEE6] hover:border-[#7B4382] hover:text-[#7B4382]'
                    }`}
                  >
                    {tagLabel(t.id)}
                    {t.count > 0 && <span className={countClass(isActive)}>{t.count}</span>}
                  </FilterLink>
                );
              })}
            </div>
            {facets.tags.length > COLLAPSED_TAGS && (
              <button type="button" onClick={() => setAllTags(v => !v)} className="mt-2 text-xs font-bold text-[#7B4382] hover:text-[#2F183C] cursor-pointer">
                {allTags ? 'Ver menos' : `Ver las ${facets.tags.length} etiquetas`}
              </button>
            )}
          </Group>
        )}
      </div>
    </aside>
  );
};

/** Chips con los filtros activos; cada uno se quita con un clic. */
export const ActiveFilters: React.FC<{ lib: LibraryApi; categories: CategoryOption[] }> = ({ lib, categories }) => {
  const { state } = lib;
  const chips: { key: string; label: string; patch: Partial<LibraryState> }[] = [];
  if (state.q.trim()) chips.push({ key: 'q', label: `“${state.q.trim()}”`, patch: { q: '' } });
  if (state.categoria) chips.push({ key: 'c', label: categories.find(c => c.id === state.categoria)?.name ?? state.categoria, patch: { categoria: undefined } });
  if (state.etiqueta) chips.push({ key: 'e', label: tagLabel(state.etiqueta), patch: { etiqueta: undefined } });
  if (state.anio !== undefined) {
    chips.push({
      key: 'a',
      label: state.mes ? `${monthLabel(state.mes)} ${state.anio}` : String(state.anio),
      patch: { anio: undefined }
    });
  }
  if (state.tiempo) chips.push({ key: 't', label: `Hasta ${state.tiempo} min`, patch: { tiempo: undefined } });
  if (state.dificultad) chips.push({ key: 'd', label: state.dificultad, patch: { dificultad: undefined } });
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtros activos">
      {chips.map(c => (
        <FilterLink
          key={c.key}
          lib={lib}
          patch={c.patch}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#F5ECF9] border border-[#DFCEE6] pl-3 pr-2 py-1 text-xs font-semibold text-[#2F183C] hover:border-[#7B4382]"
        >
          {c.label}
          <X className="w-3.5 h-3.5 text-[#7B4382]" aria-label="Quitar filtro" />
        </FilterLink>
      ))}
      <FilterLink
        lib={lib}
        patch={{ q: '', categoria: undefined, etiqueta: undefined, anio: undefined, mes: undefined, tiempo: undefined, dificultad: undefined, orden: 'recientes' }}
        className="text-xs font-bold text-[#7B4382] hover:text-[#2F183C] underline underline-offset-2"
      >
        Limpiar filtros
      </FilterLink>
    </div>
  );
};

const SORT_LABELS: Record<SortId, string> = {
  recientes: 'Más recientes',
  antiguos: 'Más antiguos',
  az: 'Título (A–Z)',
  relevancia: 'Más relevantes'
};

/** "Mostrando 1–12 de 41 recetas" + selector de orden. */
export const ResultsBar: React.FC<{ lib: LibraryApi; page: Page<unknown>; noun: string }> = ({ lib, page, noun }) => {
  const { state } = lib;
  const sorts: SortId[] = state.q.trim() ? ['relevancia', 'recientes', 'antiguos', 'az'] : ['recientes', 'antiguos', 'az'];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-stone-600" aria-live="polite">
        {page.total === 0
          ? `0 ${noun}`
          : <>Mostrando <strong className="text-[#2F183C]">{page.from}–{page.to}</strong> de <strong className="text-[#2F183C]">{page.total}</strong> {noun}</>}
      </p>
      <label className="inline-flex items-center gap-2 text-sm text-stone-600">
        Ordenar por
        <select
          value={state.orden}
          onChange={e => lib.update({ orden: e.target.value as SortId })}
          className="rounded-lg border border-[#DFCEE6] bg-white px-2.5 py-1.5 text-sm font-semibold text-[#2F183C] focus:outline-none focus:ring-2 focus:ring-[#7B4382]/40"
        >
          {sorts.map(s => <option key={s} value={s}>{SORT_LABELS[s]}</option>)}
        </select>
      </label>
    </div>
  );
};

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) { pages.add(2); pages.add(3); }
  if (current >= total - 2) { pages.add(total - 1); pages.add(total - 2); }
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

/** Paginación numerada con enlaces reales (/noticias/pagina/2), pensada también para el rastreo de Google. */
export const Pagination: React.FC<{ lib: LibraryApi; page: Page<unknown>; onChange?: () => void }> = ({ lib, page, onChange }) => {
  if (page.totalPages <= 1) return null;
  const go = (n: number) => {
    lib.update({ pagina: n });
    onChange?.();
  };
  const link = (n: number, children: React.ReactNode, className: string, extra: React.AnchorHTMLAttributes<HTMLAnchorElement> = {}) => (
    <a
      href={lib.hrefFor({ pagina: n })}
      className={className}
      onClick={e => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        go(n);
      }}
      {...extra}
    >
      {children}
    </a>
  );
  const base = 'inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg border text-sm font-semibold transition-colors';
  const idle = `${base} bg-white text-[#2F183C] border-[#DFCEE6] hover:border-[#7B4382] hover:text-[#7B4382]`;
  const disabled = `${base} bg-white/60 text-stone-400 border-[#EADBEE] pointer-events-none`;

  return (
    <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page.page > 1
        ? link(page.page - 1, <><ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline ml-1">Anterior</span></>, idle, { rel: 'prev' })
        : <span className={disabled} aria-hidden="true"><ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline ml-1">Anterior</span></span>}
      {pageNumbers(page.page, page.totalPages).map((p, i) =>
        p === '…'
          ? <span key={`gap-${i}`} className="px-1 text-stone-400" aria-hidden="true">…</span>
          : p === page.page
            ? <span key={p} className={`${base} bg-[#2F183C] text-white border-[#2F183C]`} aria-current="page">{p}</span>
            : <React.Fragment key={p}>{link(p, p, idle, { 'aria-label': `Página ${p}` })}</React.Fragment>
      )}
      {page.page < page.totalPages
        ? link(page.page + 1, <><span className="hidden sm:inline mr-1">Siguiente</span><ChevronRight className="w-4 h-4" /></>, idle, { rel: 'next' })
        : <span className={disabled} aria-hidden="true"><span className="hidden sm:inline mr-1">Siguiente</span><ChevronRight className="w-4 h-4" /></span>}
    </nav>
  );
};

/** Textos en español para el título de una vista filtrada (migas, <h2>, <title>). */
export function describeFilters(state: LibraryState, categoryName: (id: string) => string | undefined): string[] {
  const parts: string[] = [];
  if (state.categoria) parts.push(categoryName(state.categoria) ?? state.categoria);
  if (state.etiqueta) parts.push(tagLabel(state.etiqueta));
  if (state.anio !== undefined) parts.push(state.mes ? `${MONTH_NAMES[state.mes - 1]} de ${state.anio}` : String(state.anio));
  return parts;
}
