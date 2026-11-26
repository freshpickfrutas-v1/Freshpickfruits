// Lectura de Gmail (SOLO LECTURA) para recibir el video diario que Instinct envía al correo de Fresh Pick.
// Variables en Vercel (Production): GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN (permiso gmail.readonly).
// Seguridad: solo se aceptan correos ENVIADOS desde la propia cuenta (etiqueta SENT de Gmail). Un correo falso que llegue de afuera
// nunca trae esa etiqueta, así que no puede hacer que se publique nada.

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';
export const MAX_BYTES_VIDEO = 25 * 1024 * 1024;

const limpiar = (v?: string) => (v ?? '').trim().replace(/^["']+|["']+$/g, '');

export const gmailConfigurado = () =>
  !!(limpiar(process.env.GMAIL_CLIENT_ID) && limpiar(process.env.GMAIL_CLIENT_SECRET) && limpiar(process.env.GMAIL_REFRESH_TOKEN));

export function faltanVariablesGmail(): string[] {
  return ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'].filter(k => !limpiar(process.env[k]));
}

export interface CorreoConVideo {
  messageId: string;
  /** Fecha del correo (ISO, UTC). */
  fecha: string;
  asunto: string;
  /** Asunto sin el prefijo "Video aprobado:". */
  titulo: string;
  archivo: string;
  attachmentId: string;
  bytes: number;
}

async function tokenDeAcceso(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: limpiar(process.env.GMAIL_CLIENT_ID),
      client_secret: limpiar(process.env.GMAIL_CLIENT_SECRET),
      refresh_token: limpiar(process.env.GMAIL_REFRESH_TOKEN),
      grant_type: 'refresh_token',
    }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) {
    throw new Error(`Google rechazó el acceso al correo (${j.error ?? res.status}${j.error_description ? `: ${j.error_description}` : ''})`);
  }
  return String(j.access_token);
}

async function gmail(token: string, ruta: string): Promise<any> {
  const res = await fetch(`${API}${ruta}`, { headers: { Authorization: `Bearer ${token}` } });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Gmail ${res.status}: ${j.error?.message ?? 'error'}`);
  return j;
}

/** Todas las partes (y subpartes) del mensaje. */
function partes(p: any, salida: any[] = []): any[] {
  if (!p) return salida;
  salida.push(p);
  for (const hijo of p.parts ?? []) partes(hijo, salida);
  return salida;
}

const cabecera = (msg: any, nombre: string): string =>
  String((msg.payload?.headers ?? []).find((h: any) => String(h.name).toLowerCase() === nombre.toLowerCase())?.value ?? '');

/** Correos ENVIADOS desde tu propia cuenta, con asunto "Video aprobado…" y un mp4 adjunto. El más reciente primero. */
export async function buscarCorreosConVideo(dias = 3): Promise<CorreoConVideo[]> {
  const token = await tokenDeAcceso();
  const q = `in:sent subject:"Video aprobado" has:attachment filename:mp4 newer_than:${dias}d`;
  const lista = await gmail(token, `/messages?q=${encodeURIComponent(q)}&maxResults=5`);
  const salida: CorreoConVideo[] = [];
  for (const m of lista.messages ?? []) {
    const msg = await gmail(token, `/messages/${m.id}?format=full`);
    if (!(msg.labelIds ?? []).includes('SENT')) continue; // no fue enviado desde esta cuenta: se ignora
    const adjunto = partes(msg.payload).find(p => /\.mp4$/i.test(String(p.filename ?? '')) && p.body?.attachmentId);
    if (!adjunto) continue;
    const asunto = cabecera(msg, 'Subject').trim();
    salida.push({
      messageId: String(msg.id),
      fecha: new Date(Number(msg.internalDate)).toISOString(),
      asunto,
      titulo: asunto.replace(/^\s*video aprobado\s*:\s*/i, '').trim() || asunto,
      archivo: String(adjunto.filename),
      attachmentId: String(adjunto.body.attachmentId),
      bytes: Number(adjunto.body.size ?? 0),
    });
  }
  return salida.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Descarga el mp4 adjunto y comprueba que de verdad sea un video MP4 de tamaño razonable. */
export async function descargarVideo(c: CorreoConVideo): Promise<Buffer> {
  if (c.bytes > MAX_BYTES_VIDEO) throw new Error(`El video pesa ${(c.bytes / 1048576).toFixed(1)} MB; el máximo es ${MAX_BYTES_VIDEO / 1048576} MB`);
  const token = await tokenDeAcceso();
  const j = await gmail(token, `/messages/${c.messageId}/attachments/${c.attachmentId}`);
  const datos = Buffer.from(String(j.data ?? '').replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  if (datos.length < 100_000) throw new Error('El adjunto es demasiado pequeño para ser un video');
  if (datos.length > MAX_BYTES_VIDEO) throw new Error('El adjunto supera el tamaño máximo');
  if (datos.subarray(4, 8).toString('latin1') !== 'ftyp') throw new Error('El adjunto no es un archivo MP4 válido');
  return datos;
}
