// POST /api/bold/webhook
// Bold avisa aquí el resultado de cada venta (SALE_APPROVED, SALE_REJECTED, VOID_*).
// Verifica la firma HMAC-SHA256 (header x-bold-signature) y marca el pedido como pagado.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../_lib/admin.js';
import { sendPaymentConfirmed, sendPaymentFailed, sendTeamAlert, orderSummaryLines } from '../_lib/email.js';

// La firma se calcula sobre el cuerpo tal cual llegó: hay que leerlo crudo, sin que Vercel lo convierta a objeto.
export const config = { api: { bodyParser: false } };

async function rawBody(req: any): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  // En modo pruebas Bold firma con una llave vacía (BOLD_TEST_MODE=true); en producción, con la llave secreta.
  const testMode = process.env.BOLD_TEST_MODE === 'true';
  const secret = testMode ? '' : process.env.BOLD_SECRET_KEY?.trim().replace(/^["']+|["']+$/g, '');
  if (secret === undefined) return res.status(500).json({ error: 'Webhook no configurado' });

  const body = await rawBody(req);
  const signature = String(req.headers['x-bold-signature'] ?? '');
  const expected = createHmac('sha256', secret).update(Buffer.from(body).toString('base64')).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.toLowerCase());
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(401).json({ error: 'Firma inválida' });

  let event: any;
  try { event = JSON.parse(body); } catch { return res.status(400).json({ error: 'Evento inválido' }); }

  const data = event?.data;
  const reference = String(data?.metadata?.reference ?? '');
  // <N° pedido>_<ID del pedido>_<intento>
  const orderId = reference.split('_')[1] ?? '';
  if (!orderId) return res.status(200).json({ ok: true });

  try {
    const ref = adminDb().collection('orders').doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(200).json({ ok: true });
    const order = snap.data()!;

    if (event.type === 'SALE_APPROVED') {
      // Bold puede repetir la notificación: si ya está pagado no se procesa dos veces.
      if (order.paymentStatus === 'verificado') return res.status(200).json({ ok: true });
      // El monto y la moneda cobrados deben coincidir con los del pedido.
      if (data.amount?.currency !== 'COP' || Number(data.amount?.total) !== Number(order.total)) {
        console.error('bold/webhook: monto no coincide', orderId, data.amount?.total, order.total);
        return res.status(200).json({ ok: true });
      }
      const at = new Date().toISOString();
      const gateway = String(data.payment_method ?? '').toUpperCase();
      const method = ({
        CARD: 'tarjeta', CARD_WEB: 'tarjeta', PSE: 'pse', NEQUI: 'nequi', BOTON_BANCOLOMBIA: 'bancolombia', QR: 'qr',
      } as Record<string, string>)[gateway] ?? gateway.toLowerCase();
      const paymentId = String(data.payment_id ?? event.subject ?? '');
      await ref.update({
        payment: {
          reference,
          transactionId: paymentId,
          method,
          amount: Number(data.amount.total),
          approvedAt: at,
          source: 'bold',
          recordedBy: 'Bold',
        },
        paymentStatus: 'verificado',
        paymentVerifiedAt: at,
        paymentVerifiedBy: 'Bold',
        paymentMethod: 'bold',
        boldPaymentId: paymentId,
        status: order.status === 'pendiente' ? 'pago_verificado' : order.status,
        history: FieldValue.arrayUnion({ status: 'pago_verificado', at, by: 'Bold', note: `Transacción ${paymentId}` }),
      });
      // El aviso al cliente no debe tumbar el webhook: si falla, el pago ya quedó registrado.
      try { await sendPaymentConfirmed(order, Number(data.amount.total)); } catch (e) { console.error('bold/webhook: correo', e); }
      try { await sendTeamAlert(`Pago aprobado · ${order.orderNumber}`, [...orderSummaryLines(order), `Método: ${method} · Transacción ${paymentId}`]); } catch (e) { console.error('bold/webhook: aviso equipo', e); }
    } else if (event.type === 'SALE_REJECTED') {
      const paymentId = String(data.payment_id ?? event.subject ?? '');
      // Bold puede repetir el aviso: un mismo intento (mismo ID de transacción) se registra una sola vez.
      if ((order.history ?? []).some((h: any) => h.status === 'pago_rechazado' && String(h.note ?? '').includes(paymentId))) return res.status(200).json({ ok: true });
      const at = new Date().toISOString();
      const method = String(data.payment_method ?? '').toLowerCase();
      await ref.update({
        boldLastStatus: 'REJECTED',
        boldPaymentId: paymentId,
        history: FieldValue.arrayUnion({ status: 'pago_rechazado', at, by: 'Bold', note: `${method} · $${Number(data.amount?.total ?? 0).toLocaleString('es-CO')} COP · transacción ${paymentId}` }),
      });
      try { await sendPaymentFailed(order, paymentId); } catch (e) { console.error('bold/webhook: correo cliente', e); }
      try { await sendTeamAlert(`Pago RECHAZADO · ${order.orderNumber}`, [...orderSummaryLines(order), `Método: ${method} · Transacción ${paymentId}`, 'El pedido sigue pendiente de pago.']); } catch (e) { console.error('bold/webhook: aviso equipo', e); }
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('bold/webhook', err);
    return res.status(500).json({ error: 'Error procesando el evento' });
  }
}
