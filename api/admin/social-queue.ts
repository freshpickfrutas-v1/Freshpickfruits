// GET  /api/admin/social-queue                         → borradores de redes (pendientes y recientes)
// POST /api/admin/social-queue { accion: "generar" }   → crea borradores con IA del contenido reciente
// POST /api/admin/social-queue { accion: "publicar", id, pieces? } → aprueba: publica en Facebook e Instagram
// POST /api/admin/social-queue { accion: "rechazar", id }          → descarta el borrador
// Solo administradores. Nada se publica sin pulsar "publicar" aquí.
import { adminDb } from '../_lib/admin.js';
import { esAdmin, contarPorPreparar, crearBorradores, validarPiezas, faltanVariablesMeta, intentar, publicarFacebook, publicarInstagram, type Resultado } from '../_lib/social.js';

export default async function handler(req: any, res: any) {
  try {
    if (!(await esAdmin(req))) return res.status(403).json({ error: 'Solo administradores' });
  } catch (err) {
    console.error('social-queue auth', err);
    return res.status(401).json({ error: 'Sesión no válida' });
  }
  const col = adminDb().collection('social_queue');

  if (req.method === 'GET') {
    const snap = await col.orderBy('createdAt', 'desc').limit(120).get();
    const porPreparar = await contarPorPreparar().catch(() => null);
    return res.status(200).json({ items: snap.docs.map(d => ({ id: d.id, ...d.data() })), porPreparar });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { accion, id } = req.body ?? {};

  if (accion === 'generar') {
    const r = await crearBorradores(3);
    return res.status(200).json(r);
  }

  if (typeof id !== 'string' || !id) return res.status(400).json({ error: 'Falta id' });
  const ref = col.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'Borrador no encontrado' });
  const doc = snap.data() as any;

  if (accion === 'rechazar') {
    await ref.update({ status: 'rechazado', cerradoEn: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  }

  if (accion === 'publicar') {
    if (doc.status === 'publicado') return res.status(409).json({ error: 'Ya está publicado' });
    let pieces = doc.pieces;
    if (req.body?.pieces) {
      try { pieces = validarPiezas(req.body.pieces); } catch { return res.status(400).json({ error: 'Los textos están incompletos' }); }
    }
    const conIg = /^https:\/\//.test(doc.imageUrl ?? '');
    const faltan = faltanVariablesMeta(true, conIg);
    if (faltan.length) return res.status(500).json({ error: `Faltan variables en Vercel: ${faltan.join(', ')}` });

    // Si un intento anterior publicó una red y falló la otra, solo se reintenta la que falló.
    const resultados: Record<string, Resultado> = { ...(doc.resultados ?? {}) };
    if (!resultados.facebook?.ok) resultados.facebook = await intentar(() => publicarFacebook(pieces.facebook.copy, doc.url));
    if (conIg && !resultados.instagram?.ok) {
      const caption = `${pieces.instagram.copy}\n\n${pieces.instagram.hashtags.join(' ')}`.slice(0, 2200);
      resultados.instagram = await intentar(() => publicarInstagram(caption, doc.imageUrl));
    }
    const completo = resultados.facebook?.ok && (!conIg || resultados.instagram?.ok);
    await ref.update({
      pieces, resultados,
      status: completo ? 'publicado' : 'pendiente',
      ...(completo ? { publicadoEn: new Date().toISOString() } : {}),
    });
    return res.status(200).json({ status: completo ? 'publicado' : 'pendiente', resultados });
  }

  return res.status(400).json({ error: 'Acción no válida' });
}
