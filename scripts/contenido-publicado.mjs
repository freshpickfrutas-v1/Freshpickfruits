// Lee el contenido publicado (src/content/) y calcula todas las rutas de recetas y noticias.
// Lo usan el generador de datos, el sitemap y el prerender, para que los tres coincidan.
import fs from 'node:fs';
import path from 'node:path';
import { PAGE_SIZE, archiveHubs, recipeCategoryIds } from '../src/lib/archive.mjs';
import { articleTagIds, recipeTagIds } from '../src/lib/tagging.mjs';

/** Sección mayorista única: en español es nacional (Colombia) y en inglés internacional (Wholesale World). */
export const WHOLESALE_PATHS = ['/mayoristas'];

export const root = path.resolve(import.meta.dirname, '..');

function readPublished(dir) {
  const full = path.join(root, 'src', 'content', dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(full, f), 'utf8')))
    .filter(item => item.estado !== 'borrador')
    .sort((a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '') ||
      (b.publicadoEn ?? '').localeCompare(a.publicadoEn ?? '') ||
      (a.orden ?? 999) - (b.orden ?? 999));
}

/** Piezas eliminadas desde el admin (las descarga scripts/obtener-ocultos.mjs): no van al sitemap ni se prerenderizan. */
export function sinOcultas({ recetas, noticias }) {
  let ocultos = [];
  try { ocultos = JSON.parse(fs.readFileSync(path.join(root, 'scripts', '.ocultos.json'), 'utf8')); } catch { /* sin lista */ }
  const set = new Set(ocultos);
  return {
    recetas: recetas.filter(r => !set.has(`receta__${r.slug}`)),
    noticias: noticias.filter(n => !set.has(`noticia__${n.slug}`))
  };
}

/** Traducción al inglés de una pieza: src/content-en/<recetas|noticias>/<slug>.json (solo los campos traducidos). */
function withEnglish(dir, item) {
  const file = path.join(root, 'src', 'content-en', dir, `${item.slug}.json`);
  if (!fs.existsSync(file)) return { ...item, sinTraducir: true };
  return { ...item, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
}

/** Contenido publicado. Con lang 'en' cada pieza lleva sus campos traducidos (o el español si aún no tiene traducción). */
export function loadContent(lang = 'es') {
  const es = { recetas: readPublished('recetas'), noticias: readPublished('noticias') };
  if (lang === 'es') return es;
  return {
    recetas: es.recetas.map(r => withEnglish('recetas', r)),
    noticias: es.noticias.map(n => withEnglish('noticias', n))
  };
}

/** Hubs de archivo de cada sección, con su ruta completa (p. ej. "/recetas/2026/10"). */
export function hubsOf({ recetas, noticias }) {
  const withBase = (base, hubs) => hubs.map(h => ({ ...h, path: `${base}${h.path}`, base }));
  return [
    ...withBase('/recetas', archiveHubs(recetas, recipeCategoryIds, recipeTagIds)),
    ...withBase('/noticias', archiveHubs(noticias, n => [n.category], articleTagIds))
  ];
}

/** Rutas de las páginas 2..N de un listado (la primera es el propio hub). */
export function paginationPaths(basePath, count) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return Array.from({ length: pages - 1 }, (_, i) => `${basePath}/pagina/${i + 2}`);
}

/** Todas las rutas que se prerenderizan: listados, páginas de archivo, paginación y detalle. */
export function prerenderPaths(content) {
  const paths = ['/'];
  for (const [base, list, detail] of [
    ['/recetas', content.recetas, '/recetas'],
    ['/noticias', content.noticias, '/noticias']
  ]) {
    paths.push(base, ...paginationPaths(base, list.length));
    for (const hub of hubsOf(content).filter(h => h.base === base)) {
      paths.push(hub.path, ...paginationPaths(hub.path, hub.items.length));
    }
    for (const item of list) paths.push(`${detail}/${item.slug}`);
  }
  // Páginas legales: contenido completo en el HTML (Google las revisa para verificar la marca).
  paths.push('/privacidad', '/terminos', '/cookies');
  // Páginas mayoristas.
  paths.push(...WHOLESALE_PATHS);
  // Mismas páginas en inglés bajo /en.
  return [...paths, ...paths.map(p => (p === '/' ? '/en' : `/en${p}`))];
}
