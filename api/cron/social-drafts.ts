// GET /api/cron/social-drafts — lo llama Vercel Cron cada día (vercel.json).
// Prepara borradores de redes con IA para el contenido nuevo; NO publica: tú los apruebas en Admin → Redes.
// Vercel envía "Authorization: Bearer <CRON_SECRET>" si la variable CRON_SECRET existe en el proyecto.
import { crearBorradores } from '../_lib/social.js';

export default async function handler(req: any, res: any) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers?.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'No autorizado' });
  try {
    return res.status(200).json(await crearBorradores(3));
  } catch (err: any) {
    console.error('cron social-drafts', err);
    return res.status(500).json({ error: String(err?.message ?? err).slice(0, 200) });
  }
}
