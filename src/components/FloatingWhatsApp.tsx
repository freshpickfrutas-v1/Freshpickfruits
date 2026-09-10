import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {!tooltipDismissed && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-stone-800 text-xs font-semibold py-2 px-3.5 rounded-full shadow-lg border border-stone-200 animate-in fade-in slide-in-from-right-4 duration-300">
          <span>¿Prefieres pedir por WhatsApp?</span>
          <button
            onClick={() => setTooltipDismissed(true)}
            className="text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            aria-label="Cerrar sugerencia"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href="https://wa.me/573216920138?text=Hola%20Fresh%20Pick%20Frutas,%20quiero%20hacer%20un%20pedido%20de%20frutas%20frescas"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute w-full h-full rounded-full bg-emerald-500 animate-ping opacity-25 pointer-events-none" />
        <Phone className="w-6 h-6 fill-white" />
      </a>
    </div>
  );
};
