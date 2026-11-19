import React from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { usePageMeta } from '../lib/seo';
import { track } from '../lib/analytics';
import { useT } from '../lib/i18n';
import { waLink } from '../lib/contact';

/** Landing after a purchase (Wompi redirects here). Google Business Profile asks for a "thank you" screen at the end of checkout. */
export default function ThankYouPage() {
  const t = useT();
  usePageMeta({
    title: t('Gracias por tu compra | Fresh Pick', 'Thank you for your purchase | Fresh Pick'),
    description: t('Gracias por tu compra en Fresh Pick. Despachamos los martes y miércoles.', 'Thank you for your purchase at Fresh Pick. We dispatch on Tuesdays and Wednesdays.'),
    path: '/gracias',
    noindex: true,
  });

  // Wompi devuelve aquí al cliente tras pagar: se mide la compra una sola vez con el pedido que se guardó al crearlo.
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('fp-last-order');
      if (!raw) return;
      sessionStorage.removeItem('fp-last-order');
      const o = JSON.parse(raw) as { id: string; value: number; online: boolean };
      if (o.online) track('purchase', { id: o.id, value: o.value });
    } catch { /* sin almacenamiento */ }
  }, []);

  return (
    <SiteShell>
      <section className="py-16 sm:py-24">
        <div className="max-w-xl mx-auto px-4 text-center bg-white rounded-3xl shadow-xl border border-[#DFCEE6] p-8">
          <CheckCircle2 className="w-14 h-14 text-[#7B4382] mx-auto mb-4" />
          <h1 className="text-3xl font-black text-[#2F183C] font-display">{t('¡Gracias por tu compra!', 'Thank you for your purchase!')}</h1>
          <p className="mt-3 text-stone-700">
            {t(<>Recibimos tu pedido de arándanos Fresh Pick. Los pedidos salen los <strong>martes y miércoles</strong> (8:00 a.m. – 3:00 p.m.), mínimo 8 días después de hacer el pedido. Te escribiremos por WhatsApp para confirmar tu entrega.</>, <>We received your Fresh Pick blueberry order. Orders go out on <strong>Tuesdays and Wednesdays</strong> (8:00 a.m. – 3:00 p.m.), at least 8 days after placing the order. We will message you on WhatsApp to confirm your delivery.</>)}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/panel" className="px-6 py-3 rounded-xl bg-[#2F183C] text-white font-bold hover:bg-[#432356] transition-colors">{t('Ver mis pedidos', 'View my orders')}</a>
            <a
              href={waLink(t('Hola Fresh Pick, acabo de hacer un pedido', 'Hello Fresh Pick, I just placed an order'))}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-[#DFCEE6] text-[#2F183C] font-bold hover:bg-[#F5ECF9] inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#7B4382]" /> {t('Escribir por WhatsApp', 'Message us on WhatsApp')}
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
