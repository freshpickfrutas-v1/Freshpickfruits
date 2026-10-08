// Queries por categoría, filtro anti-competencia y moderación con Gemini para los videos de YouTube.
// Todo corre en el servidor: las claves (YOUTUBE_API_KEY, GEMINI_API_KEY) nunca llegan al navegador.
import { GoogleGenAI, Type } from '@google/genai';

export type Seccion = 'recetas' | 'noticias';

export interface VideoAprobado {
  id: string;
  title: string;
  channel: string;
}

import {
  CANALES_DE_CONFIANZA as CANALES,
  QUERIES as QUERIES_COMPARTIDAS,
  SENALES_COMERCIALES,
  SYSTEM_PROMPT
} from '../../scripts/contenido/youtubeReglas.mjs';

export const CANALES_DE_CONFIANZA: string[] = CANALES;
const QUERIES = QUERIES_COMPARTIDAS as Record<Seccion, Record<string, string[]>>;

export function queriesPara(seccion: Seccion, categoria: string): string[] {
  const grupo = QUERIES[seccion];
  return grupo[categoria] ?? grupo._default;
}

export function pareceComercial(v: { title: string; description: string; channel: string }): boolean {
  return SENALES_COMERCIALES.test(`${v.channel} ${v.title} ${v.description.slice(0, 600)}`);
}

export interface Moderacion {
  status: 'approved' | 'rejected';
  reason: string;
}

let cliente: GoogleGenAI | undefined;

/** Fail-closed: si Gemini falla o responde algo inválido, el video NO se aprueba. */
export async function moderar(v: { title: string; description: string; channel: string }): Promise<Moderacion> {
  try {
    cliente ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const res = await cliente.models.generateContent({
      model: process.env.GEMINI_MODELO_MODERACION ?? 'gemini-3.5-flash-lite',
      contents: `<video>\ncanal: ${v.channel}\ntítulo: ${v.title}\ndescripción: ${v.description.slice(0, 1500)}\n</video>`,
      config: {
        systemInstruction: JSON.stringify(SYSTEM_PROMPT),
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['approved', 'rejected'] },
            reason: { type: Type.STRING },
            rule: { type: Type.STRING }
          },
          required: ['status', 'reason', 'rule']
        }
      }
    });
    const out = JSON.parse(res.text ?? '{}');
    if (out.status === 'approved') return { status: 'approved', reason: '' };
    return { status: 'rejected', reason: String(out.reason || 'Respuesta inválida') };
  } catch {
    return { status: 'rejected', reason: 'Fallo de moderación (fail-closed)' };
  }
}
