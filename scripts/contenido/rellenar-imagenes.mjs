// Genera imágenes para recetas o noticias que no tienen una, a partir de automatizacion/rellenar-imagenes.json.
// Cada entrada: { tipo: "noticias" | "recetas", slug, prompt (en inglés), alt, queDebeMostrar }.
// Usa el mismo proceso que el contenido diario: IA (Cloudflare) → revisión con Gemini → compresión.
// Si una imagen no se aprueba, esa pieza se deja como estaba (con el recuadro de la marca).
//
//   node scripts/contenido/rellenar-imagenes.mjs          → genera y publica en main
//   node scripts/contenido/rellenar-imagenes.mjs --prueba → genera sin publicar
import fs from 'node:fs';
import path from 'node:path';
import { CREDITO_IMAGEN_IA, ROOT } from './config.mjs';
import { crearImagen } from './imagenes.mjs';
import { commitYPush, escribirArchivos } from './publicar.mjs';
import { escribirJson, leerJson, log } from './util.mjs';

const PRUEBA = process.argv.includes('--prueba');
const LISTA = path.join(ROOT, 'automatizacion', 'rellenar-imagenes.json');
const RESULTADO = path.join(ROOT, 'automatizacion', 'resultado-imagenes.md');

const pendientes = leerJson(LISTA, []);
const lineas = [`## Imágenes faltantes · ${new Date().toISOString().slice(0, 10)}`, ''];
const rutas = [];

for (const p of pendientes) {
  const archivoJson = path.join(ROOT, 'src', 'content', p.tipo, `${p.slug}.json`);
  if (!fs.existsSync(archivoJson)) {
    lineas.push(`- ⚠️ ${p.slug}: no existe`);
    continue;
  }
  const pieza = JSON.parse(fs.readFileSync(archivoJson, 'utf8'));
  if (pieza.image) {
    lineas.push(`- ℹ️ ${p.slug}: ya tenía imagen`);
    continue;
  }
  log(`🖼️  ${p.slug}`);
  const imagen = await crearImagen({ slug: p.slug, promptImagen: p.prompt, queDebeMostrar: p.queDebeMostrar });
  if (imagen.fallo) {
    lineas.push(`- ❌ ${p.slug}: ${imagen.fallo}`);
    continue;
  }
  Object.assign(pieza, { image: imagen.url, imageAlt: p.alt ?? pieza.imageAlt, imagenTipo: 'generada', imagenCredit: CREDITO_IMAGEN_IA });
  const rutaImagen = `public/img/generadas/${imagen.archivo.nombre}`;
  const rutaJson = `src/content/${p.tipo}/${p.slug}.json`;
  if (!PRUEBA) {
    escribirArchivos([{ ruta: rutaImagen, contenido: imagen.archivo.buffer }]);
    escribirJson(archivoJson, pieza);
  }
  rutas.push(rutaImagen, rutaJson);
  lineas.push(`- ✅ ${p.slug}: ${imagen.url}`);
}

const resumen = lineas.join('\n') + '\n';
console.log('\n' + resumen);
// Only commit when something changed (the daily retry is usually a no-op).
if (!PRUEBA && (rutas.length || lineas.some(l => l.startsWith('- ❌')))) {
  fs.writeFileSync(RESULTADO, resumen, 'utf8');
  commitYPush([...rutas, 'automatizacion/resultado-imagenes.md'], `imágenes para contenido que no tenía: ${rutas.filter(r => r.endsWith('.json')).length} piezas`);
}
if (lineas.some(l => l.startsWith('- ❌'))) process.exitCode = 1;
