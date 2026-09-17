// Puebla la colección /products en Firestore a partir de src/data/mockData.ts.
//
// Requisitos antes de correr esto:
//   1. Haber desplegado firestore.rules actualizado (firebase deploy --only firestore:rules),
//      porque en modo pruebas "products" necesita "allow write: if true".
//   2. Tener conexión a internet hacia Firebase desde donde se ejecuta.
//
// Uso:
//   npx tsx scripts/seedProducts.ts
//
// Es seguro correrlo varias veces: usa el mismo id que ya tiene cada fruta en
// mockData.ts (setDoc con merge), así que solo actualiza los campos, no duplica.
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { FRUITS_DATA } from '../src/data/mockData';

async function seed() {
  console.log(`Sembrando ${FRUITS_DATA.length} productos en Firestore...`);

  const existingSnap = await getDocs(collection(db, 'products'));
  console.log(`Productos ya existentes en Firestore: ${existingSnap.size}`);

  let count = 0;
  for (const fruit of FRUITS_DATA) {
    const now = new Date().toISOString();
    await setDoc(
      doc(db, 'products', fruit.id),
      { ...fruit, createdAt: now, updatedAt: now },
      { merge: true }
    );
    count++;
    console.log(`  ✓ ${fruit.id} (${count}/${FRUITS_DATA.length})`);
  }

  console.log('Listo. Colección "products" sembrada/actualizada.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error sembrando productos:', err);
  process.exit(1);
});
