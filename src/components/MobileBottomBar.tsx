import React from 'react';
import { Sparkles, BookOpen, Newspaper, MessageCircle, UserRound } from 'lucide-react';
import { useAppLocation } from '../lib/router';
import { useAuth } from '../context/AuthContext';

interface MobileBottomBarProps {
  onOrder: () => void;
}

/** Thumb-reach shortcuts shown only on phones: order, recipes, news and WhatsApp. */
export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOrder }) => {
  const { pathname } = useAppLocation();
  const { user } = useAuth();
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${active ? 'text-[#7B4382]' : 'text-[#2F183C]'} active:bg-[#F5ECF9]`;

  return (
    <nav
      aria-label="Accesos rápidos"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 bg-white/95 backdrop-blur-md border-t border-[#EADBEE] shadow-[0_-4px_20px_rgba(47,24,60,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <button type="button" onClick={onOrder} className={itemClass(false)}>
        <Sparkles className="w-5 h-5 text-[#DDA83A]" />
        <span>Pedir</span>
      </button>
      <a href="/recetas" className={itemClass(isActive('/recetas'))} aria-current={isActive('/recetas') ? 'page' : undefined}>
        <BookOpen className="w-5 h-5" />
        <span>Recetas</span>
      </a>
      <a href="/noticias" className={itemClass(isActive('/noticias'))} aria-current={isActive('/noticias') ? 'page' : undefined}>
        <Newspaper className="w-5 h-5" />
        <span>Noticias</span>
      </a>
      <a
        href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick!%20Quisiera%20asesor%C3%ADa%20para%20un%20pedido%20de%20ar%C3%A1ndanos%20frescos."
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass(false)}
      >
        <MessageCircle className="w-5 h-5 text-[#25A244]" />
        <span>WhatsApp</span>
      </a>
      <a href="/panel" className={itemClass(isActive('/panel'))} aria-current={isActive('/panel') ? 'page' : undefined}>
        <UserRound className="w-5 h-5" />
        <span>{user ? 'Mi cuenta' : 'Ingresar'}</span>
      </a>
    </nav>
  );
};
