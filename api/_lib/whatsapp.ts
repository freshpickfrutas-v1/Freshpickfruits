// WhatsApp Business Cloud API (Meta). Mensajes iniciados por el negocio: solo con plantillas aprobadas por Meta.
// Es opcional: sin WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID no envía nada.

/** Nombres de las plantillas que hay que crear y aprobar en Meta (cada una con los parámetros {{1}}, {{2}}, {{3}} en ese orden). */
export const WHATSAPP_TEMPLATES = {
  /** {{1}} título del aviso, {{2}} detalle del pedido. */
  equipo: process.env.WHATSAPP_TPL_TEAM?.trim() || 'aviso_equipo',
  /** {{1}} nombre del cliente, {{2}} N° de pedido, {{3}} total. */
  pedidoRecibido: process.env.WHATSAPP_TPL_ORDER?.trim() || 'pedido_recibido',
  pagoConfirmado: process.env.WHATSAPP_TPL_PAID?.trim() || 'pago_confirmado',
  pagoRechazado: process.env.WHATSAPP_TPL_FAILED?.trim() || 'pago_rechazado',
};

/** Número colombiano o internacional → solo dígitos con indicativo (57…). Vacío si no parece un celular válido. */
export function toE164(raw: unknown): string {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (/^3\d{9}$/.test(d)) return `57${d}`;
  if (/^57\d{10}$/.test(d)) return d;
  return d.length >= 11 ? d : '';
}

// Meta no admite saltos de línea, tabuladores ni más de 4 espacios seguidos dentro de un parámetro.
const clean = (s: unknown) => String(s ?? '').replace(/[\r\n\t]+/g, ' | ').replace(/ {2,}/g, ' ').trim().slice(0, 900) || '-';

export async function sendWhatsAppTemplate(to: unknown, template: string, params: unknown[]): Promise<'sent' | 'skipped'> {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const number = toE164(to);
  if (!token || !phoneId || !number) return 'skipped';

  const version = process.env.WHATSAPP_API_VERSION?.trim() || 'v23.0';
  const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: number,
      type: 'template',
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG?.trim() || 'es' },
        components: [{ type: 'body', parameters: params.map(p => ({ type: 'text', text: clean(p) })) }],
      },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`WhatsApp ${res.status} ${detail.slice(0, 160)}`);
  }
  return 'sent';
}
