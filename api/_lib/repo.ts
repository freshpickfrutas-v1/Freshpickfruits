// Sube un video al repositorio: public/videos/<id>.mp4, lo agrega a public/videos-diarios.json y, si hay una noticia que le
// corresponde, le pone el campo "video". Todo en UN solo commit, por una rama + Pull Request + fusión (el mismo camino que ya usa
// el panel de Aprobaciones con GITHUB_TOKEN_REVISION). Al fusionarse, Vercel despliega el sitio solo.

const REPO = 'freshpickfrutas-v1/Freshpickfruits';

const token = () => (process.env.GITHUB_TOKEN_REVISION ?? '').replace(/\s+/g, '').replace(/^["']+|["']+$/g, '').replace(/^Bearer/i, '');

async function gh(ruta: string, { method = 'GET', body, raw = false }: { method?: string; body?: unknown; raw?: boolean } = {}): Promise<any> {
  const res = await fetch(`https://api.github.com/repos/${REPO}${ruta}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (raw) {
    if (!res.ok) throw new Error(`GitHub ${res.status} al leer ${ruta.split('?')[0]}`);
    return res.text();
  }
  const data: any = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('GitHub rechazó el token GITHUB_TOKEN_REVISION (401)');
  if (!res.ok) throw new Error(`GitHub ${method} ${ruta.split('?')[0].slice(0, 50)}: ${res.status} ${data.message ?? ''}`);
  return data;
}

export interface EntradaVideo {
  id: string;
  archivo: string;
  titulo: string;
  descripcion?: string;
  noticiaSlug?: string;
  fecha: string;
  ancho?: number;
  alto?: number;
  duracion?: number;
  bytes: number;
  origen: string;
}

/**
 * Prepara (y, si no es simulacro, publica) el commit con el video. Con simular=true crea solo objetos sueltos de Git
 * (blobs, árbol y commit sin rama), que no cambian nada y Git descarta solo: sirve para comprobar permisos y datos.
 */
export async function subirVideo({ mp4, entrada, simular }: { mp4: Buffer; entrada: EntradaVideo; simular: boolean }): Promise<{ commit: string; pr?: number; noticia?: string }> {
  const principal = await gh('/git/ref/heads/main');
  const commitBase: string = principal.object.sha;
  const infoCommit = await gh(`/git/commits/${commitBase}`);

  const textoRegistro = await gh('/contents/public/videos-diarios.json?ref=main', { raw: true }).catch(() => '[]');
  const registro: any[] = JSON.parse(String(textoRegistro).trim() || '[]');
  if (registro.some(v => v.id === entrada.id)) throw new Error(`El video ${entrada.id} ya está en el registro`);
  registro.push(entrada);

  const archivos: { path: string; sha: string }[] = [];
  const blobVideo = await gh('/git/blobs', { method: 'POST', body: { content: mp4.toString('base64'), encoding: 'base64' } });
  archivos.push({ path: `public/videos/${entrada.id}.mp4`, sha: blobVideo.sha });
  const blobRegistro = await gh('/git/blobs', { method: 'POST', body: { content: JSON.stringify(registro, null, 2) + '\n', encoding: 'utf-8' } });
  archivos.push({ path: 'public/videos-diarios.json', sha: blobRegistro.sha });

  let noticia: string | undefined;
  if (entrada.noticiaSlug) {
    const ruta = `src/content/noticias/${entrada.noticiaSlug}.json`;
    const art: any = JSON.parse(await gh(`/contents/${ruta}?ref=main`, { raw: true }));
    if (!art.video) {
      const nuevo: any = {};
      for (const [k, v] of Object.entries(art)) {
        nuevo[k] = v;
        if (k === 'imageAlt') nuevo.video = { src: entrada.archivo };
      }
      if (!nuevo.video) nuevo.video = { src: entrada.archivo };
      const blobNoticia = await gh('/git/blobs', { method: 'POST', body: { content: JSON.stringify(nuevo, null, 2) + '\n', encoding: 'utf-8' } });
      archivos.push({ path: ruta, sha: blobNoticia.sha });
      noticia = entrada.noticiaSlug;
    }
  }

  const arbol = await gh('/git/trees', { method: 'POST', body: { base_tree: infoCommit.tree.sha, tree: archivos.map(a => ({ path: a.path, mode: '100644', type: 'blob', sha: a.sha })) } });
  const mensaje = `Video diario: ${entrada.titulo}`;
  const commit = await gh('/git/commits', { method: 'POST', body: { message: mensaje, tree: arbol.sha, parents: [commitBase] } });
  if (simular) return { commit: String(commit.sha), noticia };

  const rama = `videos-diarios/${entrada.id}`;
  await gh('/git/refs', { method: 'POST', body: { ref: `refs/heads/${rama}`, sha: commit.sha } });
  const pr = await gh('/pulls', { method: 'POST', body: { title: mensaje, head: rama, base: 'main', body: 'Video recibido por correo (Instinct) y subido automáticamente.' } });
  await gh(`/pulls/${pr.number}/merge`, { method: 'PUT', body: { merge_method: 'squash', commit_title: mensaje } });
  await gh(`/git/refs/heads/${rama}`, { method: 'DELETE' }).catch(() => {});
  return { commit: String(commit.sha), pr: Number(pr.number), noticia };
}
