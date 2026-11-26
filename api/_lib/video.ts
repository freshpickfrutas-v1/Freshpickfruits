// Utilidades puras del video diario (sin red): identificadores y búsqueda de la noticia que le corresponde.

const SIN_ACENTOS = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** "ABA_MeJA 1" → "aba-meja-1" */
export function slugify(texto: string): string {
  return SIN_ACENTOS(texto).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'video';
}

/** Fecha (AAAA-MM-DD) en hora de Bogotá (UTC-5), que es la que usa Fresh Pick. */
export function fechaBogota(iso: string): string {
  return new Date(new Date(iso).getTime() - 5 * 3600 * 1000).toISOString().slice(0, 10);
}

const PALABRAS_VACIAS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'en', 'y', 'con', 'para', 'por', 'que', 'una', 'uno', 'un', 'al', 'como', 'sobre', 'sin', 'su', 'sus', 'se', 'lo', 'es', 'a', 'o',
  'video', 'aprobado', 'nuevo', 'nueva',
]);
/** Palabras tan comunes en este sitio que no sirven para distinguir una noticia de otra. */
const PALABRAS_GENERICAS = new Set(['arandano', 'arandanos', 'fruta', 'frutas', 'beneficios', 'estudio', 'salud']);

export function palabrasClave(texto: string): string[] {
  const palabras = SIN_ACENTOS(texto).toLowerCase().split(/[^a-z0-9]+/).filter(p => p.length >= 2 && !PALABRAS_VACIAS.has(p));
  return [...new Set(palabras)];
}

/**
 * Elige la noticia a la que pertenece un video según su título. Devuelve el slug o null.
 * Exige al menos 2 palabras distintivas en común (o todas, si el título solo trae una o dos). Ante un empate gana la más reciente.
 */
export function buscarNoticia(titulo: string, noticias: { slug: string; title: string; date?: string; video?: unknown }[]): string | null {
  const clave = palabrasClave(titulo).filter(p => !PALABRAS_GENERICAS.has(p));
  if (clave.length === 0) return null;
  const minimo = Math.min(2, clave.length);
  let mejor: { slug: string; puntos: number; date: string } | null = null;
  for (const n of noticias) {
    if (!n.slug || n.video) continue; // si ya tiene video, no se le pone otro
    const tokens = new Set(palabrasClave(n.title));
    const puntos = clave.filter(p => tokens.has(p)).length;
    if (puntos < minimo) continue;
    const date = String(n.date ?? '');
    if (!mejor || puntos > mejor.puntos || (puntos === mejor.puntos && date > mejor.date)) mejor = { slug: n.slug, puntos, date };
  }
  return mejor?.slug ?? null;
}

/** Duración, ancho y alto de un MP4, leyendo solo su cabecera (sin ejecutarlo). */
export function medirMp4(b: Buffer): { duracion?: number; ancho?: number; alto?: number } {
  const cajas: { tipo: string; p: number; tam: number; h: number }[] = [];
  const recorrer = (ini: number, fin: number) => {
    let p = ini;
    while (p + 8 <= fin) {
      let tam = b.readUInt32BE(p);
      const tipo = b.subarray(p + 4, p + 8).toString('latin1');
      let h = 8;
      if (tam === 1) { tam = Number(b.readBigUInt64BE(p + 8)); h = 16; }
      if (tam === 0) tam = fin - p;
      if (tam < h || p + tam > fin) break;
      cajas.push({ tipo, p, tam, h });
      if (['moov', 'trak', 'mdia'].includes(tipo)) recorrer(p + h, p + tam);
      p += tam;
    }
  };
  try {
    recorrer(0, b.length);
    const salida: { duracion?: number; ancho?: number; alto?: number } = {};
    const mvhd = cajas.find(c => c.tipo === 'mvhd');
    if (mvhd) {
      const base = mvhd.p + mvhd.h;
      const v = b[base];
      const o = base + 4 + (v === 1 ? 16 : 8);
      const escala = b.readUInt32BE(o);
      const dur = v === 1 ? Number(b.readBigUInt64BE(o + 4)) : b.readUInt32BE(o + 4);
      if (escala > 0) salida.duracion = Math.round((dur / escala) * 10) / 10;
    }
    for (const t of cajas.filter(c => c.tipo === 'tkhd')) {
      const base = t.p + t.h;
      const o = base + (b[base] === 1 ? 88 : 76);
      const ancho = Math.round(b.readUInt32BE(o) / 65536);
      const alto = Math.round(b.readUInt32BE(o + 4) / 65536);
      if (ancho > 0 && alto > 0) { salida.ancho = ancho; salida.alto = alto; break; }
    }
    return salida;
  } catch {
    return {};
  }
}
