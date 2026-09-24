import React, { useState } from 'react';
import { FRUITS_DATA, PACKAGING_OPTIONS, ADDONS_DATA, SUBSCRIPTION_PLANS } from '../data/mockData';
import { SubscriptionPlan } from '../types';
import { Hero } from '../components/Hero';
import { FruitCatalog } from '../components/FruitCatalog';
import { CustomOrderSection } from '../components/CustomOrderSection';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { AboutAndSustainability } from '../components/AboutAndSustainability';
import { RecipesAndTips } from '../components/RecipesAndTips';
import { TestimonialsAndFaq } from '../components/TestimonialsAndFaq';
import { StructuredData } from '../components/StructuredData';
import { SiteShell } from '../components/SiteShell';
import { useCart } from '../context/CartContext';
import { scrollToId } from '../lib/router';

export default function PublicHome() {
  const { addToCart } = useCart();
  const [preselectedFruitForCustom, setPreselectedFruitForCustom] = useState<string | null>(null);

  const scrollToCustomOrder = (fruitId?: string) => {
    if (fruitId) setPreselectedFruitForCustom(fruitId);
    scrollToId('pedidos-personalizados');
  };

  const handleSelectSubscriptionPlan = (plan: SubscriptionPlan) => {
    const message = `Hola Fresh Pick! Deseo suscribirme al *${plan.title}* (${plan.weight} por $${plan.priceMonth.toLocaleString('es-CO')} COP/mes). Por favor indíquenme cómo activar mi suscripción de arándanos.`;
    window.open(`https://wa.me/573178931026?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <SiteShell onNavigateToCustomOrder={() => scrollToCustomOrder()}>
      <StructuredData />
      <Hero
        onGoToCustomOrder={() => scrollToCustomOrder()}
        onExploreFruits={() => scrollToId('variedades')}
      />
      <FruitCatalog
        fruits={FRUITS_DATA}
        onAddToCart={addToCart}
        onCustomizeWithFruit={(fruitId) => scrollToCustomOrder(fruitId)}
      />
      <CustomOrderSection
        fruits={FRUITS_DATA}
        packagingOptions={PACKAGING_OPTIONS}
        addOns={ADDONS_DATA}
        initialSelectedFruitId={preselectedFruitForCustom}
      />
      <SubscriptionPlans
        plans={SUBSCRIPTION_PLANS}
        onSelectPlan={handleSelectSubscriptionPlan}
      />
      <AboutAndSustainability />
      <RecipesAndTips />
      <TestimonialsAndFaq />
    </SiteShell>
  );
}
