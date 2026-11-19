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

// Las etiquetas se calculan siempre sobre el texto en español (mismos ids en ambos idiomas);
// la búsqueda usa el texto del idioma de la pieza más el nombre de la etiqueta en ese idioma.
function summarizeRecipe(r, base, lang) {
  const { ingredients, steps, tips, tags: _manual, sinTraducir: _s, ...card } = r;
  const tags = recipeTagIds(base);
  return {
    ...card,
    tags,
    search: normalize([r.title, r.excerpt, ...ingredients.map(i => i.text), ...tags.map(t => tagSearchText(t, lang))].join(' '))
  };
}

function summarizeArticle(a, base, lang) {
  const { blocks, fuentes, tags: _manual, sinTraducir: _s, ...card } = a;
  const tags = articleTagIds(base);
  const headings = blocks.filter(b => b.type === 'h2' || b.type === 'h3').map(b => b.text);
  return {
    ...card,
    tags,
    search: normalize([a.title, a.excerpt, a.metaDescription, ...headings, ...tags.map(t => tagSearchText(t, lang))].join(' '))
  };
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

for (const lang of ['es', 'en']) {
  const { recetas, noticias } = loadContent(lang);
  const base = lang === 'es' ? { recetas, noticias } : loadContent('es');
  const dir = lang === 'es' ? out : path.join(out, 'en');
  for (const [name, list, baseList, summarize] of [
    ['recetas', recetas, base.recetas, summarizeRecipe],
    ['noticias', noticias, base.noticias, summarizeArticle]
  ]) {
    write(path.join(dir, `${name}-index.json`), list.map((item, i) => summarize(item, baseList[i], lang)));
    for (const item of list) {
      const { sinTraducir: _s, ...full } = item;
      write(path.join(dir, name, `${item.slug}.json`), full);
    }
    const missing = list.filter(i => i.sinTraducir).length;
    if (lang === 'en' && missing) console.warn(`datos: ${missing} ${name} sin traducción al inglés (se muestran en español)`);
  }
}

const kb = file => (fs.statSync(path.join(out, file)).size / 1024).toFixed(1);
console.log(`datos: recetas-index ${kb('recetas-index.json')} KB, noticias-index ${kb('noticias-index.json')} KB (es y en)`);
