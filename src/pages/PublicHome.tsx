import React, { useMemo, useState } from 'react';
import { PACKAGING_OPTIONS, ADDONS_DATA, SUBSCRIPTION_PLANS } from '../data/mockData';
import { SubscriptionPlan } from '../types';
import { Hero } from '../components/Hero';
import { FruitCatalog } from '../components/FruitCatalog';
import { CustomOrderSection } from '../components/CustomOrderSection';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { AboutAndSustainability } from '../components/AboutAndSustainability';
import { RecipesAndTips } from '../components/RecipesAndTips';
import { LatestNews } from '../components/LatestNews';
import { TestimonialsAndFaq } from '../components/TestimonialsAndFaq';
import { StructuredData } from '../components/StructuredData';
import { SiteShell } from '../components/SiteShell';
import { useCart } from '../context/CartContext';
import { scrollToId } from '../lib/router';
import { useCatalog } from '../lib/catalog';
import { usePageMeta } from '../lib/seo';
import { useLang, useT } from '../lib/i18n';
import { ADDONS_EN, PACKAGING_EN, PLANS_EN, localizeList } from '../data/mockData.en';

export default function PublicHome() {
  const t = useT();
  const lang = useLang();
  usePageMeta({
    title: t('Fresh Pick - Arándanos Premium de Alta Montaña | Guasca, Colombia', 'Fresh Pick - Premium High-Mountain Blueberries | Guasca, Colombia'),
    description: t('Arándanos premium de alta montaña cultivados a más de 2.800 m.s.n.m. en Guasca, Cundinamarca. Polinización 100% natural, sin ceras, sin residuos químicos. Entrega a domicilio en Bogotá martes y miércoles. Pedidos por WhatsApp +57 317 893 1026.', 'Premium high-mountain blueberries grown above 2,800 m in Guasca, Cundinamarca, Colombia. 100% natural pollination, no waxes, no chemical residues. Home delivery in Bogotá on Tuesdays and Wednesdays. Orders on WhatsApp +57 317 893 1026. Wholesale and export available.'),
    path: '/',
  });
  const { addToCart } = useCart();
  const catalog = useCatalog();
  // The custom order builder only offers products that are in stock.
  const orderable = useMemo(() => catalog.filter(f => f.inStock !== false), [catalog]);
  const [preselectedFruitForCustom, setPreselectedFruitForCustom] = useState<string | null>(null);

  const scrollToCustomOrder = (fruitId?: string) => {
    if (fruitId) setPreselectedFruitForCustom(fruitId);
    scrollToId('pedidos-personalizados');
  };

  const handleSelectSubscriptionPlan = (plan: SubscriptionPlan) => {
    const message = t(`Hola Fresh Pick! Deseo suscribirme al *${plan.title}* (${plan.weight} por $${plan.priceMonth.toLocaleString('es-CO')} COP/mes). Por favor indíquenme cómo activar mi suscripción de arándanos.`, `Hello Fresh Pick! I would like to subscribe to the *${plan.title}* (${plan.weight} for COP $${plan.priceMonth.toLocaleString('en-US')}/month). Please tell me how to activate my blueberry subscription.`);
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
        fruits={catalog}
        onAddToCart={addToCart}
        onCustomizeWithFruit={(fruitId) => scrollToCustomOrder(fruitId)}
      />
      <CustomOrderSection
        fruits={orderable}
        packagingOptions={localizeList(PACKAGING_OPTIONS, PACKAGING_EN, lang)}
        addOns={localizeList(ADDONS_DATA, ADDONS_EN, lang)}
        initialSelectedFruitId={preselectedFruitForCustom}
      />
      <RecipesAndTips />
      <LatestNews />
      <SubscriptionPlans
        plans={localizeList(SUBSCRIPTION_PLANS, PLANS_EN, lang)}
        onSelectPlan={handleSelectSubscriptionPlan}
      />
      <AboutAndSustainability />
      <TestimonialsAndFaq />
    </SiteShell>
  );
}
