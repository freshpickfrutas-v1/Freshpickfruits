// Elige las noticias del día y las escribe con Gemini usando SOLO el texto de su fuente.
import {
  AUTHOR, CATEGORIAS_NOTICIA, CONTEXTO_MARCA, CREDITO_FOTO_PROPIA, CREDITO_IMAGEN_IA,
  MODO_POR_CATEGORIA_NOTICIA, PATHS
} from './config.mjs';
import { generarJson } from './gemini.mjs';
import { crearImagen, descargarFotoPropia } from './imagenes.mjs';
import { textoCompleto } from './fuentes-noticias.mjs';
import { slugOcupado, slugsReservados, validarNoticia } from './validar.mjs';
import { contarPalabras, leerCarpetaJson, log, slugify } from './util.mjs';

const ESQUEMA_SELECCION = {
  type: 'object',
  properties: {
    elegidas: {
      type: 'array',
      description: 'Candidatas publicables, de la más a la menos interesante.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          categoria: { type: 'string', enum: CATEGORIAS_NOTICIA },
          motivo: { type: 'string' }
        },
        required: ['id', 'categoria', 'motivo']
      }
    }
  },
  required: ['elegidas']
};

/** Ranks candidates; drops ones that aren't really about blueberries or repeat a published topic. */
export async function elegirNoticias(candidatas, cuantas) {
  if (!candidatas.length) return [];
  const publicadas = leerCarpetaJson(PATHS.noticias).map(n => n.title);
  const lista = candidatas.slice(0, 25).map(c =>
    `- id: ${c.id}\n  medio: ${c.medio} (${c.idioma})\n  fecha: ${c.fecha || 's.f.'}\n  título: ${c.titulo}\n  resumen: ${c.resumen.slice(0, 400)}`
  ).join('\n');

  const { elegidas } = await generarJson({
    nombre: 'elegir noticias',
    temperatura: 0.2,
    schema: ESQUEMA_SELECCION,
    sistema: `Eres el editor de "Noticias de Arándanos" de Fresh Pick (Colombia). Eliges qué publicar hoy para lectores colombianos interesados en comer sano y en el mundo del arándano.`,
    prompt: `Candidatas:
${lista}

Ya publicadas (no repetir el mismo tema): ${publicadas.join('; ')}

Criterios:
- Solo noticias cuyo tema central sean los arándanos (no basta una mención de pasada).
- Prioriza: noticias de la finca Fresh Pick (id "finca:…") siempre primero; luego estudios de salud y nutrición con resultados claros; luego mercado y exportación, sobre todo Colombia y Latinoamérica; luego cultivo y variedades.
- Descarta notas publicitarias, ofertas de empleo, eventos sin contenido o temas ya publicados.
- Asigna la categoría: beneficios-arandanos (efectos en salud para el consumidor), nutricion-ciencia (estudios, compuestos, nutrientes), salud-digestiva-bienestar (digestión, microbiota, bienestar), estilo-vida-saludable (hábitos, consumo, consejos), cultivo-origen (cultivo, cosechas, mercado, exportación, industria, la finca).
Devuelve hasta ${cuantas + 2} elegidas, en orden de preferencia.`
  });
  const porId = new Map(candidatas.map(c => [c.id, c]));
  return elegidas.filter(e => porId.has(e.id)).map(e => ({ ...porId.get(e.id), categoria: e.categoria }));
}

const ESQUEMA_ARTICULO = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Título SEO en español, claro y específico (40-100 caracteres). Sin clickbait.' },
    metaDescription: { type: 'string', description: 'Meta description de 120 a 160 caracteres, con la palabra "arándanos".' },
    excerpt: { type: 'string', description: 'Entradilla de 1-2 frases (100-280 caracteres).' },
    imageAlt: { type: 'string', description: 'Texto alternativo de la imagen ilustrativa (40-180 caracteres).' },
    imagePrompt: { type: 'string', description: 'Descripción EN INGLÉS de una imagen ilustrativa realista del tema, siempre con arándanos visibles. Sin texto en la imagen.' },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['p', 'h2', 'h3', 'ul', 'ol', 'quote'] },
          text: { type: 'string', description: 'Para p, h2, h3 y quote.' },
          items: { type: 'array', items: { type: 'string' }, description: 'Para ul y ol.' }
        },
        required: ['type']
      }
    },
    relatedRecipes: { type: 'array', items: { type: 'string' }, description: 'Hasta 3 slugs de recetas de la lista dada que encajen con el tema.' }
  },
  required: ['title', 'metaDescription', 'excerpt', 'imageAlt', 'imagePrompt', 'blocks', 'relatedRecipes']
};

function instruccionesDeFormato(c) {
  if (c.origen === 'finca') {
    return `Es una noticia de la propia finca Fresh Pick escrita por el equipo. Redáctala como nota breve (350-600 palabras) en primera persona del plural ("en Fresh Pick…"), con 2-3 subtítulos. No agregues ningún hecho, cifra, fecha o nombre que no esté en el texto del equipo.`;
  }
  if (c.idioma === 'en') {
    return `La fuente está en INGLÉS. Escribe un ENSAYO PROPIO EN ESPAÑOL de 650 a 900 palabras (no una traducción), con esta estructura y un subtítulo (h2) por parte:
1. Introducción: de qué trata y por qué importa.
2. Qué dice la fuente: el hallazgo o hecho principal, en palabras sencillas (tamaño del estudio, quiénes participaron y limitaciones si es un estudio).
3. Contexto: cómo encaja con lo que ya se sabe sobre los arándanos.
4. Qué significa para ti: aplicación práctica, sin exagerar.
5. Conclusión.`;
  }
  return `Escribe un artículo PROPIO en español de 400 a 750 palabras (no copies frases de la fuente), con 3-4 subtítulos (h2): la noticia, los datos clave, el contexto (qué significa para Colombia y Latinoamérica cuando aplique) y una conclusión.`;
}

/** Writes, illustrates and validates one news article. Returns { ok, pieza, archivos, problemas, candidata }. */
export async function crearNoticia(c, { fecha, recetas }) {
  log(`📰 Noticia: ${c.titulo} (${c.medio})`);
  const fuenteTexto = await textoCompleto(c);
  if (contarPalabras(fuenteTexto) < 60) return { ok: false, candidata: c, problemas: ['la fuente no tiene texto suficiente para escribir sin inventar'] };

  const modo = c.origen === 'finca' ? 'revision' : MODO_POR_CATEGORIA_NOTICIA[c.categoria];
  const listaRecetas = recetas.map(r => `${r.slug} (${r.title})`).join('; ');

  const datos = await generarJson({
    nombre: `noticia ${c.id}`,
    schema: ESQUEMA_ARTICULO,
    temperatura: 0.5,
    sistema: `Eres periodista de "Noticias de Arándanos" de Fresh Pick, en español de Colombia, con tono claro, cercano y riguroso.
Contexto de la marca: ${CONTEXTO_MARCA}
Úsalo solo en la conclusión, como máximo 1 o 2 frases y solo si encaja de forma natural con la noticia. No repitas todos los datos de la marca y NO incluyas teléfono, WhatsApp, horarios de entrega ni llamados a comprar: el botón de compra ya aparece debajo del artículo.
Reglas de oro:
- Usa ÚNICAMENTE información presente en el TEXTO DE LA FUENTE. Si un dato no está en la fuente, no lo afirmes. No inventes cifras, nombres, fechas ni citas.
- Nada de afirmaciones médicas absolutas: no digas que los arándanos curan, previenen o tratan enfermedades. Usa "se asoció con", "los investigadores observaron", "sugiere".
- Si es un estudio en animales o in vitro, dilo claramente.
- No incluyas enlaces ni la lista de fuentes en el texto: se agregan aparte.`,
    prompt: `${instruccionesDeFormato(c)}

Categoría: ${c.categoria}
Medio: ${c.medio}
Título original: ${c.titulo}
Recetas disponibles para relacionar: ${listaRecetas}

TEXTO DE LA FUENTE:
"""
${fuenteTexto}
"""`
  });

  let slugBase = slugify(datos.title);
  for (let n = 2; slugOcupado(slugBase); n++) slugBase = `${slugify(datos.title, 76)}-${n}`;
  const bloques = (datos.blocks ?? [])
    .map(b => (b.type === 'ul' || b.type === 'ol') ? { type: b.type, items: (b.items ?? []).filter(Boolean) } : { type: b.type, text: (b.text ?? '').trim() })
    .filter(b => (b.items ? b.items.length : b.text));

  const noticia = {
    slug: slugBase,
    title: datos.title,
    metaDescription: datos.metaDescription,
    excerpt: datos.excerpt,
    category: c.categoria,
    date: fecha,
    readMinutes: Math.max(2, Math.round(contarPalabras(bloques.map(b => b.text ?? b.items.join(' ')).join(' ')) / 200)),
    author: AUTHOR,
    imageAlt: datos.imageAlt,
    blocks: bloques,
    fuentes: c.origen === 'finca' ? [] : [{
      titulo: c.titulo,
      url: c.url,
      medio: c.medio,
      ...(/^\d{4}-\d{2}-\d{2}$/.test(c.fecha) ? { fecha: c.fecha } : {}),
      idioma: c.idioma
    }],
    relatedRecipes: (datos.relatedRecipes ?? []).filter(s => recetas.some(r => r.slug === s)).slice(0, 3),
    estado: 'publicado',
    modo
  };
  if (!noticia.relatedRecipes.length) delete noticia.relatedRecipes;

  // Farm news: the team is the source; the issue link isn't a public source for readers.
  const comprobarFuentes = c.origen !== 'finca';
  const previa = await validarNoticia({ ...noticia, image: 'pendiente', fuentes: comprobarFuentes ? noticia.fuentes : [{ url: '' }] }, { idiomaFuente: c.idioma, comprobarEnlaces: comprobarFuentes });
  if (previa.length) return { ok: false, candidata: c, problemas: previa };

  let imagen = null;
  if (c.origen === 'finca' && c.foto) {
    imagen = await descargarFotoPropia({ slug: noticia.slug, url: c.foto });
    if (imagen) Object.assign(noticia, { imagenTipo: 'propia', imagenCredit: CREDITO_FOTO_PROPIA });
  }
  if (!imagen) {
    const generada = await crearImagen({ slug: noticia.slug, promptImagen: datos.imagePrompt, queDebeMostrar: noticia.title });
    if (generada.fallo) return { ok: false, candidata: c, problemas: [`no se consiguió una imagen aprobada: ${generada.fallo}`] };
    imagen = generada;
    Object.assign(noticia, { imagenTipo: 'generada', imagenCredit: CREDITO_IMAGEN_IA });
  }
  noticia.image = imagen.url;
  if (c.origen === 'finca') delete noticia.fuentes;
  slugsReservados.add(noticia.slug);

  return {
    ok: true,
    candidata: c,
    pieza: noticia,
    archivos: [
      { ruta: `src/content/noticias/${noticia.slug}.json`, contenido: JSON.stringify(noticia, null, 2) + '\n' },
      { ruta: `public/img/generadas/${imagen.archivo.nombre}`, contenido: imagen.archivo.buffer }
    ]
  };
}
