// Firebase Admin para las funciones de servidor (firma y webhook de Wompi).
// Necesita la variable FIREBASE_SERVICE_ACCOUNT con el JSON de la cuenta de servicio.
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

export function adminDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT');
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  const dbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
  return dbId ? getFirestore(dbId) : getFirestore();
}
