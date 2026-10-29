import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Recipes and news live as JSON files in src/content/ and are never deleted by the automation (the library only grows).
// "Eliminar" from the admin panel only hides an item from the site: a document in Firestore (hiddenContent) that can be restored.

export type ContentKind = 'receta' | 'noticia' | 'video';

export interface HiddenItem {
  tipo: ContentKind;
  slug: string;
  title: string;
  hiddenAt: string;
}

const keyOf = (tipo: ContentKind, slug: string) => `${tipo}__${slug}`;
let hidden = new Map<string, HiddenItem>();
let version = 0;
const listeners = new Set<() => void>();
let started = false;

function start() {
  if (started) return;
  started = true;
  onSnapshot(
    collection(db, 'hiddenContent'),
    snap => {
      hidden = new Map(snap.docs.map(d => [d.id, d.data() as HiddenItem]));
      version++;
      listeners.forEach(l => l());
    },
    () => { /* if it cannot be read, everything stays visible */ }
  );
}

/** Changes every time the hidden list changes (for caches). */
export const hiddenVersion = () => version;

export function isHidden(tipo: ContentKind, slug: string): boolean {
  return hidden.has(keyOf(tipo, slug));
}

export function hiddenItems(): HiddenItem[] {
  return [...hidden.values()];
}

/** Subscribes the component to changes of the hidden list; returns a counter that changes whenever it does. */
export function useHiddenContent(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    start();
    const l = () => setVersion(v => v + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return version;
}

/** Admin only (firestore.rules). */
export async function hideContent(tipo: ContentKind, slug: string, title: string) {
  await setDoc(doc(db, 'hiddenContent', keyOf(tipo, slug)), { tipo, slug, title, hiddenAt: new Date().toISOString() });
}

export async function restoreContent(tipo: ContentKind, slug: string) {
  await deleteDoc(doc(db, 'hiddenContent', keyOf(tipo, slug)));
}
