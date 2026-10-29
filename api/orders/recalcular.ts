// POST /api/orders/recalcular  { orderId }
// Tras crear el pedido, el servidor calcula y guarda el total correcto (precios, límites, envío y comisión).
import { recalcOrder, OrderError } from '../_lib/orderTotal.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
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
