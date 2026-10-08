// POST /api/wompi/webhook
// Wompi avisa aquí el resultado final de cada transacción (evento transaction.updated).
// Verifica el checksum con el secreto de eventos y marca el pedido como pagado.
import { createHash, timingSafeEqual } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../_lib/admin.js';

const pick = (obj: any, path: string) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook no configurado' });

  const event = req.body;
  const props: string[] | undefined = event?.signature?.properties;
  const checksum: string | undefined = event?.signature?.checksum;
  if (!event?.data || !Array.isArray(props) || !checksum || event.timestamp == null) {
    return res.status(400).json({ error: 'Evento inválido' });
  }

  const expected = createHash('sha256')
    .update(props.map(p => String(pick(event.data, p))).join('') + event.timestamp + secret)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(checksum.toLowerCase());
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(401).json({ error: 'Firma inválida' });

  if (event.event !== 'transaction.updated') return res.status(200).json({ ok: true });

  const tx = event.data.transaction;
  // <N° pedido>_<ID del pedido>_<intento>
  const orderId = String(tx?.reference ?? '').split('_')[1] ?? '';
  if (!orderId) return res.status(200).json({ ok: true });

  try {
    const ref = adminDb().collection('orders').doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(200).json({ ok: true });
    const order = snap.data()!;

    if (tx.status === 'APPROVED') {
      if (order.paymentStatus === 'verificado') return res.status(200).json({ ok: true });
      // El monto cobrado debe coincidir con el del pedido.
      if (tx.amount_in_cents !== Number(order.total) * 100) {
        console.error('wompi/webhook: monto no coincide', orderId, tx.amount_in_cents, order.total);
        return res.status(200).json({ ok: true });
      }
      const at = new Date().toISOString();
      // Registro de pago del pedido: referencia, ID de transacción, método, valor cobrado y fecha de aprobación.
      const gateway = String(tx.payment_method_type ?? '').toUpperCase();
      const method = ({ CARD: 'tarjeta', PSE: 'pse', NEQUI: 'nequi', DAVIPLATA: 'daviplata' } as Record<string, string>)[gateway] ?? gateway.toLowerCase();
      await ref.update({
        payment: {
          reference: String(tx.reference),
          transactionId: String(tx.id),
          method,
          amount: tx.amount_in_cents / 100,
          approvedAt: tx.finalized_at ?? at,
          source: 'wompi',
          recordedBy: 'Wompi',
        },
        paymentStatus: 'verificado',
        paymentVerifiedAt: at,
        paymentVerifiedBy: 'Wompi',
        paymentMethod: 'wompi',
        wompiTransactionId: tx.id,
        status: order.status === 'pendiente' ? 'pago_verificado' : order.status,
        history: FieldValue.arrayUnion({ status: 'pago_verificado', at, by: 'Wompi', note: `Transacción ${tx.id}` }),
      });
    } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(tx.status)) {
      await ref.update({ wompiLastStatus: tx.status, wompiTransactionId: tx.id });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('wompi/webhook', err);
    return res.status(500).json({ error: 'Error procesando el evento' });
  }
}
