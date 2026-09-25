// Imágenes: generación con IA (Cloudflare Workers AI, FLUX.1 [schnell], plan gratuito)
// y revisión automática con Gemini antes de aceptarlas.
import { IMAGE_URL_PREFIX, MODELO_IMAGEN_CF } from './config.mjs';
import { conReintentos, descargar, log } from './util.mjs';
import { revisarImagenConGemini } from './gemini.mjs';

const INTENTOS_IMAGEN = 3;
const ANCHO_MAXIMO = 1200;
const CALIDAD_JPEG = 78;

/**
 * Compresses to a JPEG of at most 1200 px wide (~150 KB instead of ~550 KB) so pages load fast on phones.
 * sharp is installed only where the automation runs; without it the original image is kept.
 */
export async function optimizarImagen(buffer) {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    log('   (sharp no está instalado: la imagen se guarda sin comprimir)');
    return { buffer, ext: detectarFormato(buffer)?.ext ?? 'jpg' };
  }
  const salida = await sharp(buffer)
    .rotate() // respect phone photo orientation
    .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
    .jpeg({ quality: CALIDAD_JPEG, mozjpeg: true })
    .toBuffer();
  return { buffer: salida, ext: 'jpg' };
}

function detectarFormato(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf[0] === 0x89 && buf[1] === 0x50) return { ext: 'png', mime: 'image/png' };
  if (buf.slice(0, 4).toString() === 'RIFF') return { ext: 'webp', mime: 'image/webp' };
  return null;
}

async function generarConCloudflare(prompt) {
  const cuenta = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!cuenta || !token) {
    const err = new Error('Faltan CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN (secrets del repositorio).');
    err.noReintentar = true;
    throw err;
  }
  return conReintentos('generar imagen (Cloudflare)', async () => {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cuenta}/ai/run/${MODELO_IMAGEN_CF}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      // FLUX.1 [schnell] on Workers AI accepts only prompt and steps (max 8); each call is already a new image.
      body: JSON.stringify({ prompt, steps: 8 }),
      signal: AbortSignal.timeout(120_000)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.result?.image) {
      const detalle = data?.errors?.map(e => e.message).join('; ') || `HTTP ${res.status}`;
      const err = new Error(`Cloudflare no devolvió imagen: ${detalle}`);
      if (res.status === 401 || res.status === 403) {
        err.message = `Cloudflare rechazó la cuenta o el token (ACCOUNT_ID / WORKERS_AI): ${detalle}`;
        err.noReintentar = true;
        err.fatal = true;
      }
      throw err;
    }
    return Buffer.from(data.result.image, 'base64');
  });
}

const ESQUEMA_REVISION = {
  type: 'object',
  properties: {
    aprobada: { type: 'boolean' },
    motivo: { type: 'string' }
  },
  required: ['aprobada', 'motivo']
};

/**
 * Generates an illustrative image and has Gemini check it.
 * Returns { archivo: { nombre, buffer }, url }, or { fallo: "motivos" } when every attempt fails (the piece stays a draft).
 */
export async function crearImagen({ slug, promptImagen, queDebeMostrar }) {
  const prompt = `${promptImagen}. Professional food photography, natural soft daylight, shallow depth of field, fresh blueberries clearly visible, appetizing, realistic, high detail, no text, no letters, no watermark, no logo.`;

  const motivos = [];
  for (let intento = 1; intento <= INTENTOS_IMAGEN; intento++) {
    let buffer;
    try {
      buffer = await generarConCloudflare(prompt);
    } catch (err) {
      log(`   ✗ Imagen ${slug}: ${err.message}`);
      if (err.fatal) throw err;
      motivos.push(`intento ${intento}: ${err.message}`);
      if (err.noReintentar) break;
      continue;
    }
    const formato = detectarFormato(buffer);
    if (!formato) {
      log(`   ✗ Imagen ${slug}: formato desconocido`);
      motivos.push(`intento ${intento}: formato de imagen desconocido`);
      continue;
    }

    const revision = await revisarImagenConGemini({
      imagen: buffer,
      mimeType: formato.mime,
      schema: ESQUEMA_REVISION,
      pregunta: `Eres editor de fotografía de una marca de arándanos frescos. Revisa esta imagen generada con IA para ilustrar: "${queDebeMostrar}".
Apruébala SOLO si se cumplen TODAS estas condiciones:
1. Se ven arándanos (bayas azul oscuro/morado con corona en estrella), no uvas, moras ni otras frutas como protagonistas.
2. Corresponde al tema indicado (el plato, bebida o escena).
3. Parece una fotografía real y apetitosa: sin deformaciones, sin manos o dedos extraños, sin objetos derretidos o imposibles.
4. No contiene texto, letras, logos ni marcas de agua.
Responde en español con {"aprobada": true/false, "motivo": "explicación breve"}.`
    }).catch(err => {
      if (err.fatal) throw err;
      return { aprobada: false, motivo: `No se pudo revisar: ${err.message}` };
    });

    if (revision.aprobada) {
      const final = await optimizarImagen(buffer);
      log(`   ✓ Imagen ${slug} aprobada (intento ${intento}), ${Math.round(buffer.length / 1024)} KB → ${Math.round(final.buffer.length / 1024)} KB`);
      const nombre = `${slug}.${final.ext}`;
      return { archivo: { nombre, buffer: final.buffer }, url: `${IMAGE_URL_PREFIX}/${nombre}` };
    }
    log(`   ✗ Imagen ${slug} rechazada (intento ${intento}): ${revision.motivo}`);
    motivos.push(`intento ${intento}: rechazada: ${revision.motivo}`);
  }
  return { fallo: motivos.join(' | ') || 'sin detalle' };
}

/** Downloads a farm photo attached to a GitHub issue. Returns the same shape as crearImagen, or null. */
export async function descargarFotoPropia({ slug, url }) {
  try {
    const original = await descargar(url, { tipo: 'buffer', timeout: 60_000 });
    if (!detectarFormato(original)) return null;
    const final = await optimizarImagen(original);
    const nombre = `${slug}.${final.ext}`;
    return { archivo: { nombre, buffer: final.buffer }, url: `${IMAGE_URL_PREFIX}/${nombre}` };
  } catch (err) {
    log(`   ✗ No se pudo descargar la foto de la finca: ${err.message}`);
    return null;
  }
}
