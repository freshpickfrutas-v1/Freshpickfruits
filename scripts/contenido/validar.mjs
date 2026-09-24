// Revisor automático: si una pieza no pasa, queda como borrador y no se publica.
import fs from 'node:fs';
import path from 'node:path';
import {
  CATEGORIAS_NOTICIA, CATEGORIAS_RECETA, OTRAS_FRUTAS, PALABRAS_MEDICAS_GRAVES,
  PALABRAS_MEDICAS_PROHIBIDAS, PATHS
} from './config.mjs';
import { buscarPalabras, contarPalabras, urlResponde } from './util.mjs';

const DIFICULTADES = ['Fácil', 'Intermedio', 'Avanzado'];
const TIPOS_BLOQUE = ['p', 'h2', 'h3', 'ul', 'ol', 'quote', 'table'];

/** Slugs taken by published files or by pieces created earlier in this same run. */
export const slugsReservados = new Set();

export function slugOcupado(slug) {
  if (slugsReservados.has(slug)) return true;
  return fs.existsSync(path.join(PATHS.recetas, `${slug}.json`)) || fs.existsSync(path.join(PATHS.noticias, `${slug}.json`));
}

const texto = v => typeof v === 'string' && v.trim().length > 0;
const largo = (v, min, max) => texto(v) && v.length >= min && v.length <= max;

/** Returns a list of problems (empty = OK). `tituloAprobado` is the queue title (may name a second fruit). */
export function validarReceta(r, { tituloAprobado = '' } = {}) {
  const p = [];
  if (!/^[a-z0-9-]+$/.test(r.slug ?? '')) p.push('slug inválido');
  else if (slugOcupado(r.slug)) p.push(`el slug "${r.slug}" ya existe`);
  if (!largo(r.title, 10, 110)) p.push('título ausente o de largo inválido');
  if (!largo(r.excerpt, 70, 260)) p.push('resumen (excerpt) debe tener entre 70 y 260 caracteres');
  if (!largo(r.imageAlt, 20, 220)) p.push('falta el texto alternativo de la imagen');
  if (!texto(r.image)) p.push('no tiene imagen (regla: nunca publicar sin imagen)');
  if (!CATEGORIAS_RECETA.includes(r.category)) p.push(`categoría inválida: ${r.category}`);
  for (const c of r.extraCategories ?? []) if (!CATEGORIAS_RECETA.includes(c)) p.push(`categoría extra inválida: ${c}`);
  if (!DIFICULTADES.includes(r.difficulty)) p.push(`dificultad inválida: ${r.difficulty}`);
  if (!(Number.isInteger(r.servings) && r.servings >= 1 && r.servings <= 24)) p.push('porciones fuera de rango');
  for (const k of ['prepMinutes', 'cookMinutes', 'restMinutes']) {
    const v = r[k] ?? 0;
    if (!(Number.isInteger(v) && v >= 0 && v <= 24 * 60)) p.push(`${k} fuera de rango`);
  }
  if (!(r.prepMinutes >= 1)) p.push('tiempo de preparación debe ser al menos 1 minuto');

  const ingredientes = r.ingredients ?? [];
  if (ingredientes.length < 3) p.push('menos de 3 ingredientes');
  if (!ingredientes.some(i => i.freshPick && /ar[aá]ndano/i.test(i.text))) p.push('ningún ingrediente destaca los arándanos Fresh Pick');
  if ((r.steps ?? []).length < 3) p.push('menos de 3 pasos');
  if ((r.tips ?? []).length < 1) p.push('sin tips');

  const todoElTexto = [r.title, r.excerpt, ...ingredientes.map(i => i.text), ...(r.steps ?? []), ...(r.tips ?? [])].join('\n');
  const medicas = buscarPalabras(todoElTexto, PALABRAS_MEDICAS_PROHIBIDAS);
  if (medicas.length) p.push(`afirmaciones médicas no permitidas: ${medicas.join(', ')}`);

  const frutasPermitidas = buscarPalabras(tituloAprobado, OTRAS_FRUTAS);
  const otrasFrutas = buscarPalabras(ingredientes.map(i => i.text).join('\n'), OTRAS_FRUTAS)
    .filter(f => !frutasPermitidas.includes(f));
  if (otrasFrutas.length) p.push(`usa otras frutas como ingrediente: ${otrasFrutas.join(', ')}`);

  return p;
}

/** Validates a news article (text, sources and image). */
export async function validarNoticia(n, { idiomaFuente = 'es', comprobarEnlaces = true } = {}) {
  const p = [];
  if (!/^[a-z0-9-]+$/.test(n.slug ?? '')) p.push('slug inválido');
  else if (slugOcupado(n.slug)) p.push(`el slug "${n.slug}" ya existe`);
  if (!largo(n.title, 20, 130)) p.push('título ausente o de largo inválido');
  if (!largo(n.metaDescription, 110, 170)) p.push('meta description debe tener entre 110 y 170 caracteres');
  if (!largo(n.excerpt, 80, 320)) p.push('resumen (excerpt) de largo inválido');
  if (!largo(n.imageAlt, 20, 220)) p.push('falta el texto alternativo de la imagen');
  if (!texto(n.image)) p.push('no tiene imagen (regla: nunca publicar sin imagen)');
  if (!CATEGORIAS_NOTICIA.includes(n.category)) p.push(`categoría inválida: ${n.category}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.date ?? '')) p.push('fecha inválida');

  const bloques = n.blocks ?? [];
  if (bloques.some(b => !TIPOS_BLOQUE.includes(b.type))) p.push('tipo de bloque desconocido');
  if (bloques.filter(b => b.type === 'h2').length < 2) p.push('menos de 2 subtítulos');
  const cuerpo = bloques.map(b => b.text ?? (b.items ?? []).join(' ')).join('\n');
  const palabras = contarPalabras(cuerpo);
  const [min, max] = idiomaFuente === 'en' ? [550, 1200] : [350, 1100];
  if (palabras < min || palabras > max) p.push(`largo del artículo (${palabras} palabras) fuera de ${min}–${max}`);

  // Farming news legitimately says "tratamiento postcosecha" or "previene hongos", so news only block
  // the serious promises; health news are also reviewed by a person before publishing.
  const lista = [...PALABRAS_MEDICAS_GRAVES, 'desintoxica', 'detox', 'quema grasa', 'adelgaza', 'adelgazar'];
  const medicas = buscarPalabras([n.title, n.excerpt, n.metaDescription, cuerpo].join('\n'), lista);
  if (medicas.length) p.push(`afirmaciones médicas no permitidas: ${medicas.join(', ')}`);

  if (!(n.fuentes ?? []).length) p.push('sin fuentes (regla: si no hay fuente, no se afirma el dato)');
  if (comprobarEnlaces) {
    for (const f of n.fuentes ?? []) {
      if (!(await urlResponde(f.url))) p.push(`la fuente no abre: ${f.url}`);
    }
  }
  return p;
}
