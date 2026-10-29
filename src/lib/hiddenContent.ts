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
export interface CustomVideo {
  id: string;
  seccion: 'recetas' | 'noticias';
  title: string;
  channel: string;
  addedAt: string;
}

let hidden = new Map<string, HiddenItem>();
let customVideos: CustomVideo[] = [];
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
  onSnapshot(
    collection(db, 'customVideos'),
    snap => {
      customVideos = snap.docs.map(d => d.data() as CustomVideo).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
      version++;
      listeners.forEach(l => l());
    },
    () => { /* sin permiso o sin conexión: solo se ven los videos del código */ }
  );
}

/** Videos que el admin agregó pegando un enlace de YouTube. */
export const customVideosFor = (seccion: 'recetas' | 'noticias'): CustomVideo[] => customVideos.filter(v => v.seccion === seccion);
export const allCustomVideos = (): CustomVideo[] => customVideos;

/** ID de 11 caracteres de un enlace de YouTube (watch, youtu.be, shorts, embed) o del ID suelto. */
export function youtubeIdFrom(input: string): string | null {
  const text = input.trim();
  if (/^[\w-]{11}$/.test(text)) return text;
  try {
    const url = new URL(text);
    const host = url.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
    else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Admin only (firestore.rules). */
export async function addCustomVideo(v: Omit<CustomVideo, 'addedAt'>) {
  await setDoc(doc(db, 'customVideos', `${v.seccion}__${v.id}`), { ...v, addedAt: new Date().toISOString() });
}

export async function removeCustomVideo(seccion: string, id: string) {
  await deleteDoc(doc(db, 'customVideos', `${seccion}__${id}`));
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
