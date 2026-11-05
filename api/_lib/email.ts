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
    body: JSON.stringify({ from, to, reply_to: process.env.EMAIL_REPLY_TO?.trim() || 'info@freshpickfruits.com', ...(bcc ? { bcc } : {}), subject: `Pago confirmado · Pedido ${order.orderNumber}`, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}

/** Aviso al crear el pedido (antes del pago): resumen, total y cuándo se despacha. Opcional, igual que el de pago confirmado. */
export async function sendOrderReceived(order: Record<string, any>): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = String(order.customerEmail ?? '').trim();
  if (!key || !from || !/^\S+@\S+\.\S+$/.test(to)) return;

  const items = (order.items ?? []).map((i: any) => `<li>${esc(i.quantityText)} ${esc(i.name)}</li>`).join('');
  const online = order.paymentMethod === 'tarjeta';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;color:#2F183C">
      <h2>¡Recibimos tu pedido, ${esc(order.customerName)}!</h2>
      <p>Tu pedido <strong>${esc(order.orderNumber)}</strong> quedó registrado por <strong>${esc(cop(Number(order.total)))}</strong> (envío incluido).</p>
      <ul>${items}</ul>
      <p><strong>Dirección:</strong> ${esc(order.shippingAddress)}</p>
      <p>Despachamos los <strong>martes y miércoles</strong> (8:00 a.m. a 3:00 p.m.), según tu dirección y la ruta del domiciliario. Te avisaremos por WhatsApp cuando salga a ruta.</p>
      <p>${online
        ? 'Si aún no completaste el pago en línea, puedes hacerlo desde <strong>Mi cuenta</strong> en freshpickfruits.com.'
        : 'Te escribiremos por WhatsApp para confirmar el pago por transferencia.'}</p>
      <p>Cualquier duda, escríbenos por WhatsApp al +57 317 893 1026.</p>
      <p>Fresh Pick · Arándanos de alta montaña</p>
    </div>`;

  const bcc = process.env.EMAIL_TEAM?.trim();
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `pedido-recibido-${order.orderNumber}` },
    body: JSON.stringify({ from, to, reply_to: process.env.EMAIL_REPLY_TO?.trim() || 'info@freshpickfruits.com', ...(bcc ? { bcc } : {}), subject: `Pedido recibido · ${order.orderNumber}`, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}

/** Aviso interno para el equipo (pedido nuevo, pago aprobado o rechazado). Va a EMAIL_TEAM (varios separados por coma); sin esa variable usa freshpickfruits@gmail.com. */
export async function sendTeamAlert(subject: string, lines: string[]): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = (process.env.EMAIL_TEAM?.trim() || 'freshpickfruits@gmail.com').split(',').map(t => t.trim()).filter(t => /^\S+@\S+\.\S+$/.test(t));
  if (!key || !from || !to.length) return;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;color:#2F183C"><h2>${esc(subject)}</h2>${lines.map(l => `<p style="margin:4px 0">${esc(l)}</p>`).join('')}<p style="margin-top:16px"><a href="https://www.freshpickfruits.com/panel">Abrir el panel de pedidos</a></p></div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}

/** Resumen del pedido para los avisos internos. */
export function orderSummaryLines(order: Record<string, any>): string[] {
  return [
    `Pedido ${order.orderNumber ?? ''} · ${cop(Number(order.total))}`,
    `Cliente: ${order.customerName ?? ''} · ${order.customerPhone ?? ''} · ${order.customerEmail ?? ''}`,
    `Entrega: ${order.deliveryDate ?? 'por definir'} · ${order.shippingAddress ?? ''}`,
    `Forma de pago: ${order.paymentMethod ?? ''}`,
  ];
}

/** Aviso al cliente cuando su intento de pago en línea no se logró: qué pasó y cómo reintentar. */
export async function sendPaymentFailed(order: Record<string, any>, paymentId: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = String(order.customerEmail ?? '').trim();
  if (!key || !from || !/^\S+@\S+\.\S+$/.test(to)) return;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;color:#2F183C">
      <h2>No pudimos confirmar tu pago, ${esc(order.customerName)}</h2>
      <p>El pago en línea de tu pedido <strong>${esc(order.orderNumber)}</strong> por <strong>${esc(cop(Number(order.total)))}</strong> fue rechazado por tu banco o por la pasarela. No se realizó ningún cobro.</p>
      <p>Tu pedido sigue registrado. Puedes intentarlo de nuevo con otra tarjeta o medio de pago desde <strong>Mi cuenta</strong> en <a href="https://www.freshpickfruits.com/panel">freshpickfruits.com</a>, o pagar por transferencia o Bre-B escribiéndonos por WhatsApp al +57 317 893 1026.</p>
      <p>No iniciamos el alistamiento hasta confirmar el pago.</p>
      <p>Fresh Pick · Arándanos de alta montaña</p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `pago-rechazado-${paymentId}` },
    body: JSON.stringify({ from, to, reply_to: process.env.EMAIL_REPLY_TO?.trim() || 'info@freshpickfruits.com', subject: `No se pudo confirmar tu pago · Pedido ${order.orderNumber}`, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}
