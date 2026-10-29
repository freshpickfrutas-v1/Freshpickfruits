// GET  /api/admin/revision                     → borradores pendientes (con vista previa) e historial con fechas
// POST /api/admin/revision { accion, number }  → "aprobar" (publica) o "rechazar" (descarta) un borrador
//
// Cada borrador es un Pull Request de GitHub en una rama borradores/<tipo>/<id>:
//   fecha de subida   = created_at del Pull Request
//   fecha de aprobado = merged_at (al aprobar se hace merge a main y Vercel publica solo)
// Solo administradores (token de Firebase). Necesita GITHUB_TOKEN_REVISION en Vercel (fine-grained: Contents y Pull requests en lectura y escritura).
import { adminDb } from '../_lib/admin.js';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const REPO = 'freshpickfrutas-v1/Freshpickfruits';
const BOOTSTRAP_ADMINS = ['info@freshpickfruits.com', 'freshpickfrutas@gmail.com'];
const PREFIJO = 'borradores/';

async function esAdmin(req: any): Promise<boolean> {
  const header = String(req.headers?.authorization ?? '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return false;
  // Google valida el token de sesión (firma, vencimiento y proyecto). Se usa su API en vez de firebase-admin/auth,
  // que en el servidor de Vercel falla al cargar una dependencia (jose).
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${(firebaseConfig as { apiKey: string }).apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token })
  });
  if (!res.ok) return false;
  const user = (await res.json()).users?.[0];
  if (!user?.localId) return false;
  if (user.emailVerified && BOOTSTRAP_ADMINS.includes(user.email ?? '')) return true;
  const snap = await adminDb().collection('users').doc(user.localId).get();
  return snap.exists && snap.data()?.role === 'admin';
}

async function github(ruta: string, { method = 'GET', body, raw = false }: { method?: string; body?: unknown; raw?: boolean } = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${ruta}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN_REVISION}`,
      Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (raw) {
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    return res.text();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GitHub ${method} ${ruta}: ${res.status} ${data.message ?? ''}`);
  return data;
}

/** Contenido del borrador: el primer JSON de src/content/ que trae el Pull Request. */
async function vistaPrevia(pr: any) {
  try {
    const files = await github(`/pulls/${pr.number}/files?per_page=20`);
    const file = files.find((f: any) => /^src\/content\/(recetas|noticias|videos)\/.+\.json$/.test(f.filename));
    if (!file) return null;
    const json = JSON.parse(await github(`/contents/${encodeURIComponent(file.filename).replace(/%2F/g, '/')}?ref=${pr.head.sha}`, { raw: true }));
    return {
      title: json.title,
      excerpt: json.excerpt ?? json.metaDescription,
      category: json.category,
      channel: json.channel,
      videoId: json.id && !json.slug ? json.id : undefined,
      seccion: json.seccion,
      blocks: Array.isArray(json.blocks) ? json.blocks.slice(0, 80) : undefined,
      ingredients: Array.isArray(json.ingredients) ? json.ingredients : undefined,
      steps: Array.isArray(json.steps) ? json.steps : undefined,
      tips: Array.isArray(json.tips) ? json.tips : undefined,
      fuentes: Array.isArray(json.fuentes) ? json.fuentes.map((f: any) => ({ titulo: f.titulo, url: f.url, medio: f.medio })) : undefined
    };
  } catch {
    return null;
  }
}

function resumen(pr: any) {
  const [, tipo = 'noticias'] = String(pr.head.ref).split('/');
  return {
    number: pr.number,
    tipo: tipo === 'recetas' ? 'receta' : tipo === 'videos' ? 'video' : 'noticia',
    title: String(pr.title).replace(/^Revisar:\s*/, ''),
    estado: pr.merged_at ? 'aprobado' : pr.state === 'open' ? 'pendiente' : 'rechazado',
    subidoEn: pr.created_at as string,
    aprobadoEn: (pr.merged_at ?? null) as string | null,
    cerradoEn: (pr.closed_at ?? null) as string | null,
    url: pr.html_url as string
  };
}

export default async function handler(req: any, res: any) {
  try {
    if (!(await esAdmin(req))) return res.status(403).json({ error: 'Solo administradores' });
  } catch (err) {
    console.error('admin/revision auth', err);
    return res.status(401).json({ error: 'Sesión no válida', detalle: err instanceof Error ? err.message.slice(0, 160) : undefined });
  }
  if (!process.env.GITHUB_TOKEN_REVISION) return res.status(200).json({ error: 'no_configurado' });

  try {
    if (req.method === 'GET') {
      const prs = (await github('/pulls?state=all&per_page=100&sort=created&direction=desc')).filter((p: any) => String(p.head?.ref).startsWith(PREFIJO));
      const abiertos = prs.filter((p: any) => p.state === 'open').slice(0, 25);
      const previews = await Promise.all(abiertos.map(vistaPrevia));
      const pendientes = abiertos.map((p: any, i: number) => ({ ...resumen(p), preview: previews[i] }));
      const historial = prs.filter((p: any) => p.state !== 'open').slice(0, 60).map(resumen);
      return res.status(200).json({ pendientes, historial });
    }

    if (req.method === 'POST') {
      const number = Number(req.body?.number);
      const accion = req.body?.accion;
      if (!Number.isInteger(number) || !['aprobar', 'rechazar'].includes(accion)) return res.status(400).json({ error: 'Solicitud inválida' });
      const pr = await github(`/pulls/${number}`);
      if (!String(pr.head?.ref).startsWith(PREFIJO)) return res.status(400).json({ error: 'No es un borrador de contenido' });
      if (pr.state !== 'open') return res.status(409).json({ error: 'Este borrador ya fue resuelto' });

      if (accion === 'aprobar') {
        await github(`/pulls/${number}/merge`, { method: 'PUT', body: { merge_method: 'squash', commit_title: `Aprobado: ${String(pr.title).replace(/^Revisar:\s*/, '')}` } });
      } else {
        await github(`/pulls/${number}`, { method: 'PATCH', body: { state: 'closed' } });
      }
      // La rama del borrador ya no hace falta.
      await github(`/git/refs/heads/${pr.head.ref}`, { method: 'DELETE' }).catch(() => {});
      return res.status(200).json({ ok: true, resumen: resumen(await github(`/pulls/${number}`)) });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('admin/revision', err);
    return res.status(502).json({ error: err instanceof Error ? err.message : 'No se pudo consultar GitHub' });
  }
}
