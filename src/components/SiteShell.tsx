import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { useCart } from '../context/CartContext';
import { goToHomeSection } from '../lib/router';

interface SiteShellProps {
  children: React.ReactNode;
  /** Overrides the default "Armar Pedido" action (the home page scrolls in place). */
  onNavigateToCustomOrder?: () => void;
}

/** Common page frame: navigation, footer, cart drawer and WhatsApp button. */
export const SiteShell: React.FC<SiteShellProps> = ({ children, onNavigateToCustomOrder }) => {
  const cart = useCart();
  const goToCustomOrder = onNavigateToCustomOrder ?? (() => goToHomeSection('pedidos-personalizados'));

  return (
    <div className="min-h-screen flex flex-col bg-transparent lg:w-[calc(100%-5rem)] lg:max-w-[1440px] lg:mx-auto lg:shadow-2xl lg:shadow-[#2F183C]/30 text-stone-900 font-sans selection:bg-[#2F183C] selection:text-[#DDA83A]">
      <Navbar
        cartItemCount={cart.totalCount}
        onOpenCart={() => cart.setOpen(true)}
        onNavigateToCustomOrder={goToCustomOrder}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setOpen(false)}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeFromCart}
        onGoToCustomOrder={goToCustomOrder}
      />
      <FloatingWhatsApp />
    </div>
  );
};
