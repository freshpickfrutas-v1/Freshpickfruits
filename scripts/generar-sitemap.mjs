// Genera public/sitemap.xml a partir del contenido publicado en src/content/.
// Se ejecuta solo antes de cada build ("prebuild" en package.json), así que
// cada receta o noticia nueva queda en el sitemap sin tocarlo a mano.
//
// Uso manual: node scripts/generar-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';

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

const urls = [
  { loc: '/', lastmod: HOME_LASTMOD, changefreq: 'weekly', priority: '1.0' },
  { loc: '/recetas', lastmod: newest(recetas), changefreq: 'daily', priority: '0.8' },
  { loc: '/noticias', lastmod: newest(noticias), changefreq: 'daily', priority: '0.8' },
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
