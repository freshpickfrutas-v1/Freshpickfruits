import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

const WIDGET_SRC = 'https://checkout.wompi.co/widget.js';
const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined;

declare global {
  interface Window { WidgetCheckout?: new (config: Record<string, unknown>) => { open: (cb: (result: any) => void) => void } }
}

function loadWidget(): Promise<void> {
  if (window.WidgetCheckout) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = WIDGET_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar el pago en línea.'));
    document.head.appendChild(s);
  });
}

interface Props {
  /** ID del documento del pedido en Firestore (el servidor toma el monto de ahí). */
  orderId: string;
  customer: { name: string; email: string; phone: string };
  onApproved?: () => void;
}

/** Abre el widget de Wompi. El pago real se confirma por el webhook del servidor, no por este callback. */
export const WompiPayButton: React.FC<Props> = ({ orderId, customer, onApproved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  if (!PUBLIC_KEY) return null;

  const pay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wompi/firma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo preparar el pago.');
      await loadWidget();

      const phone = customer.phone.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '');
      const checkout = new window.WidgetCheckout!({
        currency: data.currency,
        amountInCents: data.amountInCents,
        reference: data.reference,
        publicKey: PUBLIC_KEY,
        signature: { integrity: data.integrity },
        redirectUrl: `${window.location.origin}/`,
        customerData: {
          email: customer.email || undefined,
          fullName: customer.name,
          ...(phone.length === 10 ? { phoneNumber: phone, phoneNumberPrefix: '+57' } : {}),
        },
      });
      checkout.open((result: any) => {
        const st = result?.transaction?.status;
        if (st === 'APPROVED') {
          setStatus('¡Pago recibido! Estamos confirmándolo; tu pedido pasará a alistamiento.');
          onApproved?.();
        } else if (st === 'PENDING') {
          setStatus('Tu pago está en proceso. Te avisaremos cuando se confirme.');
        } else if (st) {
          setError('El pago no se completó. Puedes intentarlo de nuevo o pagar por transferencia.');
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={pay}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DDA83A] text-[#2F183C] font-bold hover:brightness-95 transition disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        Pagar en línea (tarjeta, PSE, Nequi)
      </button>
      {status && <p className="mt-2 text-xs text-emerald-800">{status}</p>}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
};
