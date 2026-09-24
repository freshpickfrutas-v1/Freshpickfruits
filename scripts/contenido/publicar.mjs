// Publicación con git y la API de GitHub:
// - modo "automatico": commit directo a main (Vercel publica solo).
// - modo "revision": una rama borradores/recetas/<slug> o borradores/noticias/<slug> y un Pull Request "Revisar: <título>" por pieza.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './config.mjs';
import { log } from './util.mjs';

export const PREFIJO_RAMA_REVISION = 'borradores/';

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

export function escribirArchivos(archivos, base = ROOT) {
  for (const a of archivos) {
    const destino = path.join(base, a.ruta);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, a.contenido);
  }
}

async function github(ruta, { method = 'GET', body } = {}) {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) throw new Error('Faltan GITHUB_REPOSITORY / GITHUB_TOKEN (solo existen dentro de GitHub Actions).');
  const res = await fetch(`https://api.github.com/repos/${repo}${ruta}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GitHub ${method} ${ruta}: HTTP ${res.status} ${data.message ?? ''}`);
  return data;
}

/** Commits the given paths on the current branch (main) and pushes, rebasing once if main moved. */
export function commitYPush(rutas, mensaje) {
  git('add', '--', ...rutas);
  if (!git('status', '--porcelain', '--', ...rutas)) {
    log('   (nada que publicar en main)');
    return false;
  }
  git('commit', '-m', mensaje);
  try {
    git('push', 'origin', 'HEAD:main');
  } catch {
    git('pull', '--rebase', 'origin', 'main');
    git('push', 'origin', 'HEAD:main');
  }
  return true;
}

/** Open review Pull Requests (recipes and news) created on or after the given date. */
export async function prsDeRevisionAbiertosDesde(fechaIso) {
  const prs = await github('/pulls?state=open&per_page=100');
  return prs.filter(pr => pr.head?.ref?.startsWith(PREFIJO_RAMA_REVISION) && pr.created_at.slice(0, 10) >= fechaIso);
}

function cuerpoPr(r) {
  const n = r.pieza;
  const esReceta = Boolean(r.item);
  const ruta = `/${esReceta ? 'recetas' : 'noticias'}/${n.slug}`;
  const fuentes = (n.fuentes ?? []).map(f => `- [${f.titulo}](${f.url}) · ${f.medio}${f.idioma === 'en' ? ' (en inglés)' : ''}`).join('\n');
  const origen = esReceta ? '' : fuentes ? `\n**Fuentes:**\n${fuentes}\n` : '\n**Origen:** noticia enviada desde la finca.\n';
  const detalle = esReceta
    ? `**Receta** · **Categoría:** ${n.category} · **Dificultad:** ${n.difficulty} · **Porciones:** ${n.servings}`
    : `**Noticia** · **Categoría:** ${n.category} · **Fecha:** ${n.date} · **Lectura:** ${n.readMinutes} min`;
  return `## ${n.title}

> ${n.excerpt}

${detalle}
${origen}
---

### Cómo revisarla (también desde el celular)
1. Espera el comentario de **Vercel** en este Pull Request y abre el enlace **Preview**.
2. En la vista previa entra a \`${ruta}\` y revisa texto e imagen.
3. **Para publicarla:** botón verde **Merge pull request** → **Confirm merge**. Sale en la web en unos minutos.
4. **Para descartarla:** **Close pull request**. No se publica${esReceta ? '' : ' y el sistema intentará completar la meta semanal con otra noticia'}.

_Creado automáticamente por el sistema de contenido de Fresh Pick._`;
}

/** Creates branch + commit + Pull Request for one piece in review mode. Returns the PR URL. */
export async function crearPrRevision(r) {
  const rama = `${PREFIJO_RAMA_REVISION}${r.item ? 'recetas' : 'noticias'}/${r.pieza.slug}`;
  const actual = git('rev-parse', '--abbrev-ref', 'HEAD');
  git('switch', '-c', rama);
  try {
    escribirArchivos(r.archivos);
    git('add', '--', ...r.archivos.map(a => a.ruta));
    git('commit', '-m', `Revisar: ${r.pieza.title}`);
    git('push', '-u', 'origin', rama);
  } finally {
    git('switch', actual);
  }
  const pr = await github('/pulls', {
    method: 'POST',
    body: { title: `Revisar: ${r.pieza.title}`, head: rama, base: 'main', body: cuerpoPr(r) }
  });
  return pr.html_url;
}

export async function comentarIssue(numero, texto, { cerrar = false } = {}) {
  await github(`/issues/${numero}/comments`, { method: 'POST', body: { body: texto } });
  if (cerrar) await github(`/issues/${numero}`, { method: 'PATCH', body: { state: 'closed' } });
}
