import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Phone, Sparkles, ChevronRight, Leaf } from 'lucide-react';

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

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-[#143D32] text-emerald-50 text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Arándanos frescos listos para pedidos</span>
            <span className="hidden sm:inline text-emerald-200">· Cosecha del día en Guasca, Cundinamarca</span>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <span className="hidden md:inline text-emerald-200">🌱 Cuidamos tu alimento, a quien lo cultiva y nuestro planeta</span>
            <a
              href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20hacer%20un%20pedido%20de%20ar%C3%A1ndanos%20frescos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 font-semibold text-emerald-300 hover:underline"
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
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100 py-3'
            : 'bg-white border-b border-stone-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left group shrink-0"
            id="nav-logo-btn"
          >
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-white p-1 border border-stone-200/90 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <img
                src="/logo.jpg"
                alt="Fresh Pick - Logotipo de arándanos frescos de alta montaña y agricultura responsable"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1e1634] font-display">
                  Fresh Pick
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200/60">
                  Arándanos
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide">
                Arándanos de Alta Montaña
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 2xl:gap-7 text-sm font-medium text-stone-700 shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection('variedades')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Nuestros Arándanos
            </button>
            <button
              onClick={() => scrollToSection('planes-mensuales')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Planes Mensuales
            </button>
            <button
              onClick={() => scrollToSection('sostenibilidad')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Sostenibilidad
            </button>
            <button
              onClick={() => scrollToSection('recetas-tips')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Recetas
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Preguntas
            </button>
          </nav>

          {/* Action CTAs & Cart */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-cta-custom-order"
              onClick={onNavigateToCustomOrder}
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#143D32] active:scale-95 transition-all px-4 py-2.5 rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Armar Pedido</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-lg text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1B4D3E] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 mt-3 animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl">
            <button
              onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-emerald-50 hover:text-emerald-800"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection('variedades')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-emerald-50 hover:text-emerald-800"
            >
              Nuestros Arándanos
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigateToCustomOrder(); }}
              className="flex items-center justify-between w-full text-left py-3 px-3 rounded-lg bg-emerald-100/70 text-emerald-900 font-bold"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Armar Pedido de Arándanos</span>
              </div>
              <span className="bg-[#1B4D3E] text-white text-[10px] uppercase px-2 py-0.5 rounded-full">Exclusivo</span>
            </button>
            <button
              onClick={() => scrollToSection('planes-mensuales')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-emerald-50 hover:text-emerald-800"
            >
              Planes Mensuales
            </button>
            <button
              onClick={() => scrollToSection('sostenibilidad')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-emerald-50 hover:text-emerald-800"
            >
              Sostenibilidad & Finca
            </button>
            <button
              onClick={() => scrollToSection('recetas-tips')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-emerald-50 hover:text-emerald-800"
            >
              Recetas Saludables
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-emerald-50 hover:text-emerald-800"
            >
              Preguntas Frecuentes
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-emerald-50 hover:text-emerald-800"
            >
              Contacto & Finca
            </button>

            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              <a
                href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20hacer%20un%20pedido%20de%20ar%C3%A1ndanos%20frescos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-lg bg-[#1B4D3E] text-white font-semibold flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
