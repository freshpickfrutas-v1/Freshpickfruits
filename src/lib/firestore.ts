// Capa de datos Firestore para los paneles de admin y cliente.
//
// MODO PRUEBAS: estas funciones asumen reglas de Firestore permisivas
// (ver firestore.rules) porque todavía no hay login. Cuando se agregue
// autenticación, hay que:
//   1. Volver a apretar firestore.rules (quitar el bloque "MODO PRUEBAS").
//   2. Reemplazar los lookups por teléfono/email en el panel de cliente
//      por el uid real del usuario autenticado.
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
import { FruitItem, FirestoreOrder, FirestoreOrderItem, OrderStatus, UserProfile } from '../types';

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

// Modo pruebas (sin login): busca pedidos por teléfono o email exacto.
export async function findOrdersByContact(contact: { phone?: string; email?: string }) {
  const results: FirestoreOrder[] = [];
  if (contact.phone) {
    const q1 = query(ordersCol, where('customerPhone', '==', contact.phone));
    const snap1 = await getDocs(q1);
    snap1.forEach(d => results.push({ ...(d.data() as FirestoreOrder), id: d.id }));
  }
  if (contact.email) {
    const q2 = query(ordersCol, where('customerEmail', '==', contact.email));
    const snap2 = await getDocs(q2);
    snap2.forEach(d => {
      if (!results.some(r => r.id === d.id)) results.push({ ...(d.data() as FirestoreOrder), id: d.id });
    });
  }
  results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return results;
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
