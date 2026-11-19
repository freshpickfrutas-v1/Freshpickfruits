import React from 'react';
import { Sparkles, BookOpen, Newspaper, MessageCircle, UserRound, LayoutDashboard } from 'lucide-react';
import { useAppLocation } from '../lib/router';
import { splitLang, useT } from '../lib/i18n';
import { waLink } from '../lib/contact';
import { useAuth } from '../context/AuthContext';

interface MobileBottomBarProps {
  onOrder: () => void;
}

/** Thumb-reach shortcuts shown only on phones: order, recipes, news and WhatsApp. */
export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOrder }) => {
  const t = useT();
  const { path: pathname } = splitLang(useAppLocation().pathname);
  const { user, isStaff } = useAuth();
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold transition-colors ${active ? 'text-[#7B4382]' : 'text-[#2F183C]'} active:bg-[#F5ECF9]`;

  return (
    <nav
      aria-label={t('Accesos rápidos', 'Quick links')}
      className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 bg-white/95 backdrop-blur-md border-t border-[#EADBEE] shadow-[0_-4px_20px_rgba(47,24,60,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      {isStaff ? (
        <a href="/admin" className={itemClass(false)}>
          <LayoutDashboard className="w-5 h-5 text-[#DDA83A]" />
          <span>Admin</span>
        </a>
      ) : (
        <button type="button" onClick={onOrder} className={itemClass(false)}>
          <Sparkles className="w-5 h-5 text-[#DDA83A]" />
          <span>{t('Pedir', 'Order')}</span>
        </button>
      )}
      <a href="/recetas" className={itemClass(isActive('/recetas'))} aria-current={isActive('/recetas') ? 'page' : undefined}>
        <BookOpen className="w-5 h-5" />
        <span>{t('Recetas', 'Recipes')}</span>
      </a>
      <a href="/noticias" className={itemClass(isActive('/noticias'))} aria-current={isActive('/noticias') ? 'page' : undefined}>
        <Newspaper className="w-5 h-5" />
        <span>{t('Noticias', 'News')}</span>
      </a>
      <a
        href={waLink(t('Hola Fresh Pick! Quisiera asesoría para un pedido de arándanos frescos.', 'Hello Fresh Pick! I would like advice on an order of fresh blueberries.'))}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass(false)}
      >
        <MessageCircle className="w-5 h-5 text-[#25A244]" />
        <span>WhatsApp</span>
      </a>
      <a href={isStaff ? '/admin' : '/panel'} className={itemClass(isActive('/panel'))} aria-current={isActive('/panel') ? 'page' : undefined}>
        <UserRound className="w-5 h-5" />
        <span>{isStaff ? t('Equipo', 'Team') : user ? t('Mi cuenta', 'Account') : t('Ingresar', 'Sign in')}</span>
      </a>
    </nav>
  );
};
