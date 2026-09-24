// Configuración del sistema de contenido automático de Fresh Pick.
// Todo lo que se puede ajustar sin tocar la lógica está aquí.
import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '..', '..');
export const PATHS = {
  recetas: path.join(ROOT, 'src', 'content', 'recetas'),
  noticias: path.join(ROOT, 'src', 'content', 'noticias'),
  imagenes: path.join(ROOT, 'public', 'img', 'generadas'),
  cola: path.join(ROOT, 'cola-recetas.json'),
  estado: path.join(ROOT, 'automatizacion', 'estado.json'),
  prueba: path.join(ROOT, 'automatizacion', 'prueba')
};
export const IMAGE_URL_PREFIX = '/img/generadas';

export const TIMEZONE = 'America/Bogota';
export const AUTHOR = 'Equipo Fresh Pick';

// --- Metas de publicación ---
export const RECETAS_POR_DIA = 1;
export const NOTICIAS_POR_SEMANA = 7;
export const MAX_NOTICIAS_POR_DIA = 2;
/** Días hacia atrás que cuenta una noticia como "actual". */
export const DIAS_NOTICIA_ACTUAL = 7;
/** Una receta que falla este número de veces pasa a "borrador" y se reporta. */
export const MAX_INTENTOS_RECETA = 3;

// --- Modelos (se prueban en orden; el primero que responda se usa) ---
// If a model is saturated (503) or over its free quota (429), the next one is tried.
export const MODELOS_TEXTO = (process.env.GEMINI_MODELOS_TEXTO ?? 'gemini-3.5-flash,gemini-3.6-flash,gemini-3.8-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite')
  .split(',').map(s => s.trim()).filter(Boolean);
/** Backup search. Gemini 2.5 is closed to new accounts; the 3.x models are tried in order. */
export const MODELOS_BUSQUEDA = (process.env.GEMINI_MODELOS_BUSQUEDA ?? 'gemini-2.5-flash,gemini-3.5-flash-lite,gemini-3.5-flash')
  .split(',').map(s => s.trim()).filter(Boolean);
export const MODELO_IMAGEN_CF = '@cf/black-forest-labs/flux-1-schnell';

// --- Reintentos (plan: 3 intentos con 30 s de pausa) ---
export const REINTENTOS = 3;
export const PAUSA_REINTENTO_MS = Number(process.env.PAUSA_REINTENTO_MS ?? 30_000);

// --- Modos por categoría de noticia ---
// Salud y ciencia siempre pasan por aprobación humana (Pull Request).
export const MODO_POR_CATEGORIA_NOTICIA = {
  'beneficios-arandanos': 'revision',
  'nutricion-ciencia': 'revision',
  'salud-digestiva-bienestar': 'revision',
  'estilo-vida-saludable': 'automatico',
  'cultivo-origen': 'automatico'
};
export const CATEGORIAS_NOTICIA = Object.keys(MODO_POR_CATEGORIA_NOTICIA);
export const CATEGORIAS_RECETA = [
  'smoothies-batidos', 'desayunos', 'postres-saludables', 'snacks-meriendas',
  'ensaladas-platos-frescos', 'bebidas-refrescos', 'preparaciones-conservas'
];

// --- Fuentes de noticias (verificadas: responden y publican sobre arándanos) ---
export const FUENTES_RSS = [
  { id: 'blueberries-consulting', medio: 'Blueberries Consulting', url: 'https://blueberriesconsulting.com/feed/', idioma: 'es', soloArandano: false, categoriaSugerida: 'cultivo-origen' },
  { id: 'portal-fruticola', medio: 'Portal Frutícola', url: 'https://www.portalfruticola.com/feed/', idioma: 'es', soloArandano: true, categoriaSugerida: 'cultivo-origen' },
  { id: 'freshplaza-es', medio: 'FreshPlaza', url: 'https://www.freshplaza.es/rss.xml', idioma: 'es', soloArandano: true, categoriaSugerida: 'cultivo-origen' },
  { id: 'sciencedaily-nutricion', medio: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/health_medicine/nutrition.xml', idioma: 'en', soloArandano: true, categoriaSugerida: 'nutricion-ciencia' }
];
export const PUBMED_QUERY = '(blueberry[tiab] OR blueberries[tiab] OR "vaccinium corymbosum"[tiab] OR "highbush blueberry"[tiab])';

/** Dominios aceptados como fuente cuando la noticia viene de la búsqueda con IA (respaldo). */
export const DOMINIOS_CONFIABLES = [
  'pubmed.ncbi.nlm.nih.gov', 'ncbi.nlm.nih.gov', 'nih.gov', 'usda.gov', 'fao.org', 'who.int',
  'sciencedaily.com', 'eurekalert.org', 'harvard.edu', 'mayoclinic.org',
  'blueberriesconsulting.com', 'portalfruticola.com', 'freshplaza.es', 'freshplaza.com',
  'minagricultura.gov.co', 'ica.gov.co', 'agronet.gov.co', 'procolombia.co', 'dane.gov.co',
  'agraria.pe', 'redagricola.com', 'nature.com', 'sciencedirect.com', 'mdpi.com'
];
/** Además de la lista, se aceptan universidades. */
export const SUFIJOS_UNIVERSIDAD = ['.edu', '.edu.co', '.ac.uk', '.edu.pe', '.edu.mx', '.edu.ar', '.edu.cl'];

// --- Noticias de la finca (issues de GitHub con esta etiqueta) ---
export const ETIQUETA_NOTICIA_FINCA = 'noticia-finca';

// --- Textos fijos ---
export const CREDITO_IMAGEN_IA = 'Imagen ilustrativa generada con IA';
export const CREDITO_FOTO_PROPIA = 'Foto: Fresh Pick';

export const CONTEXTO_MARCA = `Fresh Pick cultiva arándanos premium de alta montaña en la Vereda Santa Bárbara, Guasca (Cundinamarca, Colombia), a más de 2.800 m.s.n.m. Polinización 100% natural con 7 colmenas de abejas, riego con agua de manantial y agua lluvia, tierra negra, cosecha manual en el punto óptimo de madurez, sin ceras artificiales y con la pruina natural intacta. Dulzor natural de 13° a 15° Brix. Certificaciones GLOBALG.A.P., GRASP e ICA. Entregas a domicilio los martes y miércoles de 8:00 a.m. a 3:00 p.m. Pedidos por WhatsApp +57 317 893 1026.`;

// --- Reglas del revisor automático ---
/** Afirmaciones médicas prohibidas en recetas y en noticias automáticas. */
export const PALABRAS_MEDICAS_PROHIBIDAS = [
  'cura', 'curar', 'previene', 'prevenir', 'tratamiento',
  'desintoxica', 'detox', 'quema grasa', 'quemar grasa', 'milagro', 'milagroso', 'adelgaza',
  'adelgazar', 'elimina el cáncer', 'anticancerígeno', 'reemplaza el medicamento'
];
/** En noticias de salud (que revisa una persona) solo se bloquean las promesas más graves. */
export const PALABRAS_MEDICAS_GRAVES = ['cura', 'curar', 'milagro', 'milagroso', 'reemplaza el medicamento'];
/** Frutas que no pueden aparecer como ingrediente salvo que estén en el título aprobado. */
export const OTRAS_FRUTAS = [
  'fresa', 'fresas', 'frambuesa', 'frambuesas', 'mora', 'moras', 'mango', 'piña', 'manzana', 'pera',
  'naranja', 'mandarina', 'uva', 'uvas', 'kiwi', 'durazno', 'melocotón', 'cereza', 'cerezas',
  'maracuyá', 'guanábana', 'papaya', 'sandía', 'melón', 'lulo', 'feijoa', 'granadilla', 'guayaba',
  'banano', 'plátano', 'banana', 'arándano rojo', 'cranberry', 'uchuva', 'tomate de árbol'
];
