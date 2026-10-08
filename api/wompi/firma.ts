// POST /api/wompi/firma  { orderId }
// Genera la referencia única y la firma de integridad de Wompi (SHA256) en el servidor.
// El monto sale SIEMPRE del pedido guardado en Firestore, nunca del navegador.
import { createHash } from 'node:crypto';
import { adminDb } from '../_lib/admin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) return res.status(500).json({ error: 'Pagos en línea no configurados' });

  const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId : '';
  if (!/^[A-Za-z0-9]{10,40}$/.test(orderId)) return res.status(400).json({ error: 'Pedido inválido' });

  try {
    const snap = await adminDb().collection('orders').doc(orderId).get();
    if (!snap.exists) return res.status(404).json({ error: 'Pedido no encontrado' });
    const order = snap.data()!;
    if (order.paymentStatus === 'verificado') return res.status(409).json({ error: 'Este pedido ya está pagado' });

    const total = Number(order.total);
    if (!Number.isInteger(total) || total <= 0) return res.status(400).json({ error: 'Monto inválido' });

    // Referencia legible: <N° pedido>_<ID del pedido>_<intento>. Cada intento de pago necesita la suya;
    // en Wompi se lee el N° de pedido y el webhook usa el ID para encontrarlo.
    const number = String(order.orderNumber ?? '').replace(/[^A-Za-z0-9-]/g, '');
    const reference = `${number || 'FP'}_${orderId}_${Date.now().toString(36)}`;
    const amountInCents = total * 100;
    const currency = 'COP';
    const integrity = createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${secret}`)
      .digest('hex');

    return res.status(200).json({ reference, amountInCents, currency, integrity });
  } catch (err) {
    console.error('wompi/firma', err);
    return res.status(500).json({ error: 'No se pudo preparar el pago' });
  }
}
