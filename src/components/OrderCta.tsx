import React from 'react';
import { Sparkles, ArrowRight, Phone } from 'lucide-react';
import { BlueberryIcon } from './BlueberryIcon';

interface OrderCtaProps {
  title?: string;
  text?: string;
  /** Pre-filled WhatsApp message. */
  whatsappMessage?: string;
  compact?: boolean;
}

const DEFAULT_MESSAGE = 'Hola Fresh Pick, quiero hacer un pedido de arándanos frescos';

/** Purchase call-to-action shown on recipes and blog pages. */
export const OrderCta: React.FC<OrderCtaProps> = ({
  title = 'Prepáralo con arándanos Fresh Pick',
  text = 'Arándanos premium de alta montaña, cosechados a mano en Guasca y entregados en tu casa los martes y miércoles.',
  whatsappMessage = DEFAULT_MESSAGE,
  compact = false
}) => (
  <div className={`rounded-2xl bg-[#2F183C] text-white border border-[#7B4382]/50 shadow-xl shadow-[#2F183C]/20 ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
    <div className={`flex flex-col ${compact ? 'gap-4' : 'md:flex-row md:items-center gap-5 md:gap-8'}`}>
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#DDA83A]">
          <BlueberryIcon className="w-4 h-4" />
          <span>Del cultivo a tu mesa</span>
        </div>
        <h2 className={`font-display font-extrabold text-white mt-1 ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
          {title}
        </h2>
        <p className="text-sm text-[#DFCEE6] mt-1.5 leading-relaxed">{text}</p>
      </div>
      <div className={`flex flex-col gap-2.5 shrink-0 ${compact ? '' : 'sm:flex-row md:flex-col'}`}>
        <a
          href="/#pedidos-personalizados"
          className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#DDA83A] text-[#2F183C] font-bold text-sm hover:bg-[#C59328] transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Armar Pedido</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a
          href={`https://wa.me/573178931026?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#DFCEE6]/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
        >
          <Phone className="w-4 h-4 text-[#DDA83A]" />
          <span>Pedir por WhatsApp</span>
        </a>
      </div>
    </div>
  </div>
);
