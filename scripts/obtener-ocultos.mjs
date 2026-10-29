// Descarga la lista de recetas y noticias "eliminadas" desde el panel de admin (Firestore, colección hiddenContent,
// lectura pública) para que el sitemap y el prerender las dejen fuera. Si no se puede leer, el build sigue sin filtrar.
import fs from 'node:fs';
import path from 'node:path';
import { root } from './contenido-publicado.mjs';

const PROJECT = 'yogic-oxygen-h53bd-869ca';
const out = path.join(root, 'scripts', '.ocultos.json');

try {
  const ocultos = [];
  let pageToken = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/hiddenContent?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Firestore ${res.status}`);
    const data = await res.json();
    for (const d of data.documents ?? []) ocultos.push(d.name.split('/').pop());
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);
  fs.writeFileSync(out, JSON.stringify(ocultos), 'utf8');
  console.log(`ocultos: ${ocultos.length} elementos eliminados desde el admin`);
} catch (error) {
  fs.writeFileSync(out, '[]', 'utf8');
  console.warn(`ocultos: no se pudo leer (${error.message}); el sitemap no filtra esta vez`);
}
