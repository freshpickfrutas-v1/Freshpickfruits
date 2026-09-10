import React, { useState, useEffect } from 'react';
import { Leaf, Sparkles, ChevronRight, ShoppingBag, Menu, X, Phone } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onNavigateToCustomOrder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onOpenCart,
  onNavigateToCustomOrder
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-blue-950 text-blue-100 text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-medium">Cosecha matutina de hoy:</span>
            <span className="hidden sm:inline text-blue-200">
              Arándanos Biloxi y Moras silvestres listas para despacho
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <span className="hidden md:inline text-blue-200">🌱 100% Polinización Natural</span>
            <a
              href="https://wa.me/573216920138?text=Hola%20Fresh%20Pick%20Frutas,%20quiero%20hacer%20un%20pedido%20de%20frutas%20frescas"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 font-semibold text-blue-300 hover:underline"
            >
              <Phone className="w-3 h-3" />
              <span>WhatsApp: +57 321 692 0138</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-blue-100 py-3'
            : 'bg-white border-b border-stone-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            id="nav-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-800/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-950 font-display">
                  Fresh Pick
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Frutas
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide">
                Arándanos & Frutas de Alta Montaña
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-blue-700 transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection('variedades')}
              className="hover:text-blue-700 transition-colors cursor-pointer"
            >
              Nuestras Frutas
            </button>
            <button
              onClick={() => scrollToSection('pedidos-personalizados')}
              className="flex items-center gap-1.5 text-blue-800 font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
              <span>Pedidos Personalizados</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                Nuevo
              </span>
            </button>
            <button
              onClick={() => scrollToSection('planes-mensuales')}
              className="hover:text-blue-700 transition-colors cursor-pointer"
            >
              Planes Mensuales
            </button>
            <button
              onClick={() => scrollToSection('sostenibilidad')}
              className="hover:text-blue-700 transition-colors cursor-pointer"
            >
              Sostenibilidad & Finca
            </button>
            <button
              onClick={() => scrollToSection('recetas-tips')}
              className="hover:text-blue-700 transition-colors cursor-pointer"
            >
              Recetas & Tips
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-blue-700 transition-colors cursor-pointer"
            >
              Preguntas
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="header-cta-custom-order"
              onClick={onNavigateToCustomOrder}
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-95 transition-all px-4 py-2.5 rounded-lg shadow-sm hover:shadow-blue-700/20 cursor-pointer"
            >
              <span>Armar Pedido</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-lg text-stone-700 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 mt-3 animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection('variedades')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
            >
              Nuestras Frutas y Variedades
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToCustomOrder();
              }}
              className="flex items-center justify-between w-full text-left py-3 px-3 rounded-lg bg-blue-100/70 text-blue-900 font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>Armar Pedido Personalizado</span>
              </div>
              <span className="bg-blue-700 text-white text-[10px] uppercase px-2 py-0.5 rounded-full">
                Exclusivo
              </span>
            </button>
            <button
              onClick={() => scrollToSection('planes-mensuales')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
            >
              Planes Mensuales
            </button>
            <button
              onClick={() => scrollToSection('sostenibilidad')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
            >
              Sostenibilidad & Finca
            </button>
            <button
              onClick={() => scrollToSection('recetas-tips')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
            >
              Recetas Saludables
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
            >
              Preguntas Frecuentes
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-stone-800 font-medium hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
            >
              Contacto & Finca
            </button>
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              <a
                href="https://wa.me/573216920138?text=Hola%20Fresh%20Pick%20Frutas,%20quiero%20hacer%20un%20pedido%20de%20frutas%20frescas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
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
