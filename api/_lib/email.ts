// Correo de confirmación de pago, con Resend (https://resend.com).
// Es opcional: sin RESEND_API_KEY no envía nada. EMAIL_FROM debe ser un remitente de un dominio verificado en Resend.
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const cop = (n: number) => `$${Number(n).toLocaleString('es-CO')} COP`;

export async function sendPaymentConfirmed(order: Record<string, any>, amount: number): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = String(order.customerEmail ?? '').trim();
  if (!key || !from || !/^\S+@\S+\.\S+$/.test(to)) return;

  const items = (order.items ?? []).map((i: any) => `<li>${esc(i.quantityText)} ${esc(i.name)}</li>`).join('');
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;color:#2F183C">
      <h2>¡Recibimos tu pago, ${esc(order.customerName)}!</h2>
      <p>Tu pedido <strong>${esc(order.orderNumber)}</strong> está confirmado por ${esc(cop(amount))}.</p>
      <ul>${items}</ul>
      <p><strong>Entrega:</strong> ${esc(order.deliveryDate || 'martes o miércoles, 8:00 a.m. a 3:00 p.m.')}<br>
      <strong>Dirección:</strong> ${esc(order.shippingAddress)}</p>
      <p>Cualquier duda, escríbenos por WhatsApp al +57 317 893 1026.</p>
      <p>Fresh Pick · Arándanos de alta montaña</p>
    </div>`;

  const bcc = process.env.EMAIL_TEAM?.trim();
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, ...(bcc ? { bcc } : {}), subject: `Pago confirmado · Pedido ${order.orderNumber}`, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}
