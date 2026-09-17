import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const FloatingWhatsApp: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkSchedule = () => {
      try {
        const colDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
        const hour = colDate.getHours();
        setIsOnline(hour >= 8 && hour < 18);
      } catch {
        const hour = new Date().getHours();
        setIsOnline(hour >= 8 && hour < 18);
      }
    };
    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.aside
      aria-label="Contacto directo por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: 2,
        duration: 0.7,
        type: 'spring',
        stiffness: 260,
        damping: 15,
      }}
    >
      <div className="hidden sm:flex flex-col items-end bg-stone-900/95 backdrop-blur-xs text-white py-2 px-3.5 rounded-2xl shadow-xl border border-stone-800 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none text-right">
        <span className="text-xs font-semibold text-stone-100">
          ¿Dudas con tu pedido? ¡Escríbenos!
        </span>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium text-emerald-400">
          <span className="relative flex h-2 w-2 shrink-0">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </span>
          <span>Estamos en línea de 8am a 6pm</span>
        </div>
      </div>
      
      <a
        href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick!%20Quisiera%20asesor%C3%ADa%20para%20un%20pedido%20de%20ar%C3%A1ndanos%20frescos."
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#1B4D3E] hover:bg-[#143D32] text-white flex items-center justify-center shadow-2xl shadow-emerald-950/40 hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white/20" />
      </a>
    </motion.aside>
  );
};
