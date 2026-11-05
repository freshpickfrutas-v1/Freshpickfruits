// POST /api/bold/firma  { orderId }
// Genera el identificador único de la venta y el hash de integridad de Bold (SHA256) en el servidor.
// El monto se recalcula en el servidor con los precios del catálogo, nunca se confía en el navegador.
import { createHash } from 'node:crypto';
import { adminDb } from '../_lib/admin.js';
import { recalcOrder, OrderError } from '../_lib/orderTotal.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // Se limpian espacios, saltos de línea y comillas que se cuelan al pegar la llave en Vercel.
  const secret = process.env.BOLD_SECRET_KEY?.trim().replace(/^["']+|["']+$/g, '');
  if (!secret) return res.status(500).json({ error: 'Pagos en línea no configurados' });

  const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId : '';
  if (!/^[A-Za-z0-9]{10,40}$/.test(orderId)) return res.status(400).json({ error: 'Pedido inválido' });

  try {
    await recalcOrder(orderId);
    const snap = await adminDb().collection('orders').doc(orderId).get();
    if (!snap.exists) return res.status(404).json({ error: 'Pedido no encontrado' });
    const order = snap.data()!;
    if (order.paymentStatus === 'verificado') return res.status(409).json({ error: 'Este pedido ya está pagado' });

    const total = Number(order.total);
    if (!Number.isInteger(total) || total <= 0) return res.status(400).json({ error: 'Monto inválido' });

    // <N° pedido>_<ID del pedido>_<intento>. Bold solo admite letras, números, _ y -, máximo 60 caracteres;
    // el webhook usa el ID del pedido (segunda parte) para encontrarlo.
    const number = String(order.orderNumber ?? '').replace(/[^A-Za-z0-9-]/g, '');
    const bookingOrderId = `${number || 'FP'}_${orderId}_${Date.now().toString(36)}`.slice(0, 60);
    const currency = 'COP';
    // Fórmula de Bold: {Identificador}{Monto}{Divisa}{LlaveSecreta}, monto en pesos sin decimales.
    const integrity = createHash('sha256')
      .update(`${bookingOrderId}${total}${currency}${secret}`)
      .digest('hex');

    return res.status(200).json({ orderId: bookingOrderId, amount: String(total), currency, integrity });
  } catch (err) {
    if (err instanceof OrderError) return res.status(err.status).json({ error: err.message });
    console.error('bold/firma', err);
    return res.status(500).json({ error: 'No se pudo preparar el pago' });
  }
}
