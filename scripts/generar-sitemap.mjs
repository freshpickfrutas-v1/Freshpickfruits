// Genera public/sitemap.xml a partir del contenido publicado en src/content/.
// Se ejecuta solo antes de cada build ("prebuild" en package.json), así que
// cada receta o noticia nueva queda en el sitemap sin tocarlo a mano.
//
// Uso manual: node scripts/generar-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';
import { articleTagIds, recipeTagIds } from '../src/lib/tagging.mjs';

const SITE = 'https://www.freshpickfruits.com';
const root = path.resolve(import.meta.dirname, '..');
const HOME_LASTMOD = '2026-09-17';

function readPublished(dir) {
  const full = path.join(root, 'src', 'content', dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(full, f), 'utf8')))
    .filter(item => item.estado !== 'borrador')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

const recetas = readPublished('recetas');
const noticias = readPublished('noticias');
const newest = list => list[0]?.date ?? HOME_LASTMOD;

// Páginas de archivo de la biblioteca (año, mes, categoría y etiqueta). Cada una se lista solo si tiene
// contenido; las etiquetas, solo con 3 o más piezas (igual que la regla de indexación de la web).
const MIN_TAG_PAGE_ITEMS = 3;
const QUICK_RECIPE_MAX_MINUTES = 15;
const recipeCategoryIds = r => {
  const ids = [r.category, ...(r.extraCategories ?? [])];
  if ((r.prepMinutes ?? 0) + (r.cookMinutes ?? 0) + (r.restMinutes ?? 0) <= QUICK_RECIPE_MAX_MINUTES) ids.push('recetas-rapidas');
  return ids;
};

function archiveUrls(base, list, categoryIdsOf, tagIdsOf) {
  const lastmodOf = items => items.reduce((max, i) => ((i.date ?? '') > max ? i.date : max), '') || HOME_LASTMOD;
  const groups = new Map();
  const add = (key, item) => groups.set(key, [...(groups.get(key) ?? []), item]);
  for (const item of list) {
    const [year, month] = (item.date ?? '').split('-');
    if (year && month) {
      add(`/${year}`, item);
      add(`/${year}/${month}`, item);
    }
    categoryIdsOf(item).forEach(c => add(`/categoria/${c}`, item));
    tagIdsOf(item).forEach(t => add(`/etiqueta/${t}`, item));
  }
  return [...groups.entries()]
    .filter(([key, items]) => !key.startsWith('/etiqueta/') || items.length >= MIN_TAG_PAGE_ITEMS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ loc: `${base}${key}`, lastmod: lastmodOf(items), changefreq: 'weekly', priority: '0.5' }));
}

const urls = [
  { loc: '/', lastmod: HOME_LASTMOD, changefreq: 'weekly', priority: '1.0' },
  { loc: '/recetas', lastmod: newest(recetas), changefreq: 'daily', priority: '0.8' },
  { loc: '/noticias', lastmod: newest(noticias), changefreq: 'daily', priority: '0.8' },
  ...archiveUrls('/recetas', recetas, recipeCategoryIds, recipeTagIds),
  ...archiveUrls('/noticias', noticias, n => [n.category], articleTagIds),
  ...recetas.map(r => ({ loc: `/recetas/${r.slug}`, lastmod: r.date ?? HOME_LASTMOD, changefreq: 'monthly', priority: '0.7' })),
  ...noticias.map(n => ({ loc: `/noticias/${n.slug}`, lastmod: n.date, changefreq: 'monthly', priority: '0.7' }))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Fresh Pick - sitemap.xml
  ARCHIVO GENERADO por scripts/generar-sitemap.mjs antes de cada build.
  No editar a mano: se sobrescribe con las recetas y noticias publicadas.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml: ${urls.length} URLs (${recetas.length} recetas, ${noticias.length} noticias)`);
