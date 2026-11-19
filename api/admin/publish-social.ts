// POST /api/admin/publish-social { facebook?: { message, link }, instagram?: { caption, imageUrl } }
// Publica en la Página de Facebook y/o en Instagram Business vía Meta Graph API. Solo administradores.
// Variables en Vercel (Production): META_PAGE_ID, META_PAGE_TOKEN (token de la Página, de larga duración), META_IG_USER_ID.
import { adminDb } from '../_lib/admin.js';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const BOOTSTRAP_ADMINS = ['info@freshpickfruits.com', 'freshpickfrutas@gmail.com'];
const GRAPH = 'https://graph.facebook.com/v21.0';

async function esAdmin(req: any): Promise<boolean> {
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

const limpio = (v?: string) => (v ?? '').replace(/\s+/g, '').replace(/^["']+|["']+$/g, '');

async function graph(ruta: string, params: Record<string, string>) {
  const res = await fetch(`${GRAPH}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...params, access_token: limpio(process.env.META_PAGE_TOKEN) }),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Meta ${res.status}`);
  return data;
}

async function graphGet(ruta: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ ...params, access_token: limpio(process.env.META_PAGE_TOKEN) });
  const res = await fetch(`${GRAPH}${ruta}?${qs}`);
  return (await res.json().catch(() => ({}))) as any;
}

async function publicarFacebook(message: string, link?: string) {
  const r = await graph(`/${limpio(process.env.META_PAGE_ID)}/feed`, { message, ...(link ? { link } : {}) });
  return { id: String(r.id) };
}

async function publicarInstagram(caption: string, imageUrl: string) {
  const ig = limpio(process.env.META_IG_USER_ID);
  const contenedor = await graph(`/${ig}/media`, { image_url: imageUrl, caption });
  // Meta procesa la imagen: se espera a FINISHED antes de publicar (máx. ~20 s).
  for (let i = 0; i < 10; i++) {
    const st = await graphGet(`/${contenedor.id}`, { fields: 'status_code' });
    if (st.status_code === 'FINISHED') break;
    if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') throw new Error('Instagram no pudo procesar la imagen (debe ser JPEG pública)');
    await new Promise(r => setTimeout(r, 2000));
  }
  const r = await graph(`/${ig}/media_publish`, { creation_id: contenedor.id });
  return { id: String(r.id) };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    if (!(await esAdmin(req))) return res.status(403).json({ error: 'Solo administradores' });
  } catch (err) {
    console.error('publish-social auth', err);
    return res.status(401).json({ error: 'Sesión no válida' });
  }

  const fb = req.body?.facebook;
  const ig = req.body?.instagram;
  if (!fb && !ig) return res.status(400).json({ error: 'Nada que publicar' });

  const faltan: string[] = [];
  if (!process.env.META_PAGE_TOKEN) faltan.push('META_PAGE_TOKEN');
  if (fb && !process.env.META_PAGE_ID) faltan.push('META_PAGE_ID');
  if (ig && !process.env.META_IG_USER_ID) faltan.push('META_IG_USER_ID');
  if (faltan.length) return res.status(500).json({ error: `Faltan variables en Vercel: ${faltan.join(', ')}` });

  const resultados: Record<string, { ok: boolean; id?: string; error?: string }> = {};

  if (fb) {
    const message = String(fb.message ?? '').trim().slice(0, 5000);
    if (!message) resultados.facebook = { ok: false, error: 'Texto vacío' };
    else {
      try { resultados.facebook = { ok: true, ...(await publicarFacebook(message, typeof fb.link === 'string' ? fb.link : undefined)) }; }
      catch (e: any) { console.error('publish-social fb', e); resultados.facebook = { ok: false, error: String(e?.message ?? e).slice(0, 300) }; }
    }
  }
  if (ig) {
    const caption = String(ig.caption ?? '').trim().slice(0, 2200);
    const imageUrl = String(ig.imageUrl ?? '');
    if (!caption || !/^https:\/\//.test(imageUrl)) resultados.instagram = { ok: false, error: 'Instagram necesita texto e imagen pública (https)' };
    else {
      try { resultados.instagram = { ok: true, ...(await publicarInstagram(caption, imageUrl)) }; }
      catch (e: any) { console.error('publish-social ig', e); resultados.instagram = { ok: false, error: String(e?.message ?? e).slice(0, 300) }; }
    }
  }

  return res.status(200).json({ resultados });
}
