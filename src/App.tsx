import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { CustomOrderSection } from './components/CustomOrderSection';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { SustainabilitySection } from './components/SustainabilitySection';
import { RecipesSection } from './components/RecipesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import { fruits, packagingOptions, addOns, subscriptionPlans } from './data/mockData';
import { CartItem, Fruit, SubscriptionPlan } from './types';

export function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedFruitForCustomOrder, setSelectedFruitForCustomOrder] = useState<string | null>(null);

  // Initial cart starts with 1 standard pack of premium blueberries, matching the original demo
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { fruit: fruits[0], quantity: 1 }
  ]);

  const handleScrollToCustomOrder = () => {
    const el = document.getElementById('pedidos-personalizados');
    if (el) {
      const offsetTop = el.getBoundingClientRect().top + window.pageYOffset - 75;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const handleScrollToCatalog = () => {
    const el = document.getElementById('variedades');
    if (el) {
      const offsetTop = el.getBoundingClientRect().top + window.pageYOffset - 75;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const handleCustomizeFruit = (fruitId: string) => {
    setSelectedFruitForCustomOrder(fruitId);
    handleScrollToCustomOrder();
  };

  const handleAddToCart = (fruit: Fruit, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.fruit.id === fruit.id);
      if (existing) {
        return prev.map(item =>
          item.fruit.id === fruit.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { fruit, quantity }];
    });
  };

  const handleUpdateCartQuantity = (fruitId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(fruitId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.fruit.id === fruitId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (fruitId: string) => {
    setCartItems(prev => prev.filter(item => item.fruit.id !== fruitId));
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    const msg = `Hola Fresh Pick Frutas! Deseo suscribirme al *${plan.title}* (${plan.weight}, $${plan.priceMonth.toLocaleString('es-CO')} COP/mes). ¿Me indican los pasos para coordinar las entregas semanales?`;
    window.open(`https://wa.me/573216920138?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-stone-900 selection:bg-blue-200 selection:text-blue-900 font-sans">
      {/* Header with announcement & navigation */}
      <Header
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateToCustomOrder={handleScrollToCustomOrder}
      />

      {/* Main Content */}
      <main>
        <Hero
          onGoToCustomOrder={handleScrollToCustomOrder}
          onExploreFruits={handleScrollToCatalog}
        />

        <ProductCatalog
          fruits={fruits}
          onAddToCart={handleAddToCart}
          onCustomizeWithFruit={handleCustomizeFruit}
        />

        <CustomOrderSection
          fruits={fruits}
          packagingOptions={packagingOptions}
          addOns={addOns}
          initialSelectedFruitId={selectedFruitForCustomOrder}
        />

        <SubscriptionPlans
          plans={subscriptionPlans}
          onSelectPlan={handleSelectPlan}
        />

        <SustainabilitySection />

        <RecipesSection />

        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onGoToCustomOrder={handleScrollToCustomOrder}
      />

      {/* Floating Action Button */}
      <FloatingWhatsApp />
    </div>
  );
}

export default App;
