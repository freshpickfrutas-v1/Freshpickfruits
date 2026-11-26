// Traducción al inglés de recetas y noticias con Gemini.
// Guarda solo los campos traducidos en src/content-en/<recetas|noticias>/<slug>.json (el mismo formato de las
// traducciones hechas a mano; el sitio completa el resto con la pieza en español).
// Es a prueba de fallos: si Gemini cambia la estructura (bloques, pasos, ingredientes), la traducción se descarta
// y la pieza se muestra en español hasta que se traduzca otra vez.
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, ROOT } from './config.mjs';
import { generarJson } from './gemini.mjs';
import { leerCarpetaJson, log } from './util.mjs';

const CARPETA_EN = path.join(ROOT, 'src', 'content-en');

const SISTEMA = `Eres un traductor profesional de español a inglés (inglés de EE. UU.) para Fresh Pick, marca colombiana de arándanos premium de alta montaña (Guasca, Cundinamarca).
Reglas:
- Traduce con naturalidad y fidelidad: no agregues, quites ni inventes información.
- Conserva todas las cifras, unidades, fórmulas, nombres propios y nombres de revistas científicas.
- Deja "Fresh Pick" sin traducir. "Equipo Fresh Pick" = "Fresh Pick Team". "Imagen ilustrativa generada con IA" = "Illustrative AI-generated image".
- En recetas, conserva términos colombianos como panela o cuajada (aclarándolos entre paréntesis la primera vez).
- Mantén el mismo número de elementos en listas, pasos, ingredientes y bloques, y en el mismo orden.
- Responde SOLO con el JSON del esquema, sin texto adicional.`;

const TEXTO = { type: 'string' };
const LISTA_TEXTO = { type: 'array', items: TEXTO };
const ESQUEMAS = {
  noticias: {
    type: 'object',
    properties: {
      title: TEXTO,
      metaDescription: TEXTO,
      excerpt: TEXTO,
      imageAlt: TEXTO,
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: TEXTO, text: TEXTO, items: LISTA_TEXTO,
            caption: TEXTO, headers: LISTA_TEXTO, rows: { type: 'array', items: LISTA_TEXTO }
          },
          required: ['type']
        }
      },
      author: TEXTO,
      imagenCredit: TEXTO
    },
    required: ['title', 'metaDescription', 'excerpt', 'imageAlt', 'blocks']
  },
  recetas: {
    type: 'object',
    properties: {
      title: TEXTO,
      excerpt: TEXTO,
      imageAlt: TEXTO,
      ingredients: { type: 'array', items: { type: 'object', properties: { text: TEXTO }, required: ['text'] } },
      steps: LISTA_TEXTO,
      tips: LISTA_TEXTO,
      imagenCredit: TEXTO
    },
    required: ['title', 'excerpt', 'imageAlt', 'ingredients', 'steps']
  }
};

const textoValido = v => typeof v === 'string' && v.trim().length > 0;

/** Campos de la pieza en español que se envían a traducir. */
function origen(tipo, p) {
  if (tipo === 'noticias') {
    return {
      title: p.title, metaDescription: p.metaDescription, excerpt: p.excerpt, imageAlt: p.imageAlt,
      blocks: p.blocks.map(b => {
        if (b.type === 'ul' || b.type === 'ol') return { type: b.type, items: b.items };
        if (b.type === 'table') return { type: b.type, caption: b.caption, headers: b.headers, rows: b.rows };
        return { type: b.type, text: b.text };
      }),
      ...(p.author ? { author: p.author } : {}),
      ...(p.imagenCredit ? { imagenCredit: p.imagenCredit } : {})
    };
  }
  return {
    title: p.title, excerpt: p.excerpt, imageAlt: p.imageAlt,
    ingredients: p.ingredients.map(i => ({ text: i.text })),
    steps: p.steps,
    tips: p.tips ?? [],
    ...(p.imagenCredit ? { imagenCredit: p.imagenCredit } : {})
  };
}

/** Une la respuesta de Gemini con la estructura original y comprueba que nada falte ni sobre. Lanza error si algo no cuadra. */
export function armar(tipo, p, t) {
  for (const campo of ['title', 'excerpt', 'imageAlt']) {
    if (!textoValido(t?.[campo])) throw new Error(`falta el campo traducido "${campo}"`);
  }
  const extra = {};
  if (p.imagenCredit) extra.imagenCredit = textoValido(t.imagenCredit) ? t.imagenCredit : p.imagenCredit;

  if (tipo === 'noticias') {
    if (!textoValido(t.metaDescription)) throw new Error('falta el campo traducido "metaDescription"');
    if (!Array.isArray(t.blocks) || t.blocks.length !== p.blocks.length) throw new Error('el número de bloques cambió');
    const blocks = p.blocks.map((b, i) => {
      const tb = t.blocks[i];
      if (tb?.type !== b.type) throw new Error(`el tipo del bloque ${i + 1} cambió`);
      if (b.type === 'ul' || b.type === 'ol') {
        if (!Array.isArray(tb.items) || tb.items.length !== b.items.length || !tb.items.every(textoValido)) throw new Error(`la lista del bloque ${i + 1} no coincide`);
        return { ...b, items: tb.items };
      }
      if (b.type === 'table') {
        const filasOk = Array.isArray(tb.rows) && tb.rows.length === b.rows.length && tb.rows.every((fila, j) => Array.isArray(fila) && fila.length === b.rows[j].length && fila.every(textoValido));
        const encabezadosOk = Array.isArray(tb.headers) && tb.headers.length === b.headers.length && tb.headers.every(textoValido);
        if (!filasOk || !encabezadosOk) throw new Error(`la tabla del bloque ${i + 1} no coincide`);
        return { ...b, ...(b.caption ? { caption: textoValido(tb.caption) ? tb.caption : b.caption } : {}), headers: tb.headers, rows: tb.rows };
      }
      if (!textoValido(tb.text)) throw new Error(`el bloque ${i + 1} quedó vacío`);
      return { ...b, text: tb.text };
    });
    return {
      title: t.title, metaDescription: t.metaDescription, excerpt: t.excerpt, imageAlt: t.imageAlt, blocks,
      ...(p.author ? { author: textoValido(t.author) ? t.author : p.author } : {}),
      ...extra
    };
  }

  if (!Array.isArray(t.ingredients) || t.ingredients.length !== p.ingredients.length || !t.ingredients.every(i => textoValido(i?.text))) throw new Error('los ingredientes no coinciden');
  if (!Array.isArray(t.steps) || t.steps.length !== p.steps.length || !t.steps.every(textoValido)) throw new Error('los pasos no coinciden');
  const tips = p.tips ?? [];
  if (tips.length && (!Array.isArray(t.tips) || t.tips.length !== tips.length || !t.tips.every(textoValido))) throw new Error('los consejos no coinciden');
  return {
    title: t.title, excerpt: t.excerpt, imageAlt: t.imageAlt,
    ingredients: p.ingredients.map((ing, i) => ({ ...ing, text: t.ingredients[i].text })),
    steps: t.steps,
    ...(tips.length ? { tips: t.tips } : {}),
    ...extra
  };
}

/** Traduce una pieza ('recetas' | 'noticias'). Devuelve { ruta, contenido } listo para escribir y subir. */
export async function traducirPieza(tipo, pieza) {
  const t = await generarJson({
    nombre: `traducir ${tipo}/${pieza.slug}`,
    sistema: SISTEMA,
    prompt: JSON.stringify(origen(tipo, pieza)),
    schema: ESQUEMAS[tipo],
    temperatura: 0.2
  });
  const en = armar(tipo, pieza, t);
  return { ruta: path.join('src', 'content-en', tipo, `${pieza.slug}.json`), contenido: JSON.stringify(en, null, 2) + '\n' };
}

/** Piezas publicadas que todavía no tienen versión en inglés (hasta `max`, las más recientes primero). */
export function pendientesDeTraducir(max) {
  const salida = [];
  for (const tipo of ['recetas', 'noticias']) {
    for (const pieza of leerCarpetaJson(PATHS[tipo])) {
      if (pieza.estado === 'borrador' || !pieza.slug) continue;
      if (fs.existsSync(path.join(CARPETA_EN, tipo, `${pieza.slug}.json`))) continue;
      salida.push({ tipo, pieza });
    }
  }
  return salida.sort((a, b) => String(b.pieza.date ?? '').localeCompare(String(a.pieza.date ?? ''))).slice(0, max);
}

/** Traduce las piezas pendientes. Un fallo no detiene a las demás. Devuelve los archivos creados. */
export async function traducirPendientes(max) {
  const archivos = [];
  for (const { tipo, pieza } of pendientesDeTraducir(max)) {
    try {
      archivos.push(await traducirPieza(tipo, pieza));
      log(`   Traducida al inglés: ${tipo}/${pieza.slug}`);
    } catch (err) {
      if (err.fatal) throw err;
      log(`   No se pudo traducir ${tipo}/${pieza.slug}: ${err.message}`);
    }
  }
  return archivos;
}
