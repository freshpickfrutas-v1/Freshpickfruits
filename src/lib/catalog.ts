import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FRUITS_DATA } from '../data/mockData';
import { FruitItem } from '../types';

type CatalogDoc = FruitItem & { sortOrder?: number };

const position = (f: CatalogDoc) => {
  if (typeof f.sortOrder === 'number') return f.sortOrder;
  const i = FRUITS_DATA.findIndex(x => x.id === f.id);
  return i >= 0 ? i : 1000;
};

/**
 * Products shown in the store. They come from Firestore (what the team manages in /admin → Productos);
 * until that collection has data, or if it cannot be read, the built-in catalog is used so the store never goes empty.
 */
export function useCatalog(): FruitItem[] {
  const [items, setItems] = useState<FruitItem[]>(FRUITS_DATA);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      snap => {
        if (snap.empty) { setItems(FRUITS_DATA); return; }
        const list = snap.docs.map(d => ({ ...(d.data() as CatalogDoc), id: d.id }));
        list.sort((a, b) => position(a) - position(b) || a.name.localeCompare(b.name));
        setItems(list);
      },
      () => setItems(FRUITS_DATA)
    );
    return unsub;
  }, []);

  return items;
}

/** Admin only (firestore.rules): copies the built-in catalog into Firestore, keeping each product's id and order. */
export async function importCatalog(): Promise<number> {
  const now = new Date().toISOString();
  let n = 0;
  for (const fruit of FRUITS_DATA) {
    await setDoc(doc(db, 'products', fruit.id), { ...fruit, sortOrder: n, createdAt: now, updatedAt: now }, { merge: true });
    n++;
  }
  return n;
}
