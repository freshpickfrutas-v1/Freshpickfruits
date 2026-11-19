import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Phone, Sparkles, ChevronRight, ChevronDown, Leaf, BookOpen } from 'lucide-react';
import { scrollToId, useAppLocation } from '../lib/router';
import { useAuth } from '../context/AuthContext';
import { AccountMenu } from './AccountMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { splitLang, useT } from '../lib/i18n';
import { waLink } from '../lib/contact';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onNavigateToCustomOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  onOpenCart,
  onNavigateToCustomOrder
}) => {
  const t = useT();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isStaff, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { path: pathname } = splitLang(useAppLocation().pathname);
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const navLinkClass = (active: boolean) =>
    `transition-colors cursor-pointer ${active ? 'text-[#7B4382] underline underline-offset-8 decoration-2 decoration-[#DDA83A]' : 'hover:text-[#7B4382]'}`;

  const mobileLinkClass = (active: boolean) =>
    `block w-full text-left py-2.5 px-3 rounded-lg font-semibold hover:bg-[#F5ECF9] hover:text-[#7B4382] ${active ? 'bg-[#F5ECF9] text-[#7B4382]' : 'text-[#2F183C]'}`;

  const groupTitleClass = 'flex items-center gap-1.5 px-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#7B4382]';

  const closeMenu = () => setMobileMenuOpen(false);

  // The footer (#contacto) is on every page, so scroll to it in place instead of going home.
  const goToContact = () => {
    closeMenu();
    scrollToId('contacto');
  };

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-[#2F183C] text-[#FAF7F0] text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between">
          <div className="hidden sm:flex items-center gap-2 truncate">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#DDA83A] animate-pulse"></span>
            <span className="font-medium">{t('Arándanos frescos listos para pedidos', 'Fresh blueberries ready to order')}</span>
            <span className="hidden sm:inline text-[#DFCEE6]">{t('· Cosecha del día en Guasca, Cundinamarca', '· Picked today in Guasca, Cundinamarca')}</span>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <span className="hidden md:inline text-[#DFCEE6]">{t('🌱 Cuidamos tu alimento, a quien lo cultiva y nuestro planeta', '🌱 We care for your food, the people who grow it and our planet')}</span>
            <a
              href={waLink(t('Hola Fresh Pick, quiero hacer un pedido de arándanos frescos', 'Hello Fresh Pick, I would like to order fresh blueberries'))}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 font-semibold text-[#DDA83A] hover:underline"
            >
              <Phone className="w-3 h-3" />
              <span>WhatsApp: +57 317 893 1026</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Main Navigation */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#EADBEE] py-2'
            : 'bg-white border-b border-[#EADBEE]/60 py-2.5 sm:py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-3.5 text-left group min-w-0 sm:shrink-0"
            id="nav-logo-btn"
            aria-label={t('Fresh Pick - Ir al inicio', 'Fresh Pick - Go to home page')}
          >
            <div className="h-12 sm:h-16 md:h-18 w-16 sm:w-28 md:w-32 shrink-0 rounded-xl bg-white p-1 sm:p-1.5 border border-[#EADBEE] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <img
                src="/logo.jpg"
                alt={t('Fresh Pick - Logotipo de arándanos frescos de alta montaña y agricultura responsable', 'Fresh Pick - Logo: fresh high-mountain blueberries and responsible farming')}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-[#2F183C] font-display">
                  Fresh Pick
                </span>
                {/* Hidden on desktop so the full menu fits next to the logo */}
                <span className="hidden sm:inline xl:hidden text-xs sm:text-xs font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]">
                  {t('Arándanos', 'Blueberries')}
                </span>
              </div>
              <p className="text-xs sm:text-xs text-[#7B4382] font-semibold tracking-wide mt-0.5 leading-tight xl:hidden">
                {t('Arándanos de Alta Montaña', 'High-Mountain Blueberries')}
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          {/* "Inicio" lives on the logo here so the menu fits at 1280px. */}
          <nav className="hidden xl:flex items-center gap-4 text-[13px] font-semibold text-[#2F183C] shrink-0 whitespace-nowrap" aria-label={t('Menú principal', 'Main menu')}>
            <a href="/#variedades" className={navLinkClass(false)}>{t('Arándanos', 'Blueberries')}</a>
            <a href="/#planes-mensuales" className={navLinkClass(false)}>{t('Planes', 'Plans')}</a>
            <a href="/recetas" className={navLinkClass(isActive('/recetas'))} aria-current={isActive('/recetas') ? 'page' : undefined}>{t('Recetas', 'Recipes')}</a>
            <a href="/noticias" className={navLinkClass(isActive('/noticias'))} aria-current={isActive('/noticias') ? 'page' : undefined}>{t('Noticias', 'News')}</a>
            <span className="h-4 w-px bg-[#DFCEE6]" aria-hidden="true" />
            <div className="relative group">
              <a
                href="/mayoristas"
                className={`${navLinkClass(isActive('/mayoristas'))} inline-flex items-center gap-1 whitespace-nowrap`}
                aria-haspopup="true"
              >
                {t('Mayoristas', 'Wholesale')}
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" />
              </a>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                <div className="min-w-[13rem] rounded-xl border border-[#EADBEE] bg-white shadow-xl py-1.5 text-[13px]">
                  <a href="/mayoristas/colombia" className="block px-4 py-2.5 whitespace-nowrap hover:bg-[#F5ECF9] hover:text-[#7B4382]" aria-current={isActive('/mayoristas/colombia') ? 'page' : undefined}>{t('Al por mayor Colombia', 'Wholesale Colombia')}</a>
                  <a href="/mayoristas/mundo" className="block px-4 py-2.5 whitespace-nowrap hover:bg-[#F5ECF9] hover:text-[#7B4382]" aria-current={isActive('/mayoristas/mundo') ? 'page' : undefined}>Wholesale World</a>
                  <a href="/#faq" className="block px-4 py-2.5 whitespace-nowrap border-t border-[#EADBEE] hover:bg-[#F5ECF9] hover:text-[#7B4382]">{t('Preguntas Frecuentes', 'FAQ')}</a>
                </div>
              </div>
            </div>
          </nav>

          {/* Action CTAs & Cart */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {!isStaff && <button
              id="header-cta-custom-order"
              onClick={onNavigateToCustomOrder}
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#2F183C] hover:bg-[#432356] active:scale-95 transition-all px-3 py-2.5 rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DDA83A]" />
              <span>{t('Armar Pedido', 'Build Your Order')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>}

            <LanguageSwitcher className="shrink-0" />

            <AccountMenu />

            {!isStaff && <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-lg text-[#2F183C] hover:text-[#7B4382] hover:bg-[#F5ECF9] transition-colors"
              aria-label={t('Ver carrito', 'View cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2F183C] text-[#DDA83A] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </button>}

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-[#2F183C] hover:bg-[#F5ECF9]"
              aria-label={t('Abrir menú de navegación', 'Open navigation menu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#EADBEE] bg-white px-4 sm:px-6 pt-4 pb-6 mt-3 max-h-[calc(100vh-11.5rem)] md:max-h-[calc(100vh-7.5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl">
            {user ? (
              <div className="mb-4 rounded-xl border border-[#EADBEE] bg-[#FAF7F0] p-3 space-y-1">
                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                {isStaff
                  ? <a href="/admin" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Panel del equipo', 'Team panel')}</a>
                  : <a href="/panel" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Mi cuenta y pedidos', 'My account and orders')}</a>}
                <button onClick={() => { closeMenu(); signOut(); }} className={mobileLinkClass(false)}>{t('Cerrar sesión', 'Sign out')}</button>
              </div>
            ) : (
              <a
                href="/panel"
                onClick={closeMenu}
                className="mb-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#2F183C] text-[#2F183C] font-bold"
              >
                {t('Ingresar o crear cuenta', 'Sign in or create an account')}
              </a>
            )}
            {!isStaff && <button
              onClick={() => { setMobileMenuOpen(false); onNavigateToCustomOrder(); }}
              className="flex items-center justify-between w-full text-left py-3 px-3 rounded-xl bg-[#2F183C] text-white font-bold mb-4 sm:hidden"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DDA83A]" />
                <span>{t('Armar Pedido de Arándanos', 'Build Your Blueberry Order')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#DDA83A]" />
            </button>}

            {/* Three groups: one column on phones, three side by side on tablets */}
            <div className="grid gap-5 md:grid-cols-3 md:gap-6">
              <div>
                <p className={groupTitleClass}><ShoppingBag className="w-3.5 h-3.5" /> {t('Comprar', 'Shop')}</p>
                <div className="space-y-1">
                  <a href="/#variedades" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Nuestros Arándanos', 'Our Blueberries')}</a>
                  <a href="/#pedidos-personalizados" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Armar Pedido', 'Build Your Order')}</a>
                  <a href="/#planes-mensuales" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Planes Mensuales', 'Monthly Plans')}</a>
                  <a href="/mayoristas/colombia" onClick={closeMenu} className={mobileLinkClass(isActive('/mayoristas/colombia'))}>{t('Al por mayor Colombia', 'Wholesale Colombia')}</a>
                  <a href="/mayoristas/mundo" onClick={closeMenu} className={mobileLinkClass(isActive('/mayoristas/mundo'))}>Wholesale World</a>
                </div>
              </div>
              <div>
                <p className={groupTitleClass}><BookOpen className="w-3.5 h-3.5" /> {t('Aprender', 'Learn')}</p>
                <div className="space-y-1">
                  <a href="/recetas" onClick={closeMenu} className={mobileLinkClass(isActive('/recetas'))} aria-current={isActive('/recetas') ? 'page' : undefined}>{t('Recetas con Arándanos', 'Blueberry Recipes')}</a>
                  <a href="/noticias" onClick={closeMenu} className={mobileLinkClass(isActive('/noticias'))} aria-current={isActive('/noticias') ? 'page' : undefined}>{t('Noticias de Arándanos', 'Blueberry News')}</a>
                  <a href="/#faq" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Preguntas Frecuentes', 'Frequently Asked Questions')}</a>
                </div>
              </div>
              <div>
                <p className={groupTitleClass}><Leaf className="w-3.5 h-3.5" /> {t('Nosotros', 'About us')}</p>
                <div className="space-y-1">
                  <a href="/" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Inicio', 'Home')}</a>
                  <a href="/#sostenibilidad" onClick={closeMenu} className={mobileLinkClass(false)}>{t('Sostenibilidad & Finca', 'Sustainability & Farm')}</a>
                  <button onClick={goToContact} className={mobileLinkClass(false)}>{t('Contacto & Finca', 'Contact & Farm')}</button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#EADBEE]">
              <a
                href={waLink(t('Hola Fresh Pick, quiero hacer un pedido de arándanos frescos', 'Hello Fresh Pick, I would like to order fresh blueberries'))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-lg bg-[#2F183C] text-white font-bold flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#DDA83A]" />
                <span>{t('Hablar por WhatsApp', 'Chat on WhatsApp')}</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
