// Genera public/sitemap.xml a partir del contenido publicado en src/content/.
// Se ejecuta solo antes de cada build ("prebuild" en package.json), así que
// cada receta o noticia nueva queda en el sitemap sin tocarlo a mano.
//
// Uso manual: node scripts/generar-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';
import { WHOLESALE_PATHS, hubsOf, loadContent, root, sinOcultas } from './contenido-publicado.mjs';

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
// llms.txt: resumen para buscadores con IA (ChatGPT, Perplexity, Gemini, Claude). Se regenera con lo último publicado.
const latest = (list, base) => list.slice(0, 15).map(i => `- [${i.title}](${SITE}${base}/${i.slug})`).join('\n');
const llms = `# Fresh Pick

> Arándanos premium de alta montaña cultivados a más de 2.800 m.s.n.m. en Guasca, Cundinamarca (Colombia). Venta con entrega a domicilio solo en Bogotá, martes y miércoles de 8:00 a.m. a 3:00 p.m. Empresa: ANDEAN FRUIT COMPANY SAS.

## Datos clave (para citar)
- Producto: arándanos frescos en estuches de 125 g, 250 g y 500 g; pedido mínimo de 500 g.
- Cultivo: polinización 100% natural, sin ceras ni residuos químicos añadidos.
- Cobertura de entrega: Bogotá (Colombia). Pedidos en línea o por WhatsApp.
- Idiomas del sitio: español (principal) e inglés (/en).

## Páginas principales
- [Inicio y tienda](${SITE}/): catálogo y pedidos de arándanos frescos.
- [Recetas](${SITE}/recetas): recetas con arándanos.
- [Noticias](${SITE}/noticias): artículos sobre arándanos, nutrición y cultivo.
- [Mayoristas](${SITE}/mayoristas): venta por volumen.
- [Sitemap](${SITE}/sitemap.xml)

## Últimas recetas
${latest(recetas, '/recetas')}

## Últimas noticias
${latest(noticias, '/noticias')}

## Contacto
- info@freshpickfruits.com · WhatsApp +57 317 893 1026

## Legal
- [Privacidad](${SITE}/privacidad) · [Términos](${SITE}/terminos) · [Cookies](${SITE}/cookies)
`;
fs.writeFileSync(path.join(root, 'public', 'llms.txt'), llms, 'utf8');

console.log(`sitemap.xml: ${urls.length * 2} URLs (es + en) (${recetas.length} recetas, ${noticias.length} noticias)`);
