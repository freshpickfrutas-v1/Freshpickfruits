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
import { BillingData, FruitItem, FirestoreOrder, FirestoreOrderItem, OrderHistoryEntry, OrderStatus, UserProfile, UserRole } from '../types';

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
    // Firestore rejects undefined, so billing is only written when there is data.
    ...(input.billing ? { billing: input.billing } : {}),
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
  | 'entregar' | 'cerrar' | 'cancelar' | 'registrar_factura';

const ACTION_RESULT: Record<Exclude<OrderActionKey, 'registrar_factura'>, OrderStatus> = {
  confirmar_pago: 'pago_verificado',
  iniciar_alistamiento: 'en_proceso',
  marcar_empacado: 'empacado',
  despachar: 'en_ruta',
  entregar: 'entregado',
  cerrar: 'cerrado',
  cancelar: 'cancelado',
};

/** Applies one step of the order flow and records who did it and when. */
export async function applyOrderAction(
  order: FirestoreOrder,
  action: OrderActionKey,
  by: string,
  invoice?: { number: string; url: string }
) {
  const at = new Date().toISOString();
  const ref = doc(db, 'orders', order.id);
  if (action === 'registrar_factura') {
    if (!invoice?.number.trim()) throw new Error('Escribe el número de la factura.');
    const entry: OrderHistoryEntry = { status: 'factura', at, by, note: invoice.number.trim() };
    return updateDoc(ref, {
      invoiceStatus: 'emitida',
      invoiceNumber: invoice.number.trim(),
      invoiceUrl: invoice.url.trim(),
      history: arrayUnion(entry),
    });
  }
  if (action === 'cerrar' && order.invoiceStatus !== 'emitida') {
    throw new Error('No se puede cerrar la venta sin factura electrónica registrada.');
  }
  const status = ACTION_RESULT[action];
  const entry: OrderHistoryEntry = { status, at, by };
  return updateDoc(ref, {
    status,
    history: arrayUnion(entry),
    ...(action === 'confirmar_pago' ? { paymentStatus: 'verificado', paymentVerifiedAt: at, paymentVerifiedBy: by } : {}),
  });
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
