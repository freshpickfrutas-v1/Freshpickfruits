// Capa de datos Firestore para los paneles de admin y cliente.
//
// Las reglas de acceso están en firestore.rules (login con Google + roles del equipo).
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import { BillingData, FruitItem, FirestoreOrder, FirestoreOrderItem, OrderHistoryEntry, OrderStatus, PaymentRecord, UserProfile, UserRole } from '../types';

// ---------- Productos ----------

export type ProductDoc = FruitItem & { createdAt?: string; updatedAt?: string };

const productsCol = collection(db, 'products');

export function subscribeProducts(
  onChange: (products: ProductDoc[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(productsCol, orderBy('name', 'asc'));
  return onSnapshot(
    q,
    snap => {
      const items = snap.docs.map(d => ({ ...(d.data() as ProductDoc), id: d.id }));
      onChange(items);
    },
    err => onError?.(err as Error)
  );
}

export async function addProduct(product: Omit<ProductDoc, 'id'>) {
  return addDoc(productsCol, {
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateProduct(id: string, changes: Partial<ProductDoc>) {
  return updateDoc(doc(db, 'products', id), {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProduct(id: string) {
  return deleteDoc(doc(db, 'products', id));
}

export async function setProductStock(id: string, inStock: boolean) {
  return updateProduct(id, { inStock });
}

// ---------- Pedidos ----------

const ordersCol = collection(db, 'orders');

export interface NewOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingComplement?: string;
  shippingLat?: number;
  shippingLng?: number;
  shippingMapsUrl?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  notes?: string;
  packaging?: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  userId?: string;
  billing?: BillingData;
}

function makeOrderNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FP-${year}-${rand}`;
}

export async function createOrder(input: NewOrderInput) {
  const orderNumber = makeOrderNumber();
  const payload = {
    orderNumber,
    userId: input.userId || null,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: input.shippingAddress,
    shippingCity: input.shippingCity,
    deliveryDate: input.deliveryDate || '',
    deliveryTimeSlot: input.deliveryTimeSlot || '',
    notes: input.notes || '',
    packaging: input.packaging || '',
    items: input.items,
    total: input.total,
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    paymentMethod: input.paymentMethod,
    status: 'pendiente' as OrderStatus,
    createdAt: new Date().toISOString(),
    paymentStatus: 'pendiente' as const,
    invoiceStatus: 'pendiente' as const,
    // Firestore rejects undefined, so optional data is only written when present.
    ...(input.billing ? { billing: input.billing } : {}),
    ...(input.shippingComplement ? { shippingComplement: input.shippingComplement } : {}),
    ...(typeof input.shippingLat === 'number' && typeof input.shippingLng === 'number'
      ? { shippingLat: input.shippingLat, shippingLng: input.shippingLng } : {}),
    ...(input.shippingMapsUrl ? { shippingMapsUrl: input.shippingMapsUrl } : {}),
  };
  const ref = await addDoc(ordersCol, payload);
  return { id: ref.id, orderNumber };
}

export function subscribeAllOrders(
  onChange: (orders: FirestoreOrder[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(ordersCol, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snap => {
      const items = snap.docs.map(d => ({ ...(d.data() as FirestoreOrder), id: d.id }));
      onChange(items);
    },
    err => onError?.(err as Error)
  );
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return updateDoc(doc(db, 'orders', id), { status });
}

export type OrderActionKey =
  | 'confirmar_pago' | 'iniciar_alistamiento' | 'marcar_empacado' | 'despachar'
  | 'entregar' | 'cerrar' | 'cancelar' | 'registrar_factura' | 'editar_pago' | 'fecha_despacho';

const ACTION_RESULT: Record<Exclude<OrderActionKey, 'registrar_factura' | 'editar_pago' | 'fecha_despacho'>, OrderStatus> = {
  confirmar_pago: 'pago_verificado',
  iniciar_alistamiento: 'en_proceso',
  marcar_empacado: 'empacado',
  despachar: 'en_ruta',
  entregar: 'entregado',
  cerrar: 'cerrado',
  cancelar: 'cancelado',
};

export interface OrderActionData {
  invoice?: { number: string; url: string };
  payment?: { reference: string; transactionId: string; method: string; amount: number; approvedAt: string };
  dispatchDate?: string;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Checks a manual payment capture and turns it into the record saved on the order. */
function buildPayment(p: NonNullable<OrderActionData['payment']>, by: string): PaymentRecord {
  if (!p.method) throw new Error('Elige el método de pago.');
  if (!p.reference.trim()) throw new Error('Escribe la referencia del pago.');
  if (!p.transactionId.trim()) throw new Error('Escribe el ID de la transacción o el número del comprobante.');
  if (!Number.isFinite(p.amount) || p.amount <= 0) throw new Error('El valor cobrado debe ser mayor que cero.');
  if (!p.approvedAt || Number.isNaN(Date.parse(p.approvedAt))) throw new Error('Indica la fecha de aprobación del pago.');
  return {
    reference: p.reference.trim(),
    transactionId: p.transactionId.trim(),
    method: p.method,
    amount: Math.round(p.amount),
    approvedAt: new Date(p.approvedAt).toISOString(),
    source: 'manual',
    recordedBy: by,
  };
}

/** Applies one step of the order flow and records who did it and when. */
export async function applyOrderAction(
  order: FirestoreOrder,
  action: OrderActionKey,
  by: string,
  data: OrderActionData = {}
) {
  const at = new Date().toISOString();
  const ref = doc(db, 'orders', order.id);

  if (action === 'registrar_factura') {
    const invoice = data.invoice;
    if (!invoice?.number.trim()) throw new Error('Escribe el número de la factura.');
    const entry: OrderHistoryEntry = { status: 'factura', at, by, note: invoice.number.trim() };
    return updateDoc(ref, {
      invoiceStatus: 'emitida',
      invoiceNumber: invoice.number.trim(),
      invoiceUrl: invoice.url.trim(),
      history: arrayUnion(entry),
    });
  }

  if (action === 'editar_pago') {
    if (!data.payment) throw new Error('Completa los datos del pago.');
    const payment = buildPayment(data.payment, by);
    const entry: OrderHistoryEntry = { status: 'pago', at, by, note: `${payment.method} · ${payment.transactionId}` };
    return updateDoc(ref, { payment: { ...payment, source: order.payment?.source ?? 'manual' }, history: arrayUnion(entry) });
  }

  if (action === 'fecha_despacho') {
    if (!data.dispatchDate) throw new Error('Elige la fecha de despacho.');
    const entry: OrderHistoryEntry = { status: 'despacho', at, by, note: data.dispatchDate };
    return updateDoc(ref, { dispatchDate: data.dispatchDate, history: arrayUnion(entry) });
  }

  if (action === 'cerrar' && order.invoiceStatus !== 'emitida') {
    throw new Error('No se puede cerrar la venta sin factura electrónica registrada.');
  }

  const status = ACTION_RESULT[action];
  const entry: OrderHistoryEntry = { status, at, by };
  const changes: Record<string, unknown> = { status, history: arrayUnion(entry) };

  if (action === 'confirmar_pago') {
    if (!data.payment) throw new Error('Registra los datos del pago antes de confirmarlo.');
    const payment = buildPayment(data.payment, by);
    Object.assign(changes, { paymentStatus: 'verificado', paymentVerifiedAt: at, paymentVerifiedBy: by, payment });
    if (data.dispatchDate) changes.dispatchDate = data.dispatchDate;
  }
  if (action === 'despachar') {
    changes.dispatchedAt = at;
    if (!order.dispatchDate) changes.dispatchDate = today();
  }
  if (action === 'entregar') changes.deliveredAt = at;

  return updateDoc(ref, changes);
}

/** Orders of the signed-in customer: linked to their account, or placed as a guest with the same verified email. */
export async function findMyOrders(who: { uid: string; email?: string | null }) {
  const results = new Map<string, FirestoreOrder>();
  const queries = [query(ordersCol, where('userId', '==', who.uid))];
  if (who.email) queries.push(query(ordersCol, where('customerEmail', '==', who.email)));
  for (const q of queries) {
    const snap = await getDocs(q);
    snap.forEach(d => results.set(d.id, { ...(d.data() as FirestoreOrder), id: d.id }));
  }
  return [...results.values()].sort((x, y) => (x.createdAt < y.createdAt ? 1 : -1));
}

// ---------- Clientes / usuarios ----------

const usersCol = collection(db, 'users');

export function subscribeUsers(
  onChange: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    usersCol,
    snap => {
      const items = snap.docs.map(d => ({ ...(d.data() as UserProfile), uid: d.id }));
      onChange(items);
    },
    err => onError?.(err as Error)
  );
}

/** Admin only (enforced by firestore.rules): changes a person's role. */
export async function setUserRole(uid: string, role: UserRole) {
  return updateDoc(doc(db, 'users', uid), { role });
}
