// Reúne noticias candidatas de los últimos días desde fuentes gratuitas:
// RSS del sector (en español), ScienceDaily, PubMed y noticias de la finca (issues de GitHub).
import {
  DIAS_NOTICIA_ACTUAL, DOMINIOS_CONFIABLES, ETIQUETA_NOTICIA_FINCA, FUENTES_RSS, PUBMED_QUERY, SUFIJOS_UNIVERSIDAD
} from './config.mjs';
import { descargar, dominioDe, log, quitarHtml } from './util.mjs';
import { buscarConGoogle } from './gemini.mjs';

const MENCIONA_ARANDANO = /ar[aá]ndano|blueberr|vaccinium/i;

function etiqueta(xml, nombre) {
  const m = xml.match(new RegExp(`<${nombre}[^>]*>([\\s\\S]*?)</${nombre}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function reciente(fecha, dias = DIAS_NOTICIA_ACTUAL) {
  const t = Date.parse(fecha);
  return Number.isFinite(t) && Date.now() - t <= dias * 24 * 3600 * 1000;
}

async function desdeRss(fuente) {
  const xml = await descargar(fuente.url);
  const items = xml.split(/<item[\s>]/i).slice(1).map(bloque => {
    const titulo = quitarHtml(etiqueta(bloque, 'title'));
    const url = quitarHtml(etiqueta(bloque, 'link'));
    const fecha = etiqueta(bloque, 'pubDate');
    const resumen = quitarHtml(etiqueta(bloque, 'description')).slice(0, 600);
    const contenido = quitarHtml(etiqueta(bloque, 'content:encoded'));
    return { titulo, url, fecha, resumen, contenido };
  });
  return items
    .filter(i => i.url && reciente(i.fecha))
    .filter(i => !fuente.soloArandano || MENCIONA_ARANDANO.test(`${i.titulo} ${i.resumen} ${i.contenido}`))
    .map(i => ({
      id: `${fuente.id}:${i.url}`,
      origen: fuente.id,
      medio: fuente.medio,
      idioma: fuente.idioma,
      categoriaSugerida: fuente.categoriaSugerida,
      titulo: i.titulo,
      url: i.url,
      fecha: new Date(i.fecha).toISOString().slice(0, 10),
      resumen: i.resumen,
      texto: i.contenido.length > 400 ? i.contenido : ''
    }));
}

async function desdePubmed() {
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  const comun = 'tool=freshpick-contenido';
  const busqueda = await descargar(
    `${base}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(PUBMED_QUERY)}&reldate=${DIAS_NOTICIA_ACTUAL}&datetype=edat&retmode=json&retmax=15&${comun}`,
    { tipo: 'json' }
  );
  const ids = busqueda?.esearchresult?.idlist ?? [];
  if (!ids.length) return [];
  const xml = await descargar(`${base}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml&${comun}`);
  return xml.split(/<PubmedArticle>/).slice(1).map(art => {
    const pmid = etiqueta(art, 'PMID');
    const titulo = quitarHtml(etiqueta(art, 'ArticleTitle'));
    const revista = quitarHtml(etiqueta(art, 'Title'));
    const resumen = [...art.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map(m => quitarHtml(m[1])).join('\n');
    const y = etiqueta(art, 'Year');
    return {
      id: `pubmed:${pmid}`,
      origen: 'pubmed',
      medio: revista ? `PubMed · ${revista}` : 'PubMed',
      idioma: 'en',
      categoriaSugerida: 'nutricion-ciencia',
      titulo,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      fecha: y ? `${y}` : '',
      resumen: resumen.slice(0, 600),
      texto: resumen
    };
  }).filter(c => c.texto.length > 300); // studies without abstract can't be explained honestly
}

/** Farm news: open GitHub issues labeled "noticia-finca" (can be created from the GitHub phone app). */
export async function noticiasDeLaFinca() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) return [];
  const issues = await descargar(
    `https://api.github.com/repos/${repo}/issues?state=open&labels=${ETIQUETA_NOTICIA_FINCA}&per_page=10`,
    { tipo: 'json', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
  );
  return issues.filter(i => !i.pull_request).map(i => {
    const foto = i.body?.match(/!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/)?.[1] ?? i.body?.match(/<img[^>]+src="(https:\/\/[^"]+)"/)?.[1] ?? null;
    return {
      id: `finca:${i.number}`,
      origen: 'finca',
      issue: i.number,
      medio: 'Fresh Pick',
      idioma: 'es',
      categoriaSugerida: 'cultivo-origen',
      titulo: i.title,
      url: i.html_url,
      fecha: i.created_at.slice(0, 10),
      resumen: (i.body ?? '').slice(0, 600),
      texto: (i.body ?? '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<img[^>]*>/g, '').trim(),
      foto
    };
  });
}

function dominioConfiable(url) {
  const d = dominioDe(url);
  return DOMINIOS_CONFIABLES.some(x => d === x || d.endsWith(`.${x}`)) || SUFIJOS_UNIVERSIDAD.some(s => d.endsWith(s));
}

/** Backup (source D): Gemini with Google Search, only when the feeds found nothing usable. */
export async function candidatasPorBusqueda(usadas) {
  const { texto, fuentes } = await buscarConGoogle({
    prompt: `Busca noticias publicadas en los últimos ${DIAS_NOTICIA_ACTUAL} días sobre arándanos (blueberries): estudios científicos de salud o nutrición, cosechas, mercado, exportaciones (especialmente Colombia y Latinoamérica), variedades o cultivo.
Para cada noticia real que encuentres, resume en 3-5 frases qué dice, con cifras y nombres concretos, e indica el medio y la fecha. No inventes nada.`
  });
  const validas = fuentes.filter(f => dominioConfiable(f.url) && !usadas.has(f.url));
  log(`   Búsqueda con Google: ${fuentes.length} fuentes, ${validas.length} de dominios confiables`);
  return validas.slice(0, 5).map((f, i) => ({
    id: `busqueda:${f.url}`,
    origen: 'busqueda',
    medio: dominioDe(f.url),
    idioma: /\.(co|es|mx|pe|cl|ar)$|consulting|fruticola|freshplaza\.es/.test(dominioDe(f.url)) ? 'es' : 'en',
    categoriaSugerida: 'cultivo-origen',
    titulo: f.titulo || dominioDe(f.url),
    url: f.url,
    fecha: '',
    resumen: i === 0 ? texto.slice(0, 600) : '',
    texto: ''
  }));
}

/** All candidates from the feeds, excluding sources already used. Each source failure is logged, not fatal. */
export async function reunirCandidatas(usadas) {
  const tareas = [
    ...FUENTES_RSS.map(f => ({ nombre: f.medio, fn: () => desdeRss(f) })),
    { nombre: 'PubMed', fn: desdePubmed },
    { nombre: 'Noticias de la finca', fn: noticiasDeLaFinca }
  ];
  const todas = [];
  for (const t of tareas) {
    try {
      const encontradas = await t.fn();
      log(`   ${t.nombre}: ${encontradas.length} candidatas recientes`);
      todas.push(...encontradas);
    } catch (err) {
      log(`   ⚠️  ${t.nombre} no respondió: ${err.message}`);
    }
  }
  return todas.filter(c => !usadas.has(c.url));
}

/** Full text for a candidate: feed content if it had it, otherwise the page itself. */
export async function textoCompleto(c) {
  if (c.origen === 'finca') return c.texto; // the team's own note: never fetch the GitHub page
  if (c.texto && c.texto.length > 400) return c.texto.slice(0, 15_000);
  try {
    const html = await descargar(c.url);
    const cuerpo = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
    return quitarHtml(cuerpo).slice(0, 15_000);
  } catch (err) {
    log(`   ⚠️  No se pudo leer ${c.url}: ${err.message}`);
    return c.resumen ?? '';
  }
}
