// Escribe una receta de la cola con Gemini, le crea la imagen y la valida.
import { CATEGORIAS_RECETA, CONTEXTO_MARCA, CREDITO_IMAGEN_IA, PATHS } from './config.mjs';
import { generarJson } from './gemini.mjs';
import { crearImagen } from './imagenes.mjs';
import { slugsReservados, validarReceta } from './validar.mjs';
import { leerCarpetaJson, log } from './util.mjs';

const ESQUEMA_RECETA = {
  type: 'object',
  properties: {
    excerpt: { type: 'string', description: 'Resumen atractivo de 1-2 frases (90-220 caracteres) para la tarjeta y la meta description.' },
    imageAlt: { type: 'string', description: 'Texto alternativo descriptivo de la foto del plato (40-180 caracteres).' },
    imagePrompt: { type: 'string', description: 'Descripción EN INGLÉS de la foto ideal del plato terminado para un generador de imágenes (qué se ve, recipiente, ambiente). Sin texto en la imagen.' },
    extraCategories: { type: 'array', items: { type: 'string', enum: CATEGORIAS_RECETA }, description: 'Otras categorías a las que también pertenece (0-2). No repetir la principal.' },
    prepMinutes: { type: 'integer' },
    cookMinutes: { type: 'integer' },
    restMinutes: { type: 'integer', description: 'Nevera, congelador o reposo. 0 si no aplica.' },
    difficulty: { type: 'string', enum: ['Fácil', 'Intermedio', 'Avanzado'] },
    servings: { type: 'integer' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Cantidad y nombre, en medidas usadas en Colombia (tazas, cucharadas, gramos).' },
          freshPick: { type: 'boolean', description: 'true SOLO para el ingrediente de arándanos.' }
        },
        required: ['text', 'freshPick']
      }
    },
    steps: { type: 'array', items: { type: 'string' }, description: '4 a 8 pasos claros y concretos.' },
    tips: { type: 'array', items: { type: 'string' }, description: '2 o 3 consejos prácticos; al menos uno sobre cómo aprovechar o conservar los arándanos.' }
  },
  required: ['excerpt', 'imageAlt', 'imagePrompt', 'extraCategories', 'prepMinutes', 'cookMinutes', 'restMinutes', 'difficulty', 'servings', 'ingredients', 'steps', 'tips']
};

const SISTEMA = `Eres el chef de recetas de Fresh Pick, una marca colombiana de arándanos frescos. Escribes en español de Colombia, cálido y claro, para cocineros caseros.
Contexto de la marca: ${CONTEXTO_MARCA}
Reglas obligatorias:
- El arándano es SIEMPRE la fruta principal. No uses otras frutas, salvo la que aparezca en el título de la receta; limón o lima solo en pequeñas cantidades como condimento.
- Exactamente un ingrediente con freshPick=true, y su texto debe decir "arándanos Fresh Pick".
- Menciona de forma natural (en un paso o en un tip, no en todos) que son arándanos de alta montaña cultivados en Guasca.
- Cero afirmaciones médicas o de salud: nada de "cura", "previene", "desintoxica", "adelgaza", "quema grasa" ni similares.
- Tiempos realistas y en minutos enteros. Receta que realmente funcione.`;

/** Returns { ok, pieza, archivos, problemas } for one queue item. */
export async function crearReceta(item, { fecha }) {
  log(`🍽️  Receta: ${item.titulo}`);
  const existentes = leerCarpetaJson(PATHS.recetas).map(r => r.title);

  const datos = await generarJson({
    nombre: `receta ${item.slug}`,
    sistema: SISTEMA,
    schema: ESQUEMA_RECETA,
    prompt: `Escribe la receta "${item.titulo}" (categoría principal: ${item.categoria}).
No debe parecerse a estas recetas ya publicadas: ${existentes.join('; ')}.`
  });

  const receta = {
    slug: item.slug,
    title: item.titulo,
    excerpt: datos.excerpt,
    imageAlt: datos.imageAlt,
    category: item.categoria,
    extraCategories: (datos.extraCategories ?? []).filter(c => c !== item.categoria).slice(0, 2),
    prepMinutes: datos.prepMinutes,
    cookMinutes: datos.cookMinutes,
    restMinutes: datos.restMinutes,
    difficulty: datos.difficulty,
    servings: datos.servings,
    ingredients: datos.ingredients.map(i => (i.freshPick ? { text: i.text, freshPick: true } : { text: i.text })),
    steps: datos.steps,
    tips: datos.tips,
    date: fecha,
    estado: 'publicado',
    modo: item.modo ?? 'automatico',
    imagenTipo: 'generada',
    imagenCredit: CREDITO_IMAGEN_IA
  };
  if (!receta.restMinutes) delete receta.restMinutes;
  if (!receta.extraCategories.length) delete receta.extraCategories;

  // Validate the text first so a bad recipe doesn't spend an image generation.
  const problemasTexto = validarReceta({ ...receta, image: 'pendiente' }, { tituloAprobado: item.titulo });
  if (problemasTexto.length) return { ok: false, problemas: problemasTexto };

  const imagen = await crearImagen({
    slug: item.slug,
    promptImagen: datos.imagePrompt,
    queDebeMostrar: `${item.titulo} (receta con arándanos)`
  });
  if (!imagen) return { ok: false, problemas: ['no se consiguió una imagen aprobada (queda como borrador)'] };
  receta.image = imagen.url;

  const problemas = validarReceta(receta, { tituloAprobado: item.titulo });
  if (problemas.length) return { ok: false, problemas };
  slugsReservados.add(receta.slug);

  return {
    ok: true,
    pieza: receta,
    archivos: [
      { ruta: `src/content/recetas/${receta.slug}.json`, contenido: JSON.stringify(receta, null, 2) + '\n' },
      { ruta: `public/img/generadas/${imagen.archivo.nombre}`, contenido: imagen.archivo.buffer }
    ]
  };
}
