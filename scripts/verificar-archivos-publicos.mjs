// Avisa si falta un archivo que no debe desaparecer de public/.
//
// - google5f2ce04d3bc7c6cd.html: verificación de Google Search Console. Si se borra, Google pierde
//   la verificación de la propiedad (y con ella el acceso a sitemaps e indexación).
// - robots.txt y sitemap.xml: los lee Google para rastrear el sitio.
//
// Solo avisa (no frena el build): un olvido aquí no debe bloquear el despliegue de la tienda.
// Se ejecuta antes de cada build (ver "prebuild" en package.json).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const required = [
  { file: 'google5f2ce04d3bc7c6cd.html', why: 'verificación de Google Search Console; si falta, Google pierde la verificación' },
  { file: 'robots.txt', why: 'indica a Google qué rastrear y dónde está el sitemap' }
];

const missing = required.filter(r => !fs.existsSync(path.join(root, 'public', r.file)));
if (missing.length === 0) {
  console.log(`archivos públicos: ${required.length} comprobados, ninguno falta`);
} else {
  const lines = missing.map(m => `  - public/${m.file}: ${m.why}`).join('\n');
  console.warn(`\n⚠️  FALTAN ARCHIVOS EN public/ (no se detiene el build, pero hay que restaurarlos):\n${lines}\n`);
}
