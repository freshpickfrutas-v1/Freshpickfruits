import React from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { usePageMeta } from '../lib/seo';

/** Landing after a purchase (Wompi redirects here). Google Business Profile asks for a "thank you" screen at the end of checkout. */
export default function ThankYouPage() {
  usePageMeta({
    title: 'Gracias por tu compra | Fresh Pick',
    description: 'Gracias por tu compra en Fresh Pick. Despachamos los martes y miércoles.',
    path: '/gracias',
    noindex: true,
  });

  return (
    <SiteShell>
      <section className="py-16 sm:py-24">
        <div className="max-w-xl mx-auto px-4 text-center bg-white rounded-3xl shadow-xl border border-[#DFCEE6] p-8">
          <CheckCircle2 className="w-14 h-14 text-[#7B4382] mx-auto mb-4" />
          <h1 className="text-3xl font-black text-[#2F183C] font-display">¡Gracias por tu compra!</h1>
          <p className="mt-3 text-stone-700">
            Recibimos tu pedido de arándanos Fresh Pick. Los pedidos salen los <strong>martes y miércoles</strong> (8:00 a.m. – 3:00 p.m.),
            mínimo 8 días después de hacer el pedido. Te escribiremos por WhatsApp para confirmar tu entrega.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/panel" className="px-6 py-3 rounded-xl bg-[#2F183C] text-white font-bold hover:bg-[#432356] transition-colors">Ver mis pedidos</a>
            <a
              href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20acabo%20de%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-[#DFCEE6] text-[#2F183C] font-bold hover:bg-[#F5ECF9] inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#7B4382]" /> Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
