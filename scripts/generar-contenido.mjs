// Genera los datos que la web carga bajo demanda, a partir de src/content/:
//   public/data/recetas-index.json, public/data/noticias-index.json   (resumen liviano de todo lo publicado)
//   public/data/recetas/<slug>.json, public/data/noticias/<slug>.json (la pieza completa)
//
// Así el JavaScript de la web no incluye el contenido: cada página pide solo lo que muestra, y la
// biblioteca puede crecer sin hacer más pesada la carga. Se ejecuta antes de cada build y del servidor local.
//
// Uso manual: node scripts/generar-contenido.mjs
import fs from 'node:fs';
import path from 'node:path';
import { loadContent, root } from './contenido-publicado.mjs';
import { articleTagIds, normalize, recipeTagIds, tagSearchText } from '../src/lib/tagging.mjs';

const out = path.join(root, 'public', 'data');
fs.rmSync(out, { recursive: true, force: true });

function summarizeRecipe(r) {
  const { ingredients, steps, tips, tags: _manual, ...card } = r;
  const tags = recipeTagIds(r);
  return {
    ...card,
    tags,
    search: normalize([r.title, r.excerpt, ...ingredients.map(i => i.text), ...tags.map(tagSearchText)].join(' '))
  };
}

function summarizeArticle(a) {
  const { blocks, fuentes, tags: _manual, ...card } = a;
  const tags = articleTagIds(a);
  const headings = blocks.filter(b => b.type === 'h2' || b.type === 'h3').map(b => b.text);
  return {
    ...card,
    tags,
    search: normalize([a.title, a.excerpt, a.metaDescription, ...headings, ...tags.map(tagSearchText)].join(' '))
  };
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

const { recetas, noticias } = loadContent();
for (const [name, list, summarize] of [
  ['recetas', recetas, summarizeRecipe],
  ['noticias', noticias, summarizeArticle]
]) {
  write(path.join(out, `${name}-index.json`), list.map(summarize));
  for (const item of list) write(path.join(out, name, `${item.slug}.json`), item);
}

const kb = file => (fs.statSync(path.join(out, file)).size / 1024).toFixed(1);
console.log(
  `datos: ${recetas.length} recetas (índice ${kb('recetas-index.json')} KB), ${noticias.length} noticias (índice ${kb('noticias-index.json')} KB)`
);
