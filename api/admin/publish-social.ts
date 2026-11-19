// POST /api/admin/publish-social { facebook?: { message, link }, instagram?: { caption, imageUrl } }
// Publicación directa desde el modal "Piezas IA" (contenido puntual, p. ej. un video). Solo administradores.
// Variables en Vercel (Production): META_PAGE_ID, META_PAGE_TOKEN (token de la Página, de larga duración), META_IG_USER_ID.
import { esAdmin, faltanVariablesMeta, intentar, publicarFacebook, publicarInstagram, type Resultado } from '../_lib/social.js';

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

  const faltan = faltanVariablesMeta(!!fb, !!ig);
  if (faltan.length) return res.status(500).json({ error: `Faltan variables en Vercel: ${faltan.join(', ')}` });

  const resultados: Record<string, Resultado> = {};
  if (fb) {
    const message = String(fb.message ?? '').trim().slice(0, 5000);
    resultados.facebook = message
      ? await intentar(() => publicarFacebook(message, typeof fb.link === 'string' ? fb.link : undefined))
      : { ok: false, error: 'Texto vacío' };
  }
  if (ig) {
    const caption = String(ig.caption ?? '').trim().slice(0, 2200);
    const imageUrl = String(ig.imageUrl ?? '');
    resultados.instagram = caption && /^https:\/\//.test(imageUrl)
      ? await intentar(() => publicarInstagram(caption, imageUrl))
      : { ok: false, error: 'Instagram necesita texto e imagen pública (https)' };
  }
  return res.status(200).json({ resultados });
}
