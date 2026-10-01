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
} from 'firebase/firestore';
import { db } from './firebase';
import { FruitItem, FirestoreOrder, FirestoreOrderItem, OrderStatus, UserProfile, UserRole } from '../types';

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
