// Avisos de pedido y pago: a los departamentos del equipo y al cliente, por correo y WhatsApp.
// Cada intento queda anotado en el pedido (campo `notifications`) con fecha, canal, destinatario y resultado.
import { FieldValue } from 'firebase-admin/firestore';
import type { DocumentReference } from 'firebase-admin/firestore';
import {
  sendOrderReceived, sendPaymentConfirmed, sendPaymentFailed, sendTeamAlert, orderSummaryLines,
} from './email.js';
import { sendWhatsAppTemplate, WHATSAPP_TEMPLATES } from './whatsapp.js';

export type TeamEvent = 'pedido_nuevo' | 'pago_aprobado' | 'pago_rechazado';
const ALL_EVENTS: TeamEvent[] = ['pedido_nuevo', 'pago_aprobado', 'pago_rechazado'];

export interface Team { nombre: string; emails: string[]; whatsapp: string[]; eventos: TeamEvent[] }

/**
 * Departamentos que reciben los avisos. Se definen en la variable NOTIFY_TEAMS (JSON), por ejemplo:
 * [{"nombre":"Finanzas","emails":["finanzas@x.com"],"whatsapp":["3001234567"],"eventos":["pedido_nuevo","pago_aprobado","pago_rechazado"]}]
 * Sin ella: un solo grupo con EMAIL_TEAM (o freshpickfruits@gmail.com) y WHATSAPP_TEAM_NUMBERS.
 */
export function teams(): Team[] {
  const raw = process.env.NOTIFY_TEAMS?.trim();
  if (raw) {
    try {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.map((t: any) => ({
          nombre: String(t?.nombre ?? 'Equipo'),
          emails: [].concat(t?.emails ?? []).map(String),
          whatsapp: [].concat(t?.whatsapp ?? []).map(String),
          eventos: Array.isArray(t?.eventos) ? t.eventos.filter((e: any) => ALL_EVENTS.includes(e)) : ALL_EVENTS,
        }));
      }
    } catch (e) {
      console.error('notify: NOTIFY_TEAMS no es un JSON válido', e);
    }
  }
  const split = (v?: string) => (v ?? '').split(',').map(s => s.trim()).filter(Boolean);
  return [{
    nombre: 'Equipo',
    emails: split(process.env.EMAIL_TEAM?.trim() || 'freshpickfruits@gmail.com'),
    whatsapp: split(process.env.WHATSAPP_TEAM_NUMBERS),
    eventos: ALL_EVENTS,
  }];
}

/** Ejecuta un envío y lo anota en el pedido. Un fallo nunca interrumpe el flujo del pago. */
async function track(ref: DocumentReference, channel: 'correo' | 'whatsapp', kind: string, to: string, send: () => Promise<'sent' | 'skipped'>) {
  let ok = true;
  let error: string | undefined;
  try {
    if ((await send()) === 'skipped') return;
  } catch (e) {
    ok = false;
    error = String(e instanceof Error ? e.message : e).slice(0, 200);
    console.error(`notify: ${channel} ${kind} → ${to}`, e);
  }
  try {
    await ref.update({ notifications: FieldValue.arrayUnion({ channel, kind, to, at: new Date().toISOString(), ok, ...(error ? { error } : {}) }) });
  } catch (e) {
    console.error('notify: no se pudo anotar el aviso', e);
  }
}

const TITLES: Record<TeamEvent, (n: string) => string> = {
  pedido_nuevo: n => `Pedido nuevo · ${n}`,
  pago_aprobado: n => `Pago aprobado · ${n}`,
  pago_rechazado: n => `Pago RECHAZADO · ${n}`,
};

/** Avisa a cada departamento interesado en este evento (correo y WhatsApp). */
export async function notifyTeams(ref: DocumentReference, event: TeamEvent, order: Record<string, any>, extra: string[] = []) {
  const subject = TITLES[event](String(order.orderNumber ?? ''));
  const lines = [...orderSummaryLines(order), ...extra];
  for (const team of teams().filter(t => t.eventos.includes(event))) {
    if (team.emails.length) await track(ref, 'correo', event, `${team.nombre}: ${team.emails.join(', ')}`, () => sendTeamAlert(subject, lines, team.emails));
    for (const number of team.whatsapp) {
      await track(ref, 'whatsapp', event, `${team.nombre}: ${number}`, () => sendWhatsAppTemplate(number, WHATSAPP_TEMPLATES.equipo, [subject, lines.join(' | ')]));
    }
  }
}

const cop = (n: number) => `$${Number(n).toLocaleString('es-CO')} COP`;

/** Avisa al cliente por correo y WhatsApp: pedido recibido, pago confirmado o pago no logrado. */
export async function notifyCustomer(ref: DocumentReference, kind: 'pedido_recibido' | 'pago_confirmado' | 'pago_rechazado', order: Record<string, any>, extra: { amount?: number; paymentId?: string } = {}) {
  const email = String(order.customerEmail ?? '').trim() || 'sin correo';
  const params = [order.customerName, order.orderNumber, cop(extra.amount ?? Number(order.total))];
  if (kind === 'pedido_recibido') {
    await track(ref, 'correo', kind, email, () => sendOrderReceived(order));
    await track(ref, 'whatsapp', kind, String(order.customerPhone ?? ''), () => sendWhatsAppTemplate(order.customerPhone, WHATSAPP_TEMPLATES.pedidoRecibido, params));
  } else if (kind === 'pago_confirmado') {
    await track(ref, 'correo', kind, email, () => sendPaymentConfirmed(order, extra.amount ?? Number(order.total)));
    await track(ref, 'whatsapp', kind, String(order.customerPhone ?? ''), () => sendWhatsAppTemplate(order.customerPhone, WHATSAPP_TEMPLATES.pagoConfirmado, params));
  } else {
    await track(ref, 'correo', kind, email, () => sendPaymentFailed(order, extra.paymentId ?? ''));
    await track(ref, 'whatsapp', kind, String(order.customerPhone ?? ''), () => sendWhatsAppTemplate(order.customerPhone, WHATSAPP_TEMPLATES.pagoRechazado, params));
  }
}
