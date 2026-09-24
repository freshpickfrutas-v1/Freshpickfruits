// Utilidades compartidas: fechas en hora de Colombia, reintentos, JSON, texto y red.
import fs from 'node:fs';
import path from 'node:path';
import { PAUSA_REINTENTO_MS, REINTENTOS, TIMEZONE } from './config.mjs';

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

/** Runs fn up to REINTENTOS times, waiting PAUSA_REINTENTO_MS between attempts. */
export async function conReintentos(nombre, fn, { intentos = REINTENTOS, pausa = PAUSA_REINTENTO_MS } = {}) {
  let ultimoError;
  for (let i = 1; i <= intentos; i++) {
    try {
      return await fn(i);
    } catch (err) {
      ultimoError = err;
      log(`⚠️  ${nombre}: intento ${i}/${intentos} falló: ${err.message}`);
      if (err.noReintentar) break;
      if (i < intentos) await sleep(pausa);
    }
  }
  throw ultimoError;
}

// --- Fechas (todas en hora de Colombia) ---

/** { fecha: 'YYYY-MM-DD', diaSemana: 1 (lunes) … 7 (domingo) } in Colombia time. */
export function hoyColombia(ahora = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
      .formatToParts(ahora)
      .map(p => [p.type, p.value])
  );
  const dias = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return { fecha: `${partes.year}-${partes.month}-${partes.day}`, diaSemana: dias[partes.weekday] };
}

export function sumarDias(fechaIso, dias) {
  const [y, m, d] = fechaIso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + dias));
  return t.toISOString().slice(0, 10);
}

/** Monday (YYYY-MM-DD) of the Colombia week that contains the given date. */
export function lunesDeLaSemana(fechaIso, diaSemana) {
  return sumarDias(fechaIso, -(diaSemana - 1));
}

// --- Archivos ---

export function leerJson(archivo, porDefecto) {
  if (!fs.existsSync(archivo)) return porDefecto;
  return JSON.parse(fs.readFileSync(archivo, 'utf8'));
}

export function escribirJson(archivo, datos) {
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, JSON.stringify(datos, null, 2) + '\n', 'utf8');
}

export function leerCarpetaJson(carpeta) {
  if (!fs.existsSync(carpeta)) return [];
  return fs.readdirSync(carpeta)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(carpeta, f), 'utf8')));
}

// --- Texto ---

export function slugify(texto, max = 80) {
  const base = texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length <= max) return base;
  return base.slice(0, max).replace(/-[^-]*$/, '');
}

/** Whole-word, accent-aware, case-insensitive search. Returns the words found. */
export function buscarPalabras(texto, palabras) {
  const encontradas = [];
  for (const palabra of palabras) {
    const patron = palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${patron}(?![\\p{L}\\p{N}])`, 'iu');
    if (re.test(texto)) encontradas.push(palabra);
  }
  return encontradas;
}

export function contarPalabras(texto) {
  return (texto.match(/[\p{L}\p{N}]+/gu) ?? []).length;
}

export function quitarHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h\d|li|div)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#039;|&apos;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

// --- Red ---

const USER_AGENT = 'FreshPickContentBot/1.0 (+https://www.freshpickfruits.com)';

export async function descargar(url, { tipo = 'text', timeout = 30_000, headers = {} } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, ...headers },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  if (tipo === 'json') return res.json();
  if (tipo === 'buffer') return Buffer.from(await res.arrayBuffer());
  return res.text();
}

/** True if the URL answers with a 2xx/3xx status. */
export async function urlResponde(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000)
      });
      if (res.status < 400) return true;
      if (method === 'GET') return false;
    } catch {
      if (method === 'GET') return false;
    }
  }
  return false;
}

/** Follows one redirect hop manually and returns the final URL (used for Google grounding links). */
export async function resolverRedireccion(url) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(20_000) });
    const destino = res.headers.get('location');
    return destino ? new URL(destino, url).toString() : url;
  } catch {
    return url;
  }
}

export function dominioDe(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
