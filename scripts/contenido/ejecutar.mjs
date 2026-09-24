// Ejecución diaria del sistema de contenido de Fresh Pick.
//
//   node scripts/contenido/ejecutar.mjs            → ejecución real (GitHub Actions, todos los días 9:00 a.m.)
//   node scripts/contenido/ejecutar.mjs --prueba   → genera en automatizacion/prueba/ sin publicar nada
//   Opciones: --solo=recetas | --solo=noticias · --recetas=N · --noticias=N (fuerza cantidades, útil en pruebas)
//
// Reglas: 1 receta por día desde cola-recetas.json; noticias con meta de 7 por semana (lunes a domingo),
// máximo 2 por día para recuperar días sin noticia, sin arrastrar faltantes a la semana siguiente.
import fs from 'node:fs';
import path from 'node:path';
import {
  MAX_INTENTOS_RECETA, MAX_NOTICIAS_POR_DIA, NOTICIAS_POR_SEMANA, PATHS, RECETAS_POR_DIA, ROOT
} from './config.mjs';
import { escribirJson, hoyColombia, leerCarpetaJson, leerJson, log, lunesDeLaSemana } from './util.mjs';
import { crearReceta } from './recetas.mjs';
import { candidatasPorBusqueda, reunirCandidatas } from './fuentes-noticias.mjs';
import { crearNoticia, elegirNoticias } from './noticias.mjs';
import {
  PREFIJO_RAMA_REVISION, comentarIssue, commitYPush, crearPrRevision, escribirArchivos, prsDeRevisionAbiertosDesde
} from './publicar.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));
const PRUEBA = Boolean(args.prueba);
const hoy = hoyColombia();
const lunes = lunesDeLaSemana(hoy.fecha, hoy.diaSemana);
const resumen = [];
/** Pieces this run was supposed to produce; if >0 and nothing comes out, the run is marked as failed. */
let piezasEsperadas = 0;
const anotar = (tipo, texto) => {
  resumen.push({ tipo, texto });
  log(texto);
};

// ---------- Recetas ----------
/** Queue items whose recipe already exists (e.g. a review PR that was merged) are marked as published. */
function sincronizarCola(cola) {
  const publicadas = new Map(leerCarpetaJson(PATHS.recetas).map(r => [r.slug, r]));
  for (const item of cola) {
    const r = publicadas.get(item.slug);
    if (r && item.estado !== 'publicado') Object.assign(item, { estado: 'publicado', fechaPublicacion: r.date ?? hoy.fecha });
  }
}

async function hacerRecetas(cola) {
  sincronizarCola(cola);
  const yaHoy = cola.filter(r => r.estado === 'publicado' && r.fechaPublicacion === hoy.fecha).length;
  let faltan = args.recetas !== undefined ? Number(args.recetas) : Math.max(0, RECETAS_POR_DIA - yaHoy);
  if (!faltan) {
    anotar('info', `Recetas: la de hoy (${hoy.fecha}) ya estaba publicada.`);
    return [];
  }
  piezasEsperadas += faltan;
  const hechas = [];
  let enRevision = new Set();
  if (!PRUEBA) {
    try {
      const prefijo = `${PREFIJO_RAMA_REVISION}recetas/`;
      enRevision = new Set((await prsDeRevisionAbiertosDesde('0000-00-00'))
        .filter(pr => pr.head.ref.startsWith(prefijo))
        .map(pr => pr.head.ref.slice(prefijo.length)));
    } catch (err) {
      log(`⚠️  No se pudieron consultar los Pull Requests abiertos: ${err.message}`);
    }
  }
  const pendientes = cola
    .filter(r => r.estado === 'pendiente' && !enRevision.has(r.slug))
    .sort((a, b) => a.orden - b.orden);
  if (!pendientes.length) anotar('aviso', 'Recetas: la cola está vacía. Agrega más títulos a cola-recetas.json.');

  // One extra try per run: if today's recipe fails, the next one in the queue is attempted.
  const maxIntentos = faltan + 1;
  let intentosHoy = 0;
  for (const item of pendientes) {
    if (!faltan || intentosHoy >= maxIntentos) break;
    intentosHoy++;
    try {
      const r = await crearReceta(item, { fecha: hoy.fecha });
      if (r.ok) {
        hechas.push({ ...r, item });
        faltan--;
        continue;
      }
      registrarFalloReceta(item, r.problemas.join('; '));
    } catch (err) {
      if (err.fatal) throw err; // bad key: stop without touching the queue
      registrarFalloReceta(item, err.message);
    }
  }
  return hechas;
}

function registrarFalloReceta(item, motivo) {
  item.intentos = (item.intentos ?? 0) + 1;
  item.ultimoError = motivo;
  if (item.intentos >= MAX_INTENTOS_RECETA) {
    item.estado = 'borrador';
    anotar('error', `Receta "${item.titulo}" pasó a BORRADOR tras ${item.intentos} intentos: ${motivo}`);
  } else {
    anotar('aviso', `Receta "${item.titulo}" no se publicó (intento ${item.intentos}/${MAX_INTENTOS_RECETA}): ${motivo}`);
  }
}

// ---------- Noticias ----------
async function noticiasDeLaSemana() {
  const publicadas = leerCarpetaJson(PATHS.noticias).filter(n => n.date >= lunes).length;
  let enRevision = 0;
  if (!PRUEBA) {
    try {
      enRevision = (await prsDeRevisionAbiertosDesde(lunes)).filter(pr => pr.head.ref.startsWith(`${PREFIJO_RAMA_REVISION}noticias/`)).length;
    } catch (err) {
      log(`⚠️  No se pudieron contar las noticias en revisión: ${err.message}`);
    }
  }
  return { publicadas, enRevision, total: publicadas + enRevision };
}

async function hacerNoticias(estado) {
  const semana = await noticiasDeLaSemana();
  const esperadasHastaHoy = Math.min(hoy.diaSemana, NOTICIAS_POR_SEMANA);
  let objetivo = args.noticias !== undefined
    ? Number(args.noticias)
    : Math.max(0, Math.min(MAX_NOTICIAS_POR_DIA, esperadasHastaHoy - semana.total, NOTICIAS_POR_SEMANA - semana.total));
  anotar('info', `Noticias esta semana (desde ${lunes}): ${semana.publicadas} publicadas + ${semana.enRevision} en revisión. Hoy toca: ${objetivo}.`);
  if (!objetivo) return [];
  piezasEsperadas += objetivo;

  const usadas = new Set(estado.fuentesUsadas);
  const recetas = leerCarpetaJson(PATHS.recetas).filter(r => r.estado !== 'borrador');
  const hechas = [];

  async function intentar(candidatas) {
    let elegidas = [];
    try {
      elegidas = await elegirNoticias(candidatas, objetivo);
    } catch (err) {
      if (err.fatal) throw err;
      anotar('aviso', `No se pudieron elegir noticias: ${err.message}`);
      return;
    }
    for (const c of elegidas) {
      if (hechas.length >= objetivo) break;
      if (usadas.has(c.url)) continue;
      usadas.add(c.url);
      estado.fuentesUsadas.push(c.url);
      try {
        const r = await crearNoticia(c, { fecha: hoy.fecha, recetas });
        if (r.ok) hechas.push(r);
        else anotar('aviso', `Noticia descartada ("${c.titulo}", ${c.medio}): ${r.problemas.join('; ')}`);
        if (c.origen === 'finca' && !r.ok && !PRUEBA) {
          await comentarIssue(c.issue, `No pude convertir esta nota en noticia: ${r.problemas.join('; ')}. Puedes editarla y abrir un issue nuevo con la etiqueta \`noticia-finca\`.`, { cerrar: true }).catch(() => {});
        }
      } catch (err) {
        if (err.fatal) throw err;
        anotar('aviso', `Noticia con error ("${c.titulo}"): ${err.message}`);
      }
    }
  }

  const candidatas = await reunirCandidatas(usadas);
  anotar('info', `Candidatas recientes encontradas: ${candidatas.length}.`);
  if (candidatas.length) await intentar(candidatas);

  if (hechas.length < objetivo) {
    log('🔎 Faltan noticias: probando la búsqueda con Google (respaldo).');
    try {
      const extra = await candidatasPorBusqueda(usadas);
      if (extra.length) await intentar(extra);
    } catch (err) {
      if (err.fatal) throw err;
      anotar('aviso', `Búsqueda de respaldo no disponible: ${err.message}`);
    }
  }
  if (hechas.length < objetivo) {
    anotar('aviso', `Hoy no se encontraron suficientes noticias válidas (${hechas.length}/${objetivo}). No se publica relleno; se intentará recuperar en los próximos días de esta semana.`);
  }
  return hechas;
}

// ---------- Principal ----------
/** Missing keys stop the run before touching the queue, so a setup problem never burns recipe attempts. */
function clavesFaltantes() {
  const requeridas = ['GEMINI_API_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN'];
  if (!PRUEBA) requeridas.push('GITHUB_TOKEN', 'GITHUB_REPOSITORY');
  return requeridas.filter(k => !process.env[k]);
}

async function main() {
  log(`=== Contenido Fresh Pick · ${hoy.fecha} (día ${hoy.diaSemana} de la semana) ${PRUEBA ? '· MODO PRUEBA' : ''} ===`);
  const faltantes = clavesFaltantes();
  if (faltantes.length) {
    anotar('error', `Faltan claves: ${faltantes.join(', ')}. Revisa los secrets GEMINI_API_KEY2, ACCOUNT_ID y WORKERS_AI en GitHub → Settings → Secrets and variables → Actions. No se generó nada.`);
    escribirResumen();
    process.exitCode = 1;
    return;
  }
  const cola = leerJson(PATHS.cola, []);
  const estado = leerJson(PATHS.estado, { fuentesUsadas: [], historial: [] });

  const recetas = args.solo === 'noticias' ? [] : await hacerRecetas(cola);
  const noticias = args.solo === 'recetas' ? [] : await hacerNoticias(estado);

  // --todo-a-revision (safe manual test): everything goes to a Pull Request, nothing straight to main.
  // --rama=<nombre> (preview test): everything is committed to that branch so its Vercel preview shows it.
  const todoARevision = Boolean(args['todo-a-revision']);
  const rama = typeof args.rama === 'string' ? args.rama : 'main';
  const todoALaRama = rama !== 'main';
  const automaticas = todoARevision ? [] : todoALaRama ? [...recetas, ...noticias] : [...recetas, ...noticias.filter(n => n.pieza.modo === 'automatico')];
  const enRevision = todoALaRama ? [] : todoARevision ? [...recetas, ...noticias] : noticias.filter(n => n.pieza.modo === 'revision');

  // Recipes sent for review stay "pendiente" in the queue; sincronizarCola marks them once merged.
  for (const r of automaticas) if (r.item) Object.assign(r.item, { estado: 'publicado', fechaPublicacion: hoy.fecha });

  if (PRUEBA) {
    const destino = path.join(PATHS.prueba, hoy.fecha);
    for (const r of [...automaticas, ...enRevision]) escribirArchivos(r.archivos, destino);
    anotar('info', `Modo prueba: ${automaticas.length + enRevision.length} piezas guardadas en ${path.relative(ROOT, destino)} (nada publicado).`);
  } else {
    // 1) Automatic pieces + queue/state updates go straight to main.
    for (const r of automaticas) escribirArchivos(r.archivos);
    for (const r of [...automaticas, ...enRevision]) {
      estado.historial.push({ fecha: hoy.fecha, tipo: r.item ? 'receta' : 'noticia', slug: r.pieza.slug, modo: r.pieza.modo });
    }
    estado.historial = estado.historial.slice(-300);
    estado.fuentesUsadas = [...new Set(estado.fuentesUsadas)].slice(-2000);
    escribirJson(PATHS.cola, cola);
    escribirJson(PATHS.estado, estado);
    const rutas = [...automaticas.flatMap(r => r.archivos.map(a => a.ruta)), 'cola-recetas.json', 'automatizacion/estado.json'];
    const titulos = automaticas.map(r => r.pieza.title).join(' · ') || 'actualización de estado';
    commitYPush(rutas, `contenido ${hoy.fecha}: ${titulos}`, rama);
    for (const r of automaticas) {
      const destino = todoALaRama ? `guardado en la rama ${rama}` : 'Publicado';
      anotar('ok', `${destino}: ${r.item ? '/recetas/' : '/noticias/'}${r.pieza.slug} (${r.pieza.modo})`);
    }

    // 2) Review pieces: one branch + Pull Request each (never touch main until approved).
    for (const r of enRevision) {
      try {
        const url = await crearPrRevision(r);
        anotar('ok', `Para aprobar: "${r.pieza.title}" → ${url}`);
        if (r.candidata?.origen === 'finca') {
          await comentarIssue(r.candidata.issue, `¡Listo! La convertí en noticia. Revísala y apruébala aquí: ${url}`, { cerrar: true }).catch(() => {});
        }
      } catch (err) {
        anotar('error', `No se pudo crear el Pull Request de "${r.pieza.title}": ${err.message}`);
      }
    }
  }

  if (piezasEsperadas > 0 && recetas.length + noticias.length === 0) {
    anotar('error', `Tocaba generar ${piezasEsperadas} piezas y no salió ninguna. Revisa los avisos de arriba.`);
  }
  escribirResumen();
  if (resumen.some(r => r.tipo === 'error')) process.exitCode = 1;
}

function escribirResumen() {
  const iconos = { ok: '✅', info: 'ℹ️', aviso: '⚠️', error: '❌' };
  const md = [`## Contenido Fresh Pick · ${hoy.fecha}`, '', ...resumen.map(r => `- ${iconos[r.tipo]} ${r.texto}`)].join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
  // Also kept as a file so the result can be read without signing in to GitHub's logs.
  if (process.env.GUARDAR_RESULTADO) {
    fs.mkdirSync(path.dirname(process.env.GUARDAR_RESULTADO), { recursive: true });
    fs.writeFileSync(process.env.GUARDAR_RESULTADO, md + '\n', 'utf8');
  }
  console.log('\n' + md);
}

main().catch(err => {
  // Nothing was saved: the queue and state files are only written after all generation succeeds.
  anotar('error', err.fatal ? `${err.message}. No se generó ni guardó nada; revisa la clave y vuelve a ejecutar.` : `Fallo general: ${err.stack ?? err.message}`);
  escribirResumen();
  process.exit(1);
});
