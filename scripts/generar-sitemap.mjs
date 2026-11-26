// Genera public/sitemap.xml a partir del contenido publicado en src/content/.
// Se ejecuta solo antes de cada build ("prebuild" en package.json), así que
// cada receta o noticia nueva queda en el sitemap sin tocarlo a mano.
//
// Uso manual: node scripts/generar-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';
import { BOGOTA_PATH, WHOLESALE_PATHS, hubsOf, loadContent, root, sinOcultas } from './contenido-publicado.mjs';

const SITE = 'https://www.freshpickfruits.com';
const HOME_LASTMOD = '2026-09-17';

const content = sinOcultas(loadContent());
const { recetas, noticias } = content;
const newest = list => list[0]?.date ?? HOME_LASTMOD;

// Páginas de archivo (año, mes, categoría y etiqueta): las mismas que se prerenderizan y se indexan.
const lastmodOf = items => items.reduce((max, i) => ((i.date ?? '') > max ? i.date : max), '') || HOME_LASTMOD;
const archiveUrls = hubsOf(content).map(h => ({ loc: h.path, lastmod: lastmodOf(h.items), changefreq: 'weekly', priority: '0.5' }));

const urls = [
  { loc: '/', lastmod: HOME_LASTMOD, changefreq: 'weekly', priority: '1.0' },
  { loc: BOGOTA_PATH, lastmod: HOME_LASTMOD, changefreq: 'weekly', priority: '0.9' },
  { loc: '/recetas', lastmod: newest(recetas), changefreq: 'daily', priority: '0.8' },
  { loc: '/noticias', lastmod: newest(noticias), changefreq: 'daily', priority: '0.8' },
  { loc: '/privacidad', lastmod: HOME_LASTMOD, changefreq: 'yearly', priority: '0.3' },
  { loc: '/terminos', lastmod: HOME_LASTMOD, changefreq: 'yearly', priority: '0.3' },
  { loc: '/cookies', lastmod: HOME_LASTMOD, changefreq: 'yearly', priority: '0.2' },
  ...WHOLESALE_PATHS.map(loc => ({ loc, lastmod: HOME_LASTMOD, changefreq: 'monthly', priority: '0.7' })),
  ...archiveUrls,
  ...recetas.map(r => ({ loc: `/recetas/${r.slug}`, lastmod: r.date ?? HOME_LASTMOD, changefreq: 'monthly', priority: '0.7' })),
  ...noticias.map(n => ({ loc: `/noticias/${n.slug}`, lastmod: n.date, changefreq: 'monthly', priority: '0.7' }))
];

const enPath = loc => (loc === '/' ? '/en' : `/en${loc}`);
const entry = (loc, u) => `  <url>
    <loc>${SITE}${loc}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}${u.loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${enPath(u.loc)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${u.loc}"/>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Fresh Pick - sitemap.xml
  ARCHIVO GENERADO por scripts/generar-sitemap.mjs antes de cada build.
  No editar a mano: se sobrescribe con las recetas y noticias publicadas.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.flatMap(u => [entry(u.loc, u), entry(enPath(u.loc), u)]).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml: ${urls.length * 2} URLs (es + en) (${recetas.length} recetas, ${noticias.length} noticias)`);
