// Lógica compartida de redes sociales: borradores con IA (Gemini) y publicación en Facebook e Instagram (Meta Graph API).
// La cola de revisión vive en Firestore: colección social_queue (solo se toca desde el servidor).
import { GoogleGenAI } from '@google/genai';
import { adminDb } from './admin.js';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

export const SITIO = 'https://www.freshpickfruits.com';
const BOOTSTRAP_ADMINS = ['info@freshpickfruits.com', 'freshpickfrutas@gmail.com'];
const GRAPH = 'https://graph.facebook.com/v21.0';

export type Piezas = {
  instagram: { copy: string; hashtags: string[] };
  facebook: { copy: string };
  x: { copy: string };
};
export type Resultado = { ok: boolean; id?: string; error?: string };

// ---------- Autenticación ----------

export async function esAdmin(req: any): Promise<boolean> {
  const header = String(req.headers?.authorization ?? '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return false;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${(firebaseConfig as { apiKey: string }).apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
  });
  if (!res.ok) return false;
  const user = (await res.json()).users?.[0];
  if (!user?.localId) return false;
  if (user.emailVerified && BOOTSTRAP_ADMINS.includes(user.email ?? '')) return true;
  const snap = await adminDb().collection('users').doc(user.localId).get();
  return snap.exists && snap.data()?.role === 'admin';
}

// ---------- IA ----------

const SYSTEM_PROMPT = `Eres el copywriter senior de Fresh Pick Fruits.
Marca: arándanos premium de alta montaña (Vereda Santa Bárbara, Guasca, Cundinamarca, Colombia, más de 2.800 m.s.n.m.).
Tono: cercano, optimista, natural, ligeramente juguetón y sensorial. Nunca corporativo ni frío. Español de Colombia.
Máximo 2-3 emojis por pieza y solo si aportan. No inventes datos, cifras ni beneficios médicos que el contenido no diga. Incluye siempre #FreshPickFruits en los hashtags.

Devuelve ÚNICAMENTE un JSON: { "instagram": { "copy": "...", "hashtags": ["#tag"] }, "facebook": { "copy": "..." }, "x": { "copy": "..." } }

- Instagram: gancho fuerte en las 1-2 primeras líneas, luego valor o beneficio y cierre con llamado a guardar, compartir o ir al enlace del perfil. Sin URL en el copy. 8-12 hashtags en "hashtags". Copy de 800-1500 caracteres con saltos de línea.
- Facebook: conversacional y cercano, contexto breve, invitación a comentar o compartir. No incluyas el enlace (se añade aparte). 300-700 caracteres.
- X: directo y ágil, MÁXIMO 150 caracteres en total (cuenta hashtags y emoji), con 2-3 hashtags dentro del copy y como mucho 1 emoji. No incluyas el enlace.
- receta: facilidad, tiempo, sabor, beneficio saludable. noticia: relevancia y "qué significa para ti". video: lo visual y la emoción.`;

const SCHEMA = {
  type: 'object',
  properties: {
    instagram: { type: 'object', properties: { copy: { type: 'string' }, hashtags: { type: 'array', items: { type: 'string' } } }, required: ['copy', 'hashtags'] },
    facebook: { type: 'object', properties: { copy: { type: 'string' } }, required: ['copy'] },
    x: { type: 'object', properties: { copy: { type: 'string' } }, required: ['copy'] },
  },
  required: ['instagram', 'facebook', 'x'],
};

function geminiKey() {
  return (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2)?.trim() || undefined;
}

export function validarPiezas(p: any): Piezas {
  const ok = p && typeof p.instagram?.copy === 'string' && Array.isArray(p.instagram?.hashtags) && typeof p.facebook?.copy === 'string' && typeof p.x?.copy === 'string'
    && p.instagram.copy.trim() && p.facebook.copy.trim() && p.x.copy.trim();
  if (!ok) throw new Error('Piezas incompletas');
  return {
    instagram: { copy: p.instagram.copy.trim(), hashtags: p.instagram.hashtags.filter((h: unknown) => typeof h === 'string').map((h: string) => (h.startsWith('#') ? h : `#${h}`)) },
    facebook: { copy: p.facebook.copy.trim() },
    x: { copy: p.x.copy.trim() },
  };
}

/** Peso de un texto en X (plan gratis: 280). Latinos pesan 1; emojis, CJK y otros pesan 2; un enlace pesa 23. */
const RANGOS_PESO_1: [number, number][] = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]];
export function pesoX(texto: string): number {
  let total = 0;
  for (const c of texto) {
    const cp = c.codePointAt(0)!;
    total += RANGOS_PESO_1.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2;
  }
  return total;
}
/** Máximo del texto de X: 280 menos el enlace más largo posible sin acortar (117) y el espacio. Así cabe aunque la herramienta no acorte el enlace. */
export const MAX_TEXTO_X = 160;

/** Quita cualquier enlace que la IA haya puesto en el texto de X: el enlace a la tienda se añade siempre aparte. */
export function quitarEnlaces(texto: string): string {
  return texto.replace(/https?:\/\/\S+/g, '').replace(/[ \t]+/g, ' ').replace(/\s+\n/g, '\n').trim();
}

/** Garantiza que el texto de X quepa: quita hashtags del final y, si hace falta, corta en una palabra completa. */
export function ajustarX(copy: string): string {
  let t = copy.replace(/\s+/g, ' ').trim();
  while (pesoX(t) > MAX_TEXTO_X && /\s#\S+$/.test(t)) t = t.replace(/\s#\S+$/, '');
  if (pesoX(t) > MAX_TEXTO_X) {
    const palabras = t.split(' ');
    while (palabras.length > 1 && pesoX(palabras.join(' ') + '…') > MAX_TEXTO_X) palabras.pop();
    t = palabras.join(' ').replace(/[\s,;:]+$/, '') + '…';
  }
  return t;
}

export async function generarPiezas(input: { tipo: string; title: string; excerpt?: string; url: string }): Promise<Piezas> {
  const key = geminiKey();
  if (!key) throw new Error('Falta GEMINI_API_KEY en Vercel');
  const ai = new GoogleGenAI({ apiKey: key });
  const modelos = [process.env.GEMINI_MODELO_TEXTO, process.env.GEMINI_MODELO_MODERACION, 'gemini-3.5-flash', 'gemini-3.5-flash-lite']
    .filter((m, i, a): m is string => !!m && a.indexOf(m) === i);
  const contents = `Tipo de contenido: ${input.tipo}\nTítulo: ${input.title}\nExtracto: ${(input.excerpt ?? '').slice(0, 800) || 'N/A'}\nEnlace: ${input.url}`;
  let ultimo: unknown;
  for (const model of modelos) {
    try {
      const r = await ai.models.generateContent({
        model, contents,
        config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.8, responseMimeType: 'application/json', responseJsonSchema: SCHEMA },
      });
      if (!r.text) throw new Error('Respuesta vacía');
      const piezas = validarPiezas(JSON.parse(r.text));
      piezas.x.copy = ajustarX(quitarEnlaces(piezas.x.copy));
      return piezas;
    } catch (e) {
      ultimo = e; // modelo retirado, saturado o JSON inválido: se prueba el siguiente
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error('No se pudo generar');
}

// ---------- Meta (Facebook e Instagram) ----------

const limpio = (v?: string) => (v ?? '').replace(/\s+/g, '').replace(/^["']+|["']+$/g, '');

export function faltanVariablesMeta(fb: boolean, ig: boolean): string[] {
  const f: string[] = [];
  if (!process.env.META_PAGE_TOKEN) f.push('META_PAGE_TOKEN');
  if (fb && !process.env.META_PAGE_ID) f.push('META_PAGE_ID');
  if (ig && !process.env.META_IG_USER_ID) f.push('META_IG_USER_ID');
  return f;
}

async function graph(ruta: string, params: Record<string, string>, token = limpio(process.env.META_PAGE_TOKEN)) {
  const res = await fetch(`${GRAPH}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...params, access_token: token }),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Meta ${res.status}`);
  return data;
}

/** Con un token de usuario del sistema, Facebook exige publicar con el token de la propia Página: se le pide a Meta con ese mismo token. */
async function tokenDePagina(): Promise<string> {
  const base = limpio(process.env.META_PAGE_TOKEN);
  const qs = new URLSearchParams({ fields: 'access_token', access_token: base });
  const r: any = await fetch(`${GRAPH}/${limpio(process.env.META_PAGE_ID)}?${qs}`).then(x => x.json()).catch(() => ({}));
  return typeof r.access_token === 'string' && r.access_token ? r.access_token : base;
}

export async function publicarFacebook(message: string, link?: string): Promise<{ id: string }> {
  const r = await graph(`/${limpio(process.env.META_PAGE_ID)}/feed`, { message, ...(link ? { link } : {}) }, await tokenDePagina());
  return { id: String(r.id) };
}

export async function publicarInstagram(caption: string, imageUrl: string): Promise<{ id: string }> {
  const ig = limpio(process.env.META_IG_USER_ID);
  const contenedor = await graph(`/${ig}/media`, { image_url: imageUrl, caption });
  // Meta procesa la imagen: se espera a FINISHED antes de publicar (máx. ~20 s).
  for (let i = 0; i < 10; i++) {
    const qs = new URLSearchParams({ fields: 'status_code', access_token: limpio(process.env.META_PAGE_TOKEN) });
    const st: any = await fetch(`${GRAPH}/${contenedor.id}?${qs}`).then(r => r.json()).catch(() => ({}));
    if (st.status_code === 'FINISHED') break;
    if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') throw new Error('Instagram no pudo procesar la imagen (debe ser JPEG pública)');
    await new Promise(r => setTimeout(r, 2000));
  }
  const r = await graph(`/${ig}/media_publish`, { creation_id: contenedor.id });
  return { id: String(r.id) };
}

export async function intentar(fn: () => Promise<{ id: string }>): Promise<Resultado> {
  try { return { ok: true, ...(await fn()) }; }
  catch (e: any) { console.error('social publicar', e); return { ok: false, error: String(e?.message ?? e).slice(0, 300) }; }
}

// ---------- Cola de revisión (Firestore: social_queue) ----------

export const imagenPublica = (img?: string) => (!img ? '' : img.startsWith('http') ? img : `${SITIO}${img.startsWith('/') ? '' : '/'}${img}`);

async function leerIndice(nombre: string): Promise<any[]> {
  try {
    const r = await fetch(`${SITIO}/data/${nombre}.json`);
    return r.ok ? await r.json() : [];
  } catch { return []; }
}

/** Una receta o noticia publicada en el sitio. */
type Candidato = { tipo: string; carpeta: string; slug: string; title: string; excerpt?: string; image?: string; date?: string };

/** Todas las recetas y noticias publicadas en el sitio, las más nuevas primero. */
async function candidatosDelSitio(): Promise<Candidato[]> {
  const [noticias, recetas] = await Promise.all([leerIndice('noticias-index'), leerIndice('recetas-index')]);
  return [
    ...noticias.map(a => ({ tipo: 'noticia', carpeta: 'noticias', ...a })),
    ...recetas.map(r => ({ tipo: 'receta', carpeta: 'recetas', ...r })),
  ]
    .filter((c: Candidato) => c.slug && c.title)
    .sort((a: Candidato, b: Candidato) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
}

/** Ids de lo que ya tiene borrador en la cola (pendiente, publicado o rechazado): no se vuelve a preparar. */
async function idsEnCola(): Promise<Set<string>> {
  const snap = await adminDb().collection('social_queue').select().get();
  return new Set(snap.docs.map(d => d.id));
}

/** Cuántas recetas y noticias del sitio todavía no tienen borrador de redes. */
export async function contarPorPreparar(): Promise<number> {
  const [candidatos, ids] = await Promise.all([candidatosDelSitio(), idsEnCola()]);
  return candidatos.filter(c => !ids.has(`${c.tipo}_${c.slug}`)).length;
}

/** Crea borradores (estado "pendiente") para recetas y noticias del sitio que aún no tienen uno, las más nuevas primero. No publica nada. */
export async function crearBorradores(max: number) {
  const db = adminDb();
  const [candidatos, ids] = await Promise.all([candidatosDelSitio(), idsEnCola()]);
  const pendientes = candidatos.filter(c => !ids.has(`${c.tipo}_${c.slug}`));

  const creados: string[] = [];
  const errores: string[] = [];
  for (const c of pendientes) {
    if (creados.length >= max) break;
    const id = `${c.tipo}_${c.slug}`;
    const ref = db.collection('social_queue').doc(id);
    const url = `${SITIO}/${c.carpeta}/${c.slug}`;
    try {
      const pieces = await generarPiezas({ tipo: c.tipo, title: c.title, excerpt: c.excerpt, url });
      await ref.set({
        tipo: c.tipo, slug: c.slug, title: c.title, url, imageUrl: imagenPublica(c.image),
        pieces, status: 'pendiente', resultados: {}, createdAt: new Date().toISOString(),
      });
      creados.push(id);
    } catch (e: any) {
      console.error('crearBorradores', id, e);
      errores.push(`${id}: ${String(e?.message ?? e).slice(0, 120)}`);
    }
  }
  return { creados, errores, quedan: Math.max(pendientes.length - creados.length, 0) };
}
