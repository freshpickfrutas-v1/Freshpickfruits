// Recalcula el total de un pedido en el servidor (precios del catálogo, límites, envío y comisión).
// El navegador solo envía qué producto y cuántos estuches; lo que cuesta lo decide este archivo.
import { adminDb } from './admin.js';
import { MAX_UNITS_BY_STEP, SHIPPING_FEE, onlineCommission } from '../../src/lib/pricing.js';

// Respaldo si la colección `products` está vacía o no se puede leer (mismo catálogo base de la tienda).
const BASE_CATALOG: Record<string, { step: number; price: number }> = {
  'arandanos-125g': { step: 125, price: 8000 },
  'arandanos-250g': { step: 250, price: 15000 },
  'arandanos-500g': { step: 500, price: 30000 },
};

export class OrderError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

async function loadCatalog() {
  const catalog = { ...BASE_CATALOG };
  try {
    const snap = await adminDb().collection('products').get();
    snap.forEach(d => {
      const p = d.data();
      const step = Number(p.defaultGramUnit);
      const price = Number(p.standardPrice);
      if (step > 0 && price > 0) catalog[d.id] = { step, price };
    });
  } catch (err) {
    console.error('orderTotal: catálogo', err);
  }
  return catalog;
}

/** Devuelve el total correcto del pedido y, si el guardado difiere, lo corrige en Firestore. */
export async function recalcOrder(orderId: string) {
  const ref = adminDb().collection('orders').doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new OrderError('Pedido no encontrado', 404);
  const order = snap.data()!;
  if (order.paymentStatus === 'verificado' || order.status !== 'pendiente') return { total: Number(order.total), changed: false };

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  // Pedidos antiguos sin detalle por producto: no se pueden recalcular, se conservan como están.
  if (!items.length || items.some(i => typeof i.fruitId !== 'string' || !Number.isInteger(i.units))) {
    return { total: Number(order.total), changed: false };
  }

  const catalog = await loadCatalog();
  const perStep: Record<number, number> = {};
  let grams = 0;
  let subtotal = 0;
  const priced = items.map(i => {
    const p = catalog[i.fruitId];
    if (!p) throw new OrderError('Producto no disponible');
    if (i.units <= 0) throw new OrderError('Cantidad inválida');
    if ((p.step === 125 || p.step === 250) && i.units % 2 !== 0) throw new OrderError('Los estuches de 125 g y 250 g van en múltiplos de 2');
    perStep[p.step] = (perStep[p.step] ?? 0) + i.units;
    grams += i.units * p.step;
    const line = i.units * p.price;
    subtotal += line;
    return { ...i, price: line };
  });
  for (const [step, units] of Object.entries(perStep)) {
    const max = MAX_UNITS_BY_STEP[Number(step)] ?? 20;
    if (units > max) throw new OrderError(`Máximo ${max} estuches de ${step} g por pedido`);
  }
  if (grams < 500) throw new OrderError('El pedido mínimo es de 500 g');

  const deliveryFee = SHIPPING_FEE;
  const commission = order.paymentMethod === 'tarjeta' ? onlineCommission(subtotal + deliveryFee) : 0;
  const total = subtotal + deliveryFee + commission;

  const changed = total !== Number(order.total) || subtotal !== Number(order.subtotal) || deliveryFee !== Number(order.deliveryFee);
  if (changed) {
    console.warn('orderTotal: total corregido', orderId, order.total, '->', total);
    await ref.update({ items: priced, subtotal, deliveryFee, total });
  }
  return { total, changed };
}
