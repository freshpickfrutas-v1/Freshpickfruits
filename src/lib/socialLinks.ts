// Enlaces y medidas para publicar en X desde el panel de administración.
// Regla de negocio: toda publicación de X lleva SIEMPRE un enlace a la tienda (inicio), que es la página que vende,
// marcado con UTM para ver en Google Analytics cuánto tráfico trae cada publicación.

export const SITIO_TIENDA = 'https://www.freshpickfruits.com';

/** Enlace a la tienda para X, con UTM por publicación (X siempre lo cuenta como 23 caracteres). */
export function enlaceTiendaX(tipo: string, slug?: string): string {
  const campana = [tipo, slug]
    .filter(Boolean)
    .join('-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .slice(0, 60)
    .replace(/-+$/, '');
  return `${SITIO_TIENDA}/?utm_source=x&utm_medium=social&utm_campaign=${campana || 'publicacion'}`;
}

/** Quita cualquier enlace que la IA haya puesto en el texto, para no duplicarlo ni diluir el de la tienda. */
export function quitarEnlaces(texto: string): string {
  return texto.replace(/https?:\/\/\S+/g, '').replace(/[ \t]+/g, ' ').replace(/\s+\n/g, '\n').trim();
}

const RANGOS_PESO_1: [number, number][] = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]];

/** Peso de un texto en X (plan gratis: 280): latinos 1; emojis y otros caracteres 2; un enlace pesa 23. */
export function pesoX(texto: string): number {
  let total = 0;
  for (const c of texto) {
    const cp = c.codePointAt(0)!;
    total += RANGOS_PESO_1.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2;
  }
  return total;
}

/** Texto listo para pegar en X: el texto de la publicación y, en otra línea, el enlace a la tienda. */
export const textoXConEnlace = (copy: string, tipo: string, slug?: string) => `${quitarEnlaces(copy)}\n${enlaceTiendaX(tipo, slug)}`;

/** Abre el redactor de X con el texto y el enlace ya puestos. */
export const intentX = (copy: string, tipo: string, slug?: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(quitarEnlaces(copy))}&url=${encodeURIComponent(enlaceTiendaX(tipo, slug))}`;

/** Peso total de la publicación de X: texto + espacio + enlace (23). Debe ser 280 o menos. */
export const pesoTotalX = (copy: string) => pesoX(quitarEnlaces(copy)) + 1 + 23;
