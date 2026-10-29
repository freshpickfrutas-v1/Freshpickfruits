// Business rules shared by the cart and the order form: stock caps per order, delivery fee, online-payment commission and delivery dates.

/** Maximum cases per order, by case size in grams. */
export const MAX_UNITS_BY_STEP: Record<number, number> = { 125: 80, 250: 40, 500: 20 };

export function maxUnitsFor(step: number): number {
  return MAX_UNITS_BY_STEP[step] ?? 20;
}

/** Delivery fee: always $7.000 COP, whatever the payment method. There is no free shipping. */
export const SHIPPING_FEE = 7000;

/** Payment-gateway commission passed on to the customer for online payments. */
export const COMMISSION_RATE = { wompi: 0.05, bold: 0.06 } as const;

export type PayChoice = 'transferencia' | 'tarjeta';

export function onlineCommission(base: number, gateway: keyof typeof COMMISSION_RATE = 'wompi'): number {
  return Math.round(base * COMMISSION_RATE[gateway]);
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Minimum days between placing the order and delivering it. */
export const MIN_DELIVERY_DAYS = 8;

/**
 * Earliest delivery day: 8 days after the first business day on or after the order date (Mon–Fri),
 * moved forward to the next Tuesday or Wednesday (deliveries are only those two days).
 */
export function earliestDeliveryDate(from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + MIN_DELIVERY_DAYS);
  while (d.getDay() !== 2 && d.getDay() !== 3) d.setDate(d.getDate() + 1);
  return iso(d);
}

/** The next `count` delivery days (Tuesdays and Wednesdays) starting at the earliest allowed one. */
export function deliveryOptions(count = 8, from: Date = new Date()): string[] {
  const out: string[] = [];
  const d = new Date(earliestDeliveryDate(from) + 'T12:00:00');
  while (out.length < count) {
    if (d.getDay() === 2 || d.getDay() === 3) out.push(iso(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function formatDeliveryDay(isoDay: string): string {
  return new Date(isoDay + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}
