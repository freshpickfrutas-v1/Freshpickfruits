// Conexión con Gemini (plan gratuito). Usa la librería @google/genai que ya tiene el proyecto.
import { GoogleGenAI } from '@google/genai';
import { MODELOS_BUSQUEDA, MODELOS_TEXTO } from './config.mjs';
import { conReintentos, log, resolverRedireccion } from './util.mjs';

let cliente;
function ai() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error('Falta GEMINI_API_KEY (secret del repositorio).');
    err.noReintentar = true;
    throw err;
  }
  cliente ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return cliente;
}

/** Models that answered "not found" are skipped for the rest of the run. */
const modelosNoDisponibles = new Set();

/** Bad, revoked or blocked keys: retrying or trying other pieces is pointless, so the whole run stops. */
function marcarSiEsFatal(err) {
  const msg = String(err?.message ?? err);
  if (/\b(401|403)\b|PERMISSION_DENIED|API key not valid|API_KEY_INVALID|denied access|UNAUTHENTICATED/i.test(msg)) {
    err.fatal = true;
    err.noReintentar = true;
    err.message = `Gemini rechazó la clave (secret ARANDANOS_ARTICULOS o GEMINI_API_KEY2): ${msg}`;
  }
  return err;
}

function esModeloInexistente(err) {
  const msg = String(err?.message ?? err);
  return /\b404\b|not found|is not supported|NOT_FOUND/i.test(msg);
}

/** Tries each model in order; each model gets the standard 3 retries. */
async function conModelos(modelos, nombre, llamada) {
  let ultimoError;
  for (const modelo of modelos) {
    if (modelosNoDisponibles.has(modelo)) continue;
    try {
      return await conReintentos(`${nombre} (${modelo})`, async () => {
        try {
          return await llamada(modelo);
        } catch (err) {
          if (marcarSiEsFatal(err).fatal) throw err;
          if (esModeloInexistente(err)) {
            modelosNoDisponibles.add(modelo);
            err.noReintentar = true;
          }
          throw err;
        }
      });
    } catch (err) {
      ultimoError = err;
      if (err.fatal || !modelosNoDisponibles.has(modelo)) break; // real failure, not a missing model
      log(`   Modelo ${modelo} no disponible; probando el siguiente.`);
    }
  }
  throw ultimoError ?? new Error(`Ningún modelo disponible para ${nombre}`);
}

/** Generates JSON that follows `schema` (JSON Schema). Returns the parsed object. */
export async function generarJson({ nombre, sistema, prompt, schema, temperatura = 0.7 }) {
  return conModelos(MODELOS_TEXTO, nombre, async modelo => {
    const res = await ai().models.generateContent({
      model: modelo,
      contents: prompt,
      config: {
        systemInstruction: sistema,
        temperature: temperatura,
        responseMimeType: 'application/json',
        responseJsonSchema: schema
      }
    });
    const texto = res.text;
    if (!texto) throw new Error('Respuesta vacía de Gemini');
    try {
      return JSON.parse(texto);
    } catch {
      throw new Error('Gemini no devolvió JSON válido');
    }
  });
}

/** Asks Gemini to look at an image and answer with JSON (used to check generated images). */
export async function revisarImagenConGemini({ imagen, mimeType, pregunta, schema }) {
  return conModelos(MODELOS_TEXTO, 'revisar imagen', async modelo => {
    const res = await ai().models.generateContent({
      model: modelo,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: imagen.toString('base64'), mimeType } },
            { text: pregunta }
          ]
        }
      ],
      config: { temperature: 0, responseMimeType: 'application/json', responseJsonSchema: schema }
    });
    return JSON.parse(res.text ?? '{}');
  });
}

/**
 * Backup news discovery: Gemini with Google Search (free only on the 2.5 Flash family).
 * Returns the model's text plus the real source URLs (Google's redirect links are resolved).
 */
export async function buscarConGoogle({ prompt }) {
  return conModelos(MODELOS_BUSQUEDA, 'búsqueda con Google', async modelo => {
    const res = await ai().models.generateContent({
      model: modelo,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], temperature: 0.2 }
    });
    const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const fuentes = [];
    for (const c of chunks) {
      if (!c.web?.uri) continue;
      fuentes.push({ titulo: c.web.title ?? '', url: await resolverRedireccion(c.web.uri) });
    }
    return { texto: res.text ?? '', fuentes };
  });
}
