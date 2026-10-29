// POST /api/orders/recalcular  { orderId }
// Tras crear el pedido, el servidor calcula y guarda el total correcto (precios, límites, envío y comisión).
import { recalcOrder, OrderError } from '../_lib/orderTotal.js';

// Tope por IP (por instancia del servidor): frena abusos simples sin bloquear a un cliente que pide varias veces.
const hits = new Map<string, number[]>();
function demasiadas(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 20;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const ip = String(req.headers?.['x-forwarded-for'] ?? '').split(',')[0].trim() || 'desconocida';
  if (demasiadas(ip)) return res.status(429).json({ error: 'Demasiadas solicitudes, intenta en un minuto' });
  const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId : '';
  if (!/^[A-Za-z0-9]{10,40}$/.test(orderId)) return res.status(400).json({ error: 'Pedido inválido' });
  try {
    const { total } = await recalcOrder(orderId);
    return res.status(200).json({ total });
  } catch (err) {
    if (err instanceof OrderError) return res.status(err.status).json({ error: err.message });
    console.error('orders/recalcular', err);
    return res.status(500).json({ error: 'No se pudo calcular el pedido' });
  }
}
