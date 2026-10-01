// Order flow: stages, who is responsible at each one, and what each role may do.
// Rules live here (client side). firestore.rules only checks "is team member" for now.
import { FirestoreOrder, OrderStatus, UserRole } from '../types';

export interface Stage {
  id: OrderStatus;
  step: number;
  label: string;
  short: string;
  /** Role that has to act next while an order sits in this stage. */
  owner: UserRole;
  ownerLabel: string;
  tone: string;
}

/** The 7 stages, left to right. */
export const STAGES: Stage[] = [
  { id: 'pendiente', step: 1, label: 'Recibido / por confirmar', short: 'Recibido', owner: 'finanzas', ownerLabel: 'Finanzas / Tesorería', tone: 'bg-sky-100 text-sky-800' },
  { id: 'pago_verificado', step: 2, label: 'Pago verificado', short: 'Pago verificado', owner: 'poscosecha', ownerLabel: 'Poscosecha', tone: 'bg-emerald-100 text-emerald-800' },
  { id: 'en_proceso', step: 3, label: 'Poscosecha y facturación', short: 'En proceso', owner: 'poscosecha', ownerLabel: 'Poscosecha + Contabilidad', tone: 'bg-amber-100 text-amber-800' },
  { id: 'empacado', step: 4, label: 'Empacado / por despachar', short: 'Empacado', owner: 'asistente', ownerLabel: 'Asistente todero', tone: 'bg-orange-100 text-orange-800' },
  { id: 'en_ruta', step: 5, label: 'En ruta', short: 'En ruta', owner: 'domiciliario', ownerLabel: 'Domiciliario', tone: 'bg-violet-100 text-violet-800' },
  { id: 'entregado', step: 6, label: 'Entregado', short: 'Entregado', owner: 'contabilidad', ownerLabel: 'Auxiliar contable', tone: 'bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]' },
  { id: 'cerrado', step: 7, label: 'Factura emitida y cierre', short: 'Cerrado', owner: 'admin', ownerLabel: 'Completado', tone: 'bg-stone-200 text-stone-700' },
];

export const CANCELLED: Stage = {
  id: 'cancelado', step: 0, label: 'Cancelado', short: 'Cancelado', owner: 'admin', ownerLabel: '—', tone: 'bg-red-100 text-red-800',
};

/** Orders saved before this flow existed used other ids; they map onto the new stages. */
const LEGACY: Record<string, OrderStatus> = {
  confirmado: 'pago_verificado',
  cosechando: 'en_proceso',
  en_camino: 'en_ruta',
};

export function normalizeStatus(status: string): OrderStatus {
  return (LEGACY[status] ?? status) as OrderStatus;
}

export function stageOf(order: Pick<FirestoreOrder, 'status'>): Stage {
  const id = normalizeStatus(order.status);
  return STAGES.find(s => s.id === id) ?? (id === 'cancelado' ? CANCELLED : STAGES[0]);
}

export interface FlowAction {
  key: string;
  label: string;
  /** Roles that can do it (admin can always). */
  roles: UserRole[];
  /** Why it is blocked right now, if it is. */
  blocked?: string;
}

/** Actions available for an order in its current stage. */
export function actionsFor(order: FirestoreOrder): FlowAction[] {
  const status = normalizeStatus(order.status);
  const invoiced = order.invoiceStatus === 'emitida';
  switch (status) {
    case 'pendiente':
      return [
        { key: 'confirmar_pago', label: 'Confirmar pago', roles: ['finanzas'] },
        { key: 'cancelar', label: 'Cancelar pedido', roles: ['finanzas', 'asistente'] },
      ];
    case 'pago_verificado':
      return [{ key: 'iniciar_alistamiento', label: 'Iniciar alistamiento', roles: ['poscosecha'] }];
    case 'en_proceso':
      return [
        { key: 'marcar_empacado', label: 'Marcar empacado', roles: ['poscosecha'] },
        { key: 'registrar_factura', label: invoiced ? 'Editar factura' : 'Registrar factura', roles: ['contabilidad'] },
      ];
    case 'empacado':
      return [
        { key: 'despachar', label: 'Despachar (en ruta)', roles: ['asistente', 'contabilidad'] },
        { key: 'registrar_factura', label: invoiced ? 'Editar factura' : 'Registrar factura', roles: ['contabilidad'] },
      ];
    case 'en_ruta':
      return [
        { key: 'entregar', label: 'Confirmar entrega', roles: ['domiciliario', 'asistente'] },
        { key: 'registrar_factura', label: invoiced ? 'Editar factura' : 'Registrar factura', roles: ['contabilidad'] },
      ];
    case 'entregado':
      return [
        { key: 'registrar_factura', label: invoiced ? 'Editar factura' : 'Registrar factura', roles: ['contabilidad'] },
        { key: 'cerrar', label: 'Cerrar venta', roles: ['contabilidad'], blocked: invoiced ? undefined : 'Falta registrar la factura electrónica.' },
      ];
    default:
      return [];
  }
}

export function canDo(role: UserRole | null, action: FlowAction): boolean {
  return role === 'admin' || (role !== null && action.roles.includes(role));
}

/** True when the order is waiting on something this role has to do. */
export function isMine(order: FirestoreOrder, role: UserRole | null): boolean {
  if (!role) return false;
  return actionsFor(order).some(a => a.key !== 'cancelar' && canDo(role, a) && !a.blocked && !(a.key === 'registrar_factura' && order.invoiceStatus === 'emitida'));
}

export function billingLabel(order: FirestoreOrder): string {
  const b = order.billing;
  if (!b?.document) return 'Sin datos';
  return b.type === 'empresa' ? `NIT ${b.document}${b.dv ? '-' + b.dv : ''}` : `CC ${b.document}`;
}

export function invoiceLabel(order: FirestoreOrder): string {
  return order.invoiceStatus === 'emitida'
    ? `Emitida${order.invoiceNumber ? ' · ' + order.invoiceNumber : ''}`
    : `Pendiente (${order.billing?.type === 'empresa' ? 'NIT' : 'Cédula'})`;
}

export function whatsappLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const full = digits.startsWith('57') ? digits : `57${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

/** Message 1 / 2 / 3 from the protocol, ready to send by hand until the WhatsApp API is connected. */
export function messageFor(order: FirestoreOrder): { title: string; text: string } | null {
  const status = normalizeStatus(order.status);
  const name = order.customerName.split(' ')[0] || 'cliente';
  const num = order.orderNumber;
  if (status === 'pago_verificado' || status === 'en_proceso') {
    const doc = billingLabel(order);
    return {
      title: 'Confirmación de pago y datos de factura',
      text: `¡Hola, ${name}! 🌿 Confirmamos el pago de tu pedido #${num} de Arándanos Premium.\nPasamos tu orden a poscosecha para alistar tus estuches y a contabilidad para la emisión de tu documento fiscal.\n🔍 Datos de facturación registrados: ${doc}. Si necesitas ajustarlos, respóndenos a este mensaje.`,
    };
  }
  if (status === 'en_ruta') {
    return {
      title: 'Despacho y entrega',
      text: `¡Tu pedido está listo! 📦🚴‍♂️\nHola ${name}, tus arándanos ya están en manos de nuestro domiciliario.\nEntrega programada: ${order.deliveryDate || 'hoy'} en el horario acordado.\nDirección: ${order.shippingAddress}.\nPor favor asegúrate de que alguien pueda recibir el paquete. ¡Que los disfrutes!`,
    };
  }
  if (status === 'entregado' || status === 'cerrado') {
    const link = order.invoiceUrl ? `\n🔗 ${order.invoiceUrl}` : '';
    return {
      title: 'Factura electrónica y cierre',
      text: `¡Hola ${name}! 📄 Tu pedido #${num} ha sido completado y entregado.${order.invoiceUrl ? '\nAdjuntamos el enlace para ver y descargar tu Factura Electrónica:' + link : ''}\n⭐ ¿Nos regalas 30 segundos? Queremos saber si la fruta y la entrega cumplieron tus expectativas.`,
    };
  }
  return null;
}
