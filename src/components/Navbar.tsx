import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Phone, Sparkles, ChevronRight, Leaf } from 'lucide-react';
import { scrollToId, useAppLocation } from '../lib/router';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const { pathname } = useAppLocation();
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const navLinkClass = (active: boolean) =>
    `transition-colors cursor-pointer ${active ? 'text-[#7B4382] underline underline-offset-8 decoration-2 decoration-[#DDA83A]' : 'hover:text-[#7B4382]'}`;

  const mobileLinkClass = (active: boolean) =>
    `block w-full text-left py-2.5 px-3 rounded-lg font-semibold hover:bg-[#F5ECF9] hover:text-[#7B4382] ${active ? 'bg-[#F5ECF9] text-[#7B4382]' : 'text-[#2F183C]'}`;

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#DDA83A] animate-pulse"></span>
            <span className="font-medium">Arándanos frescos listos para pedidos</span>
            <span className="hidden sm:inline text-[#DFCEE6]">· Cosecha del día en Guasca, Cundinamarca</span>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <span className="hidden md:inline text-[#DFCEE6]">🌱 Cuidamos tu alimento, a quien lo cultiva y nuestro planeta</span>
            <a
              href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20hacer%20un%20pedido%20de%20ar%C3%A1ndanos%20frescos"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="/"
            className="flex items-center gap-3 sm:gap-3.5 text-left group shrink-0"
            id="nav-logo-btn"
            aria-label="Fresh Pick - Ir al inicio"
          >
            <div className="h-14 sm:h-16 md:h-18 w-24 sm:w-28 md:w-32 rounded-xl bg-white p-1 sm:p-1.5 border border-[#EADBEE] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <img
                src="/logo.jpg"
                alt="Fresh Pick - Logotipo de arándanos frescos de alta montaña y agricultura responsable"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2F183C] font-display">
                  Fresh Pick
                </span>
                {/* Hidden on desktop so the full menu fits next to the logo */}
                <span className="xl:hidden text-[11px] sm:text-xs font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]">
                  Arándanos
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#7B4382] font-semibold tracking-wide mt-0.5">
                Arándanos de Alta Montaña
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          {/* "Inicio" lives on the logo here so the menu fits at 1280px. */}
          <nav className="hidden xl:flex items-center gap-3 2xl:gap-4 text-[13px] font-semibold text-[#2F183C] shrink-0" aria-label="Menú principal">
            <a href="/#variedades" className={navLinkClass(false)}>Nuestros Arándanos</a>
            <a href="/#planes-mensuales" className={navLinkClass(false)}>Planes Mensuales</a>
            <a href="/#sostenibilidad" className={navLinkClass(false)}>Sostenibilidad</a>
            <a href="/recetas" className={navLinkClass(isActive('/recetas'))} aria-current={isActive('/recetas') ? 'page' : undefined}>Recetas</a>
            <a href="/blog" className={navLinkClass(isActive('/blog'))} aria-current={isActive('/blog') ? 'page' : undefined}>Noticias de Arándanos</a>
            <a href="/#faq" className={navLinkClass(false)}>Preguntas</a>
          </nav>

          {/* Action CTAs & Cart */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-cta-custom-order"
              onClick={onNavigateToCustomOrder}
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#2F183C] hover:bg-[#432356] active:scale-95 transition-all px-4 py-2.5 rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DDA83A]" />
              <span>Armar Pedido</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-lg text-[#2F183C] hover:text-[#7B4382] hover:bg-[#F5ECF9] transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2F183C] text-[#DDA83A] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-[#2F183C] hover:bg-[#F5ECF9]"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#EADBEE] bg-white px-4 pt-3 pb-6 space-y-3 mt-3 animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl">
            <a href="/" onClick={closeMenu} className={mobileLinkClass(false)}>Inicio</a>
            <a href="/#variedades" onClick={closeMenu} className={mobileLinkClass(false)}>Nuestros Arándanos</a>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigateToCustomOrder(); }}
              className="flex items-center justify-between w-full text-left py-3 px-3 rounded-lg bg-[#F5ECF9] text-[#2F183C] font-bold"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DDA83A]" />
                <span>Armar Pedido de Arándanos</span>
              </div>
              <span className="bg-[#2F183C] text-[#DDA83A] text-[10px] uppercase px-2 py-0.5 rounded-full font-bold">Exclusivo</span>
            </button>
            <a href="/recetas" onClick={closeMenu} className={mobileLinkClass(isActive('/recetas'))} aria-current={isActive('/recetas') ? 'page' : undefined}>Recetas con Arándanos</a>
            <a href="/blog" onClick={closeMenu} className={mobileLinkClass(isActive('/blog'))} aria-current={isActive('/blog') ? 'page' : undefined}>Noticias de Arándanos</a>
            <a href="/#planes-mensuales" onClick={closeMenu} className={mobileLinkClass(false)}>Planes Mensuales</a>
            <a href="/#sostenibilidad" onClick={closeMenu} className={mobileLinkClass(false)}>Sostenibilidad & Finca</a>
            <a href="/#faq" onClick={closeMenu} className={mobileLinkClass(false)}>Preguntas Frecuentes</a>
            <button onClick={goToContact} className={mobileLinkClass(false)}>Contacto & Finca</button>

            <div className="pt-2 border-t border-[#EADBEE] flex flex-col gap-2">
              <a
                href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20hacer%20un%20pedido%20de%20ar%C3%A1ndanos%20frescos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-lg bg-[#2F183C] text-white font-bold flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#DDA83A]" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
