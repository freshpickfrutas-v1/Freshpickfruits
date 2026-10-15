// Etiquetas automáticas para recetas y noticias.
//
// Se calculan a partir del contenido (título, extracto, ingredientes, subtítulos), así que
// cubren el contenido existente y el que publique la automatización, sin editar los JSON.
// Si una pieza trae su propio campo `tags: ["..."]`, esas etiquetas se suman a las automáticas.
//
// Este archivo lo usan tanto la web (TypeScript) como scripts/generar-sitemap.mjs (Node).

/** Minúsculas y sin tildes, para comparar y buscar. */
export function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Cada regla se prueba sobre texto ya normalizado (sin tildes, en minúsculas).
const RECIPE_RULES = [
  { id: 'avena', label: 'Avena', pattern: /\bavena\b/ },
  { id: 'canela', label: 'Canela', pattern: /\bcanela\b/ },
  { id: 'chia', label: 'Chía', pattern: /\bchia\b/ },
  { id: 'miel', label: 'Miel', pattern: /\bmiel\b/ },
  { id: 'limon', label: 'Limón', pattern: /\blimon(es)?\b/ },
  { id: 'yogur', label: 'Yogur', pattern: /\byogur(t)?\b|\bkumis\b/ },
  { id: 'queso', label: 'Queso', pattern: /\bqueso\b/ },
  { id: 'pollo', label: 'Pollo', pattern: /\bpollo\b|\bpechuga/ },
  { id: 'platano', label: 'Plátano', pattern: /\bplatano\b|\bbanano\b/ },
  { id: 'espinaca', label: 'Espinaca', pattern: /\bespinaca\b/ },
  { id: 'frutos-secos', label: 'Frutos secos', pattern: /\bnueces\b|\balmendras?\b|\bmani\b/ },
  { id: 'granola', label: 'Granola', pattern: /\bgranola\b/ },
  { id: 'menta', label: 'Menta y hierbabuena', pattern: /\bmenta\b|\bhierbabuena\b/ },
  { id: 'huevo', label: 'Huevo', pattern: /\bhuevos?\b|\bclaras? de huevo\b/ },
  { id: 'vainilla', label: 'Vainilla', pattern: /\bvainilla\b/ },
  { id: 'panela', label: 'Panela', pattern: /\bpanela\b/ },
  { id: 'aguacate', label: 'Aguacate', pattern: /\baguacate\b/ },
  { id: 'harina', label: 'Harina', pattern: /\bharina\b/ },
  { id: 'mantequilla', label: 'Mantequilla', pattern: /\bmantequilla\b/ }
];

const NEWS_RULES = [
  { id: 'salud-cardiovascular', label: 'Salud cardiovascular', pattern: /cardiovascular|corazon|cardiac|presion arterial/ },
  { id: 'cerebro-y-memoria', label: 'Cerebro y memoria', pattern: /cerebro|cognitiv|memoria|neuro/ },
  { id: 'salud-digestiva', label: 'Salud digestiva', pattern: /digestiv|intestin|\bfibra\b|microbiota/ },
  { id: 'antioxidantes', label: 'Antioxidantes', pattern: /antioxidante|antocianina|polifenol|flavonoide/ },
  { id: 'vitaminas-y-minerales', label: 'Vitaminas y minerales', pattern: /vitamina|mineral|nutricional|calorias|nutrientes/ },
  { id: 'poscosecha', label: 'Poscosecha', pattern: /poscosecha|almacenamiento|conservan|conservacion|vida util/ },
  { id: 'maduracion', label: 'Maduración', pattern: /madurac|madurez/ },
  { id: 'genetica', label: 'Genética', pattern: /genetic|\bgen\b|vcpif/ },
  { id: 'procesamiento', label: 'Procesamiento', pattern: /procesamiento|termic|alta presion/ },
  { id: 'ejercicio', label: 'Ejercicio y deporte', pattern: /ejercicio|deporte|actividad fisica|oxidacion de grasas/ },
  { id: 'cultivo', label: 'Cultivo', pattern: /cultivo|cultivar|cosecha|finca|riego|poda|crecimiento|firmeza/ },
  { id: 'guasca', label: 'Guasca y alta montaña', pattern: /guasca|alta montana|2\.?800/ },
  { id: 'estudios', label: 'Estudios científicos', pattern: /estudio|ensayo|investigacion|cientific|ciencia/ },
  { id: 'habitos', label: 'Hábitos saludables', pattern: /rutina|habito|dia a dia|incluir|alimentacion diaria/ }
];

const RECIPE_LABELS = Object.fromEntries(RECIPE_RULES.map(r => [r.id, r.label]));
const NEWS_LABELS = Object.fromEntries(NEWS_RULES.map(r => [r.id, r.label]));
const DERIVED_LABELS = { 'sin-coccion': 'Sin cocción', 'al-horno': 'Al horno' };

function match(rules, text) {
  return rules.filter(rule => rule.pattern.test(text)).map(rule => rule.id);
}

function withManual(auto, item) {
  const manual = Array.isArray(item.tags) ? item.tags.map(slugify).filter(Boolean) : [];
  return [...new Set([...auto, ...manual])];
}

export function recipeTagIds(recipe) {
  // "Leche de almendras" es una bebida, no un fruto seco.
  const text = normalize([recipe.title, ...(recipe.ingredients ?? []).map(i => i.text)].join(' | '))
    .replace(/(leche|bebida|agua) (vegetal )?de (almendras?|coco)/g, '');
  const ids = match(RECIPE_RULES, text);
  // "Papel para hornear" / "papel de horno" no significan que la receta se hornee.
  const steps = normalize((recipe.steps ?? []).join(' ')).replace(/papel (para hornear|de horno|encerado)/g, '');
  if ((recipe.cookMinutes ?? 0) === 0) ids.push('sin-coccion');
  if (/\bhornea|\bhorno\b|precalienta/.test(steps) && !/sin horno/.test(normalize(recipe.title))) ids.push('al-horno');
  return withManual(ids, recipe);
}

export function articleTagIds(article) {
  const headings = (article.blocks ?? []).filter(b => b.type === 'h2' || b.type === 'h3').map(b => b.text);
  const text = normalize([article.title, article.excerpt, article.metaDescription, ...headings].join(' | '));
  return withManual(match(NEWS_RULES, text), article);
}

/** Nombre legible de una etiqueta; las manuales sin regla se muestran con la primera letra en mayúscula. */
export function tagLabel(id) {
  const known = RECIPE_LABELS[id] ?? NEWS_LABELS[id] ?? DERIVED_LABELS[id];
  if (known) return known;
  const plain = id.replace(/-/g, ' ');
  return plain.charAt(0).toUpperCase() + plain.slice(1);
}
