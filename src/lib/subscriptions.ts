// Subscriptions: a customer asks for a plan, the team activates it and manages pauses and cancellations.
// Collection: /subscriptions (see firestore.rules).
import {
  addDoc, arrayUnion, collection, doc, onSnapshot, orderBy, query, updateDoc, where,
} from 'firebase/firestore';
import { db } from './firebase';
import { SavedAddress, SubscriptionDoc, SubscriptionHistoryEntry, SubscriptionPlan, SubscriptionStatus, UserRole } from '../types';

const col = collection(db, 'subscriptions');

export function subscribeAllSubscriptions(onChange: (items: SubscriptionDoc[]) => void, onError?: (err: Error) => void) {
  return onSnapshot(
    query(col, orderBy('createdAt', 'desc')),
    snap => onChange(snap.docs.map(d => ({ ...(d.data() as SubscriptionDoc), id: d.id }))),
    err => onError?.(err as Error)
  );
}

export function subscribeMySubscriptions(uid: string, onChange: (items: SubscriptionDoc[]) => void, onError?: (err: Error) => void) {
  return onSnapshot(
    query(col, where('userId', '==', uid)),
    snap => {
      const items = snap.docs.map(d => ({ ...(d.data() as SubscriptionDoc), id: d.id }));
      items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      onChange(items);
    },
    err => onError?.(err as Error)
  );
}

/** A signed-in customer asks for a plan. The team activates it afterwards. */
export async function requestSubscription(
  who: { uid: string; email: string | null; name: string },
  plan: SubscriptionPlan,
  address?: SavedAddress
) {
  const at = new Date().toISOString();
  const entry: SubscriptionHistoryEntry = { action: 'solicitada', at, by: who.email ?? who.uid };
  return addDoc(col, {
    userId: who.uid,
    customerName: address?.recipientName || who.name,
    customerEmail: who.email ?? '',
    customerPhone: address?.phone ?? '',
    planId: plan.id,
    planTitle: plan.title,
    planWeight: plan.weight,
    deliveryFrequency: plan.deliveryFrequency,
    priceMonth: plan.priceMonth,
    shippingAddress: address?.address ?? '',
    shippingCity: address?.city ?? '',
    status: 'solicitada' as SubscriptionStatus,
    createdAt: at,
    notes: '',
    customerRequest: '',
    history: [entry],
  });
}

/** Customer asks to pause or cancel; the team applies it. Only these two fields can be changed by the customer (rules). */
export function requestChange(id: string, request: 'pausar' | 'cancelar' | '') {
  return updateDoc(doc(db, 'subscriptions', id), { customerRequest: request, customerRequestAt: new Date().toISOString() });
}

export type SubscriptionActionKey = 'activar' | 'pausar' | 'reanudar' | 'cancelar' | 'fecha' | 'notas';

export const SUB_STATUS: Record<SubscriptionStatus, { label: string; tone: string }> = {
  solicitada: { label: 'Solicitada', tone: 'bg-sky-100 text-sky-800' },
  activa: { label: 'Activa', tone: 'bg-emerald-100 text-emerald-800' },
  pausada: { label: 'Pausada', tone: 'bg-amber-100 text-amber-800' },
  cancelada: { label: 'Cancelada', tone: 'bg-red-100 text-red-800' },
};

/** Roles that can change a subscription (admin always). Accounting can only look. */
export const SUB_MANAGERS: UserRole[] = ['admin', 'finanzas', 'asistente'];

/** The next Tuesday after today, as YYYY-MM-DD (deliveries are Tuesdays and Wednesdays). */
export function nextTuesday(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + ((9 - d.getDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

export function applySubscriptionAction(
  sub: SubscriptionDoc,
  action: SubscriptionActionKey,
  by: string,
  data: { date?: string; notes?: string } = {}
) {
  const at = new Date().toISOString();
  const ref = doc(db, 'subscriptions', sub.id);
  const history = (note?: string): { history: ReturnType<typeof arrayUnion> } => ({
    history: arrayUnion({ action, at, by, ...(note ? { note } : {}) } satisfies SubscriptionHistoryEntry),
  });
  switch (action) {
    case 'activar':
      if (!data.date) throw new Error('Elige la fecha de la primera entrega.');
      return updateDoc(ref, { status: 'activa', startDate: at.slice(0, 10), nextDelivery: data.date, customerRequest: '', ...history(data.date) });
    case 'reanudar':
      if (!data.date) throw new Error('Elige la fecha de la próxima entrega.');
      return updateDoc(ref, { status: 'activa', nextDelivery: data.date, customerRequest: '', ...history(data.date) });
    case 'pausar':
      return updateDoc(ref, { status: 'pausada', customerRequest: '', ...history() });
    case 'cancelar':
      return updateDoc(ref, { status: 'cancelada', nextDelivery: '', customerRequest: '', ...history() });
    case 'fecha':
      if (!data.date) throw new Error('Elige la fecha.');
      return updateDoc(ref, { nextDelivery: data.date, ...history(data.date) });
    case 'notas':
      return updateDoc(ref, { notes: data.notes ?? '' });
  }
}
