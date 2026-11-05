import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

const LIBRARY_SRC = 'https://checkout.bold.co/library/boldPaymentButton.js';
const API_KEY = import.meta.env.VITE_BOLD_API_KEY as string | undefined;

declare global {
  interface Window { BoldCheckout?: new (config: Record<string, unknown>) => { open: () => void } }
}

function loadLibrary(): Promise<void> {
  if (window.BoldCheckout) return Promise.resolve();
  return new Promise((resolve, reject) => {
    // La librería no emite eventos propios: se espera al load del script y se confirma que BoldCheckout exista.
    const s = document.querySelector<HTMLScriptElement>(`script[src="${LIBRARY_SRC}"]`) ?? document.createElement('script');
    const fail = () => { s.remove(); reject(new Error('No se pudo cargar el pago en línea.')); };
    s.addEventListener('load', () => (window.BoldCheckout ? resolve() : fail()), { once: true });
    s.addEventListener('error', fail, { once: true });
    if (!s.parentNode) {
      s.src = LIBRARY_SRC;
      document.head.appendChild(s);
    }
  });
}

interface Props {
  /** ID del documento del pedido en Firestore (el servidor toma el monto de ahí). */
  orderId: string;
  customer: { name: string; email: string; phone: string };
}

/** Abre el checkout embebido de Bold. El pago real se confirma por el webhook del servidor, no por el navegador. */
export const BoldPayButton: React.FC<Props> = ({ orderId, customer }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!API_KEY) return null;

  const pay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bold/firma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo preparar el pago.');
      await loadLibrary();

      const phone = customer.phone.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '');
      const checkout = new window.BoldCheckout!({
        orderId: data.orderId,
        currency: data.currency,
        amount: data.amount,
        apiKey: API_KEY,
        integritySignature: data.integrity,
        description: 'Pedido de arándanos Fresh Pick',
        redirectionUrl: `${window.location.origin}/gracias`,
        originUrl: window.location.href,
        renderMode: 'embedded',
        customerData: JSON.stringify({
          ...(customer.email ? { email: customer.email } : {}),
          fullName: customer.name,
          ...(phone.length === 10 ? { phone, dialCode: '+57' } : {}),
        }),
      });
      checkout.open();
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
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
};
