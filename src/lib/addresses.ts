import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SavedAddress } from '../types';

export const MAX_ADDRESSES = 10;

export function newAddressId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `addr-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Saves the whole address list inside the person's own profile (firestore.rules let the owner edit it). */
export function saveAddresses(uid: string, addresses: SavedAddress[]) {
  return updateDoc(doc(db, 'users', uid), { addresses });
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** True when this street address + city is already saved, so it is not stored twice. */
export function hasAddress(list: SavedAddress[], address: string, city: string): boolean {
  return list.some(a => norm(a.address) === norm(address) && norm(a.city) === norm(city));
}
