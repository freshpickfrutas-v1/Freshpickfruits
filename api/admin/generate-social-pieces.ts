// POST /api/admin/generate-social-pieces
// Genera copys listos para Instagram, Facebook y X a partir de un contenido (receta, noticia o video).
// Solo administradores. Usa GEMINI_API_KEY (la misma que la automatización de contenido).
import { GoogleGenAI } from '@google/genai';
import { adminDb } from '../_lib/admin.js';
import { ajustarX, quitarEnlaces } from '../_lib/social.js';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

/** Misma lógica que api/_lib/youtube, sin importar ese módulo (evita arrastrar scripts al bundle). */
function geminiKey(): string | undefined {
  const k = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2;
  return k?.trim() || undefined;
}

const BOOTSTRAP_ADMINS = ['info@freshpickfruits.com', 'freshpickfrutas@gmail.com'];

const SYSTEM_PROMPT = `Eres el copywriter senior de Fresh Pick Fruits (marca: Fresh Pick / FreshPick Fruits).
Marca: arándanos premium de alta montaña (Vereda Santa Bárbara, Guasca, Cundinamarca, Colombia, >2.800 m.s.n.m.).
Tono: cercano, optimista, natural, ligeramente juguetón, sensorial (frescura, sabor, color, energía). Nunca corporativo ni frío.
Máximo 2-3 emojis por pieza y solo si aportan. Incluye siempre #FreshPickFruits cuando haya hashtags.

Debes devolver ÚNICAMENTE un JSON válido con esta forma exacta:
{
  "instagram": { "copy": "...", "hashtags": ["#tag1", "#tag2"] },
  "facebook":  { "copy": "..." },
  "x":         { "copy": "..." }
}

Reglas por red:
- Instagram: gancho fuerte en las 1-2 primeras líneas → valor/beneficio → CTA (guarda, comparte, enlace en perfil). 8-12 hashtags relevantes. Longitud ideal 1200-1800 caracteres con saltos de línea.
- Facebook: tono conversacional y cercano, contexto breve, invitación a comentar/compartir, enlace natural al final. 300-700 caracteres.
- X: mensaje directo y breve, MÁXIMO 150 caracteres en total (cuenta hashtags y emoji). Gancho + beneficio + 2-3 hashtags. NO incluyas ningún enlace: el enlace a la tienda se añade aparte.

Adaptaciones por tipo:
- receta: facilidad, tiempo, sabor, beneficio saludable, "ideal para…".
- noticia: relevancia, "qué significa para ti", actualidad.
- video: lo visual, la emoción, "mira cómo…", "descubre en el video…".

Responde SOLO el JSON. Sin texto antes ni después.`;

async function esAdmin(req: any): Promise<boolean> {
  const header = String(req.headers?.authorization ?? '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return false;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${(firebaseConfig as { apiKey: string }).apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    }
  );
  if (!res.ok) return false;
  const user = (await res.json()).users?.[0];
  if (!user?.localId) return false;
  if (user.emailVerified && BOOTSTRAP_ADMINS.includes(user.email ?? '')) return true;

  const snap = await adminDb().collection('users').doc(user.localId).get();
  return snap.exists && snap.data()?.role === 'admin';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    if (!(await esAdmin(req))) {
      return res.status(403).json({ error: 'Solo administradores' });
    }
  } catch (err) {
    console.error('generate-social-pieces auth', err);
    return res.status(401).json({ error: 'Sesión no válida' });
  }

  const apiKey = geminiKey();
  if (!apiKey) {
    return res.status(500).json({
      error:
        'Falta GEMINI_API_KEY (o GEMINI_API_KEY2) en Vercel → Settings → Environment Variables (Production). Añádela y redespliega.',
    });
  }

  const { tipo, title, excerpt, body, url, slug } = req.body ?? {};
  if (!tipo || !['receta', 'noticia', 'video'].includes(tipo) || !title) {
    return res.status(400).json({ error: 'Faltan tipo o title' });
  }

  const basePath =
    tipo === 'receta' ? 'recetas' : tipo === 'noticia' ? 'noticias' : 'videos';
  const userPrompt = `
Tipo de contenido: ${tipo}
Título: ${title}
Extracto / meta: ${excerpt || 'N/A'}
Cuerpo / descripción (resumen): ${(body || '').slice(0, 2800) || 'N/A'}
URL canónica: ${url || `https://www.freshpickfruits.com/${basePath}/${slug || ''}`}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Google retira modelos con el tiempo (gemini-2.0-flash ya da 404): se prueban varios en orden.
    const modelos = [
      process.env.GEMINI_MODELO_TEXTO,
      process.env.GEMINI_MODELO_MODERACION,
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
    ].filter((m, i, a): m is string => !!m && a.indexOf(m) === i);
    let result: Awaited<ReturnType<typeof ai.models.generateContent>> | undefined;
    let ultimoError: unknown;
    for (const model of modelos) {
      try {
        result = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.75,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          properties: {
            instagram: {
              type: 'object',
              properties: {
                copy: { type: 'string' },
                hashtags: { type: 'array', items: { type: 'string' } },
              },
              required: ['copy', 'hashtags'],
            },
            facebook: {
              type: 'object',
              properties: { copy: { type: 'string' } },
              required: ['copy'],
            },
            x: {
              type: 'object',
              properties: { copy: { type: 'string' } },
              required: ['copy'],
            },
          },
          required: ['instagram', 'facebook', 'x'],
        },
      },
        });
        break;
      } catch (e) {
        ultimoError = e; // modelo retirado, saturado o sin cuota: se prueba el siguiente
        console.error('generate-social-pieces modelo', model, (e as Error)?.message?.slice(0, 160));
      }
    }
    if (!result) throw ultimoError ?? new Error('Ningún modelo respondió');

    const texto = result.text;
    if (!texto) throw new Error('Respuesta vacía de Gemini');

    const pieces = JSON.parse(texto);

    if (!pieces?.instagram?.copy || !pieces?.facebook?.copy || !pieces?.x?.copy) {
      throw new Error('JSON incompleto de la IA');
    }

    pieces.x.copy = ajustarX(quitarEnlaces(String(pieces.x.copy)));

    return res.status(200).json({ success: true, pieces });
  } catch (err: any) {
    console.error('generate-social-pieces', err);
    return res.status(500).json({
      error: 'Error al generar las piezas',
      message: err?.message?.slice(0, 200),
    });
  }
}
