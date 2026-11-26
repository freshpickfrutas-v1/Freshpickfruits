// Traducción al inglés del catálogo, planes y preguntas de mockData.ts. Se aplican por `id`;
// lo que no tenga traducción (por ejemplo un producto nuevo creado en /admin) se muestra en español.
import type { Lang } from '../lib/i18n';

type Overlay<T> = Record<string, Partial<T>>;

const COMMON_DESC =
  'Premium high-mountain blueberries grown with 100% natural pollination and selective hand harvesting. Free of artificial waxes and with zero chemical residues, they guarantee maximum freshness, crisp texture and purity from the source.';
const COMMON_BENEFITS = ['Zero chemical residues', '100% natural pollination', 'Selective hand harvesting', 'No artificial waxes'];
const COMMON = {
  scientificName: 'Vaccinium corymbosum',
  variety: 'High Mountain · Hand-picked',
  description: COMMON_DESC,
  altitude: 'Over 2,800 m above sea level',
  benefits: COMMON_BENEFITS,
  shelfLife: '14 - 18 days refrigerated'
};

export const FRUITS_EN: Overlay<import('../types').FruitItem> = {
  'arandanos-125g': {
    ...COMMON,
    name: 'Premium Blueberries 125 g',
    tagline: 'Single-serve box, ideal to try and take anywhere',
    presentation: '125 g box',
    imageAlt: 'Fresh Pick 125 g box with Premium Blueberries label over fresh high-mountain blueberries grown with 100% natural pollination and zero chemical residues'
  },
  'arandanos-250g': {
    ...COMMON,
    name: 'Premium Blueberries 250 g',
    tagline: 'Ideal size for small families and daily snacking',
    presentation: '250 g box',
    imageAlt: 'Fresh Pick 250 g box with Premium Blueberries label over fresh blueberries hand-picked above 2,800 m with natural bloom intact'
  },
  'arandanos-500g': {
    ...COMMON,
    name: 'Premium Blueberries 500 g',
    tagline: 'Family box, perfect for sharing and for recipes',
    presentation: '500 g box',
    imageAlt: 'Fresh Pick 500 g family box with Premium Blueberries label over fresh, hand-picked blueberries grown with clean farming'
  }
};

export const PACKAGING_EN: Overlay<import('../types').PackagingOption> = {
  'pack-eco-kraft': {
    name: 'Biodegradable Kraft Box',
    description: 'Biodegradable cardboard box with a window, ideal to keep the fruit fresh and protect its natural bloom.',
    bestFor: 'Included at no cost in every order',
    badge: 'No extra cost'
  },
  'pack-clamshell-refrigerable': {
    name: 'Ventilated rPET Clamshell',
    description: 'Clear container made of post-consumer recycled plastic, perfect to store straight in the fridge.',
    bestFor: 'Longer shelf life and portion control'
  },
  'pack-canasta-regalo': {
    name: 'Handwoven Fique Basket with Ribbon',
    description: 'Basket handwoven by Andean artisans, lined with vegetable wax paper.',
    bestFor: 'Gifts and special occasions',
    badge: 'Gift favorite'
  }
};

export const ADDONS_EN: Overlay<import('../types').AddOnItem> = {
  'miel-finca': {
    name: 'Raw Honey from Our Bees',
    description: '100% pure, unpasteurized honey harvested from the pollination apiaries on our farm.',
    unit: '300 g glass jar',
    imageAlt: 'Jar of pure raw honey from the bees that pollinate our high-mountain blueberry crops, grown with responsible farming'
  },
  'granola-artesanal': {
    name: 'Baked Andean Granola with Seeds',
    description: 'Toasted whole oats with almonds, pumpkin seeds, cinnamon and coconut chips.',
    unit: '350 g resealable kraft bag',
    imageAlt: 'Bag of baked artisan Andean granola with whole oats, nuts and seeds'
  },
  'mermelada-arandanos': {
    name: 'Blueberry Jam, 0% Sugar',
    description: 'Made only with our high-mountain blueberries, lemon juice and natural pectin.',
    unit: '230 g gourmet jar',
    imageAlt: 'Jar of artisan jam with no added sugar, made with fresh high-mountain blueberries'
  }
};

export const PLANS_EN: Overlay<import('../types').SubscriptionPlan> = {
  'plan-mensual-fresco': {
    title: 'Monthly Fresh Plan',
    subtitle: 'For those who want fresh blueberries every week of the month.',
    weight: '2,000 g per month (4 deliveries of 500 g)',
    deliveryFrequency: 'Weekly · 500 g per delivery',
    idealFor: 'Households and weekly eating',
    features: [
      'Weekly 500 g deliveries guarantee fresh blueberries every week',
      '500 g box per shipment',
      'Picked at peak ripeness',
      'Cancel or pause any time'
    ]
  },
  'plan-mensual-salud': {
    title: 'Monthly Health Plan',
    subtitle: 'Designed for families who prefer larger, bi-weekly deliveries.',
    weight: '2,000 g per month (2 deliveries of 1,000 g)',
    deliveryFrequency: 'Every two weeks · 1,000 g per delivery',
    idealFor: 'Families and seasonal stock',
    features: ['Bi-weekly 1,000 g deliveries', 'Best price per gram', '500 g boxes (2 units per delivery)', 'Cancel or pause any time']
  },
  'plan-mensual-flexible-fresco': {
    title: 'Monthly Flexible Fresh Plan',
    subtitle: 'Individual 125 g boxes delivered weekly for maximum freshness.',
    weight: '2,000 g per month (8 deliveries of 250 g)',
    deliveryFrequency: 'Weekly · 250 g per delivery (125 g box x 2)',
    idealFor: 'Singles or couples',
    features: [
      'Weekly deliveries in 125 g x 2 boxes',
      'Handy ready-to-eat portions',
      'Greater freshness by receiving fruit every week',
      'Cancel or pause any time'
    ]
  },
  'plan-mensual-flexible-salud': {
    title: 'Monthly Flexible Health Plan',
    subtitle: 'Individual boxes delivered every two weeks for those who prefer to stock up less often.',
    weight: '2,000 g per month (2 deliveries of 1,000 g)',
    deliveryFrequency: 'Every two weeks · 1,000 g per delivery (125 g box x 8)',
    idealFor: 'Bi-weekly and moderate eating',
    features: [
      'Bi-weekly deliveries in 125 g x 8 boxes',
      'Individual boxes for portion control',
      'A balance between freshness and convenience',
      'Cancel or pause any time'
    ]
  }
};

export const CERTIFICATIONS_EN: Overlay<{ title: string; code: string; description: string }> = {
  'global-gap': {
    code: 'International food safety',
    description: 'Leading international standard certifying rigorous food safety, full harvest traceability and environmental sustainability.'
  },
  grasp: {
    code: 'Social practice assessment',
    description: 'Audited social responsibility module that guarantees the well-being, health, safety and fair labor rights of our farm workers.'
  },
  'ica-predio': {
    title: 'ICA Export Farm',
    code: 'Production health registry',
    description: 'Official accreditation from the Colombian Agricultural Institute (ICA) as a production farm authorized for export.'
  },
  'ica-bpa': {
    title: 'ICA GAP',
    code: 'Good Agricultural Practices',
    description: 'ICA certification in Good Agricultural Practices: clean, safe production free of contaminants.'
  }
};

export const FAQ_EN: Overlay<import('../types').FaqItem> = {
  'faq-1': {
    question: 'What is the minimum order and what are the shipping conditions?',
    answer:
      'The minimum total order for home delivery is 500 g. You can combine sizes as you like. For packing logistics and safety, 125 g and 250 g boxes must be ordered in multiples of 2 units (e.g. 2, 4, 6); 500 g boxes can be ordered from 1 unit.'
  },
  'faq-2': {
    question: 'How can I place an order?',
    answer:
      'You can order directly from the "Build Your Order" section of this page or message us on WhatsApp at +57 317 893 1026. We will confirm availability, dispatch date and payment method.'
  },
  'faq-3': {
    question: 'Which days and hours do you deliver?',
    answer:
      'We deliver in Bogotá D.C. only, on Tuesdays and Wednesdays from 8:00 a.m. to 3:00 p.m. The first available date is 8 days after placing the order, depending on your address and the courier route. For events or special orders we agree on the date with you directly.'
  },
  'faq-4': {
    question: 'How much does shipping cost?',
    answer: 'Delivery is always COP $7,000. If you pay online, a 5% payment gateway fee is added. We do not offer free shipping.'
  },
  'faq-5': {
    question: 'Which payment methods do you accept?',
    answer: 'We accept bank transfer and Bre-B to the account @9010401617. Once payment is confirmed we schedule your dispatch.'
  },
  'faq-6': {
    question: 'What freshness guarantee do you offer?',
    answer:
      'We guarantee fresh blueberries or we replace them. If the fruit does not meet the quality standard we promise when your order arrives, message us on WhatsApp and we will arrange a replacement or refund as soon as possible.'
  },
  'faq-7': {
    question: 'Why are your blueberries sweeter and crunchier?',
    answer:
      'Our crops grow above 2,800 m in the Eastern Andes. The temperature swing between day and night concentrates natural sugars and produces firmer berries with their natural bloom intact.'
  },
  'faq-8': {
    question: 'Do you have monthly plans or subscriptions?',
    answer:
      'Yes, we offer 4 monthly plans of 2,000 g per month (Monthly Fresh Plan, Monthly Health Plan, Monthly Flexible Fresh Plan and Monthly Flexible Health Plan) with weekly or bi-weekly deliveries. You can subscribe from the Monthly Plans section.'
  },
  'faq-9': {
    question: 'Do you deliver to my neighborhood or to other cities?',
    answer:
      'Home delivery is only within Bogotá D.C., from south to north between calle 13 and calle 192, and from east to west between carrera 5 este and carrera 85. We do not deliver to nearby towns such as Chía, Soacha or Cajicá. Message us your address on WhatsApp at +57 317 893 1026 and we will confirm. For other cities in Colombia we offer wholesale (minimum order of 1 pallet).'
  }
};

export const FAQ_CATEGORIES_EN: Record<string, string> = {
  pedidos: 'Orders',
  entregas: 'Deliveries',
  pagos: 'Payments',
  calidad: 'Quality'
};

/** Aplica la traducción a una lista de elementos con `id`. En español devuelve la lista tal cual. */
export function localizeList<T extends { id: string }>(list: T[], overlay: Overlay<T>, lang: Lang): T[] {
  if (lang !== 'en') return list;
  return list.map(item => (overlay[item.id] ? { ...item, ...overlay[item.id] } : item));
}
