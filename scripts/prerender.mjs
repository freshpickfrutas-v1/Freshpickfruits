// Prerender de recetas y noticias: genera el HTML completo de cada página (contenido, título,
// descripción, canonical y datos estructurados) para que Google lo vea sin ejecutar JavaScript.
//
// Se ejecuta en el build, después de `vite build` y `vite build --ssr`:
//   dist/recetas/<slug>/index.html, dist/noticias/2026/10/index.html, dist/recetas/pagina/2/index.html, ...
// Al abrirse en el navegador, React "hidrata" ese HTML y la página sigue funcionando igual que antes.
// Las rutas que no se prerenderizan (inicio, paneles, filtros combinados) siguen funcionando como siempre.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadContent, prerenderPaths, root, sinOcultas } from './contenido-publicado.mjs';

const dist = path.join(root, process.env.DIST_DIR ?? 'dist');
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js');
const templatePath = path.join(dist, 'index.html');

if (!fs.existsSync(templatePath) || !fs.existsSync(ssrEntry)) {
  console.error('prerender: faltan dist/index.html o dist-ssr/entry-server.js (ejecuta antes vite build y vite build --ssr).');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
// La portada se prerenderiza sobre dist/index.html; las rutas sin prerender (paneles, /gracias, filtros) usan esta base vacía.
fs.writeFileSync(path.join(dist, 'app-shell.html'), template, 'utf8');
const { render, seedContent, resolvePageMeta } = await import(pathToFileURL(ssrEntry).href);

const content = loadContent();
const readIndex = name => JSON.parse(fs.readFileSync(path.join(dist, 'data', `${name}-index.json`), 'utf8'));
seedContent({
  recetas: content.recetas,
  noticias: content.noticias,
  recetasIndex: readIndex('recetas'),
  noticiasIndex: readIndex('noticias')
});

const esc = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`index.html no tiene la etiqueta ${label}`);
  return html.replace(pattern, replacement);
}

const metaContent = (html, attr, key, value) =>
  replaceOnce(html, new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), (_, a, b) => `${a}${esc(value)}${b}`, `${attr}=${key}`);

function withHead(html, meta) {
  const v = resolvePageMeta(meta);
  let out = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(v.title)}</title>`, 'title');
  out = metaContent(out, 'name', 'description', v.description);
  out = metaContent(out, 'name', 'robots', v.robots);
  out = replaceOnce(out, /(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${esc(v.url)}${b}`, 'canonical');
  out = metaContent(out, 'property', 'og:title', v.title);
  out = metaContent(out, 'property', 'og:description', v.description);
  out = metaContent(out, 'property', 'og:url', v.url);
  out = metaContent(out, 'property', 'og:type', v.type);
  out = metaContent(out, 'property', 'og:image', v.imageUrl);
  out = metaContent(out, 'name', 'twitter:title', v.title);
  out = metaContent(out, 'name', 'twitter:description', v.description);
  out = metaContent(out, 'name', 'twitter:image', v.imageUrl);
  return out;
}

const paths = prerenderPaths(sinOcultas(content));
const started = Date.now();
let written = 0;
const failures = [];

for (const route of paths) {
  try {
    const { html, meta } = render(route);
    if (!meta) throw new Error('la página no declaró su título y descripción');
    const page = replaceOnce(withHead(template, meta), /<div id="root"><\/div>/, () => `<div id="root">${html}</div>`, 'root');
    const file = path.join(dist, ...route.split('/').filter(Boolean), 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, page, 'utf8');
    written++;
  } catch (error) {
    failures.push(`${route}: ${error.message}`);
  }
}

console.log(`prerender: ${written}/${paths.length} páginas en ${((Date.now() - started) / 1000).toFixed(1)} s`);
if (failures.length) {
  // Una página que falla sigue sirviéndose como siempre (sin prerender); no se bloquea el despliegue de la tienda.
  console.warn(`prerender: ${failures.length} páginas sin prerender:\n  ${failures.slice(0, 20).join('\n  ')}`);
}

// Firebase puede dejar conexiones abiertas al importarse en Node; el script ya terminó su trabajo.
process.exit(0);
