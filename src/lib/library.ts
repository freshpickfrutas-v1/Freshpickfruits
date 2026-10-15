import { useCallback, useEffect, useState } from 'react';
import { normalize } from './tagging.mjs';
import { MIN_TAG_PAGE_ITEMS, PAGE_SIZE } from './archive.mjs';
import { readLocation } from './router';

export { MIN_TAG_PAGE_ITEMS, PAGE_SIZE };

export type SortId = 'recientes' | 'antiguos' | 'az' | 'relevancia';

/** Versión liviana de una receta o noticia, suficiente para listar, filtrar y buscar. */
export interface LibraryEntry {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO "YYYY-MM-DD"; vacío si la pieza no tiene fecha. */
  date: string;
  categories: string[];
  tags: string[];
  /** Texto normalizado (sin tildes) sobre el que busca la barra de búsqueda. */
  search: string;
  /** Solo recetas: tiempo total en minutos. */
  minutes?: number;
  /** Solo recetas. */
  difficulty?: string;
}

export interface LibraryState {
  q: string;
  categoria?: string;
  etiqueta?: string;
  anio?: number;
  mes?: number;
  /** Solo recetas: tiempo total máximo en minutos. */
  tiempo?: number;
  dificultad?: string;
  orden: SortId;
  pagina: number;
  vista?: 'videos';
}

export const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export function monthLabel(month: number) {
  const name = MONTH_NAMES[month - 1] ?? '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const SORTS: SortId[] = ['recientes', 'antiguos', 'az', 'relevancia'];

function implicitSort(q: string): SortId {
  return q.trim() ? 'relevancia' : 'recientes';
}

export function emptyState(): LibraryState {
  return { q: '', orden: 'recientes', pagina: 1 };
}

/** Lee el estado desde la URL: /noticias[/categoria/x | /etiqueta/x | /2026[/10]][/pagina/2][?q=&orden=...]. */
export function parseLibraryUrl(basePath: string, pathname: string, search: string): LibraryState {
  const state = emptyState();
  const params = new URLSearchParams(search);
  const rest = pathname.slice(basePath.length).split('/').filter(Boolean).map(decodeURIComponent);
  let i = 0;

  if (rest[0] === 'categoria' && rest[1]) {
    state.categoria = rest[1];
    i = 2;
  } else if (rest[0] === 'etiqueta' && rest[1]) {
    state.etiqueta = rest[1];
    i = 2;
  } else if (/^\d{4}$/.test(rest[0] ?? '')) {
    state.anio = Number(rest[0]);
    i = 1;
    if (/^\d{1,2}$/.test(rest[1] ?? '') && Number(rest[1]) >= 1 && Number(rest[1]) <= 12) {
      state.mes = Number(rest[1]);
      i = 2;
    }
  }
  if (rest[i] === 'pagina' && /^\d+$/.test(rest[i + 1] ?? '')) {
    state.pagina = Math.max(1, Number(rest[i + 1]));
  }

  // Los parámetros completan lo que la ruta no trae (también soportan los enlaces viejos ?categoria=...).
  const categoria = params.get('categoria');
  if (categoria === 'videos' || params.get('vista') === 'videos') state.vista = 'videos';
  else if (categoria && !state.categoria) state.categoria = categoria;
  const etiqueta = params.get('etiqueta');
  if (etiqueta && !state.etiqueta) state.etiqueta = etiqueta;
  const anio = params.get('anio');
  if (anio && /^\d{4}$/.test(anio) && state.anio === undefined) state.anio = Number(anio);
  const mes = params.get('mes');
  if (mes && /^\d{1,2}$/.test(mes) && state.mes === undefined && Number(mes) >= 1 && Number(mes) <= 12) state.mes = Number(mes);
  if (state.anio === undefined) state.mes = undefined;
  const tiempo = params.get('tiempo');
  if (tiempo && /^\d+$/.test(tiempo)) state.tiempo = Number(tiempo);
  const dificultad = params.get('dificultad');
  if (dificultad) state.dificultad = dificultad;
  state.q = (params.get('q') ?? '').slice(0, 100);
  const orden = params.get('orden') as SortId | null;
  state.orden = orden && SORTS.includes(orden) ? orden : implicitSort(state.q);
  return state;
}

/** Construye la URL de un estado. Una sola dimensión va en la ruta (URL indexable); el resto, en parámetros. */
export function serializeLibraryUrl(basePath: string, s: LibraryState): string {
  if (s.vista === 'videos') return `${basePath}?vista=videos`;

  const params = new URLSearchParams();
  let path = basePath;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (s.categoria) {
    path += `/categoria/${encodeURIComponent(s.categoria)}`;
    if (s.etiqueta) params.set('etiqueta', s.etiqueta);
    if (s.anio !== undefined) params.set('anio', String(s.anio));
    if (s.anio !== undefined && s.mes !== undefined) params.set('mes', pad(s.mes));
  } else if (s.etiqueta) {
    path += `/etiqueta/${encodeURIComponent(s.etiqueta)}`;
    if (s.anio !== undefined) params.set('anio', String(s.anio));
    if (s.anio !== undefined && s.mes !== undefined) params.set('mes', pad(s.mes));
  } else if (s.anio !== undefined) {
    path += `/${s.anio}`;
    if (s.mes !== undefined) path += `/${pad(s.mes)}`;
  }

  if (s.pagina > 1) path += `/pagina/${s.pagina}`;
  if (s.q.trim()) params.set('q', s.q.trim());
  if (s.tiempo) params.set('tiempo', String(s.tiempo));
  if (s.dificultad) params.set('dificultad', s.dificultad);
  if (s.orden !== implicitSort(s.q)) params.set('orden', s.orden);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** Aplica un cambio al estado: reinicia la página (salvo que el cambio la traiga) y ajusta el orden por defecto. */
export function applyPatch(s: LibraryState, patch: Partial<LibraryState>): LibraryState {
  const next: LibraryState = { ...s, ...patch };
  if (!('pagina' in patch)) next.pagina = 1;
  if ('q' in patch && !('orden' in patch)) {
    const had = s.q.trim() !== '';
    const has = next.q.trim() !== '';
    if (!had && has && next.orden === 'recientes') next.orden = 'relevancia';
    if (had && !has && next.orden === 'relevancia') next.orden = 'recientes';
  }
  if (next.anio === undefined) next.mes = undefined;
  if (next.vista) next.vista = 'videos';
  return next;
}

/** True si el estado tiene al menos un filtro activo (búsqueda incluida). */
export function activeFilterCount(s: LibraryState) {
  return [s.q.trim(), s.categoria, s.etiqueta, s.anio, s.tiempo, s.dificultad].filter(v => v !== undefined && v !== '').length;
}

type Dim = 'q' | 'categoria' | 'etiqueta' | 'anio' | 'mes' | 'tiempo' | 'dificultad';

function searchTerms(q: string) {
  return normalize(q).split(/\s+/).filter(Boolean);
}

export function filterEntries(entries: LibraryEntry[], s: LibraryState, omit: Dim[] = []): LibraryEntry[] {
  const terms = omit.includes('q') ? [] : searchTerms(s.q);
  return entries.filter(e => {
    if (!omit.includes('categoria') && s.categoria && !e.categories.includes(s.categoria)) return false;
    if (!omit.includes('etiqueta') && s.etiqueta && !e.tags.includes(s.etiqueta)) return false;
    if (!omit.includes('anio') && s.anio !== undefined) {
      if (Number(e.date.slice(0, 4)) !== s.anio) return false;
      if (!omit.includes('mes') && s.mes !== undefined && Number(e.date.slice(5, 7)) !== s.mes) return false;
    }
    if (!omit.includes('tiempo') && s.tiempo && (e.minutes === undefined || e.minutes > s.tiempo)) return false;
    if (!omit.includes('dificultad') && s.dificultad && e.difficulty !== s.dificultad) return false;
    return terms.every(t => e.search.includes(t));
  });
}

function relevance(e: LibraryEntry, terms: string[]) {
  const title = normalize(e.title);
  let score = 0;
  for (const t of terms) {
    if (title.includes(t)) score += 3;
    else if (e.tags.some(tag => tag.includes(t))) score += 2;
    else if (normalize(e.excerpt).includes(t)) score += 1;
    else score += 0.5;
  }
  return score;
}

export function sortEntries(entries: LibraryEntry[], s: LibraryState): LibraryEntry[] {
  const indexed = entries.map((e, i) => ({ e, i }));
  const newest = (a: { e: LibraryEntry; i: number }, b: { e: LibraryEntry; i: number }) =>
    b.e.date.localeCompare(a.e.date) || a.i - b.i;
  if (s.orden === 'antiguos') indexed.sort((a, b) => -newest(a, b));
  else if (s.orden === 'az') indexed.sort((a, b) => a.e.title.localeCompare(b.e.title, 'es'));
  else if (s.orden === 'relevancia' && s.q.trim()) {
    const terms = searchTerms(s.q);
    indexed.sort((a, b) => relevance(b.e, terms) - relevance(a.e, terms) || newest(a, b));
  } else indexed.sort(newest);
  return indexed.map(x => x.e);
}

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * size;
  const slice = items.slice(start, start + size);
  return { items: slice, page: current, totalPages, total, from: total ? start + 1 : 0, to: start + slice.length };
}

export interface Facets {
  /** Años con su cantidad y los meses de cada uno, del más reciente al más antiguo. */
  years: { year: number; count: number; months: { month: number; count: number }[] }[];
  categories: Map<string, number>;
  /** Etiquetas ordenadas de más a menos usadas. */
  tags: { id: string; count: number }[];
}

/** Cada grupo cuenta sobre el resultado de los OTROS filtros, para que los números siempre sean alcanzables. */
export function computeFacets(entries: LibraryEntry[], s: LibraryState): Facets {
  const byDate = filterEntries(entries, s, ['anio', 'mes']);
  const yearMap = new Map<number, Map<number, number>>();
  for (const e of byDate) {
    const year = Number(e.date.slice(0, 4));
    const month = Number(e.date.slice(5, 7));
    if (!year || !month) continue;
    const months = yearMap.get(year) ?? new Map<number, number>();
    months.set(month, (months.get(month) ?? 0) + 1);
    yearMap.set(year, months);
  }
  const years = [...yearMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      count: [...months.values()].reduce((sum, n) => sum + n, 0),
      months: [...months.entries()].sort((a, b) => b[0] - a[0]).map(([month, count]) => ({ month, count }))
    }));

  const categories = new Map<string, number>();
  for (const e of filterEntries(entries, s, ['categoria'])) {
    for (const c of e.categories) categories.set(c, (categories.get(c) ?? 0) + 1);
  }

  const tagMap = new Map<string, number>();
  for (const e of filterEntries(entries, s, ['etiqueta'])) {
    for (const t of e.tags) tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
  }
  const tags = [...tagMap.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  return { years, categories, tags };
}

/**
 * Una página de la biblioteca se indexa solo cuando es una vista "limpia": a lo sumo una dimensión
 * (categoría, etiqueta o fecha), sin búsqueda ni filtros extra, con resultados. Todo lo demás va
 * `noindex` y apunta con canonical a su vista limpia.
 */
export function isIndexable(s: LibraryState, total: number): boolean {
  if (s.vista || total === 0) return false;
  if (s.q.trim() || s.tiempo || s.dificultad) return false;
  if (s.orden !== 'recientes') return false;
  const dims = [s.categoria, s.etiqueta, s.anio].filter(v => v !== undefined).length;
  if (dims > 1) return false;
  if (s.etiqueta && total < MIN_TAG_PAGE_ITEMS) return false;
  return true;
}

/** La vista limpia a la que apunta el canonical de una página no indexable. */
export function canonicalState(s: LibraryState): LibraryState {
  const clean = emptyState();
  if (s.categoria) clean.categoria = s.categoria;
  else if (s.etiqueta) clean.etiqueta = s.etiqueta;
  else if (s.anio !== undefined) {
    clean.anio = s.anio;
    clean.mes = s.mes;
  }
  return clean;
}

/**
 * Estado de la biblioteca sincronizado con la URL, sin recargar la página:
 * los cambios hacen pushState (el botón "atrás" funciona) y la escritura en la búsqueda usa replaceState.
 */
export function useLibraryState(basePath: string) {
  const read = useCallback(() => {
    const { pathname, search } = readLocation();
    return parseLibraryUrl(basePath, pathname, search);
  }, [basePath]);
  const [state, setState] = useState<LibraryState>(read);

  useEffect(() => {
    const onPop = () => setState(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [read]);

  const hrefFor = useCallback(
    (patch: Partial<LibraryState>) => serializeLibraryUrl(basePath, applyPatch(state, patch)),
    [basePath, state]
  );

  const update = useCallback(
    (patch: Partial<LibraryState>, options: { replace?: boolean } = {}) => {
      const next = applyPatch(state, patch);
      const url = serializeLibraryUrl(basePath, next);
      const current = window.location.pathname + window.location.search;
      if (url !== current) window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);
      setState(next);
    },
    [basePath, state]
  );

  return { state, update, hrefFor };
}
