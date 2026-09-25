import { FruitItem, PackagingOption, AddOnItem, SubscriptionPlan, TestimonialItem, FaqItem } from '../types';

export const FRUITS_DATA: FruitItem[] = [
  {
    id: 'arandanos-125g',
    name: 'Arándanos Premium 125g',
    scientificName: 'Vaccinium corymbosum',
    variety: 'Alta Montaña · Cosecha Manual',
    category: 'frescos',
    tagline: 'Estuche individual ideal para probar y llevar a todas partes',
    description: 'Arándanos premium de alta montaña cultivados con polinización 100% natural y cosecha manual selectiva. Libres de ceras artificiales y con cero residualidad de productos químicos, garantizan la máxima frescura, textura crujiente y pureza desde el origen.',
    pricePerGram: 64, // $8.000 COP los 125g -> 64 COP/g
    defaultGramUnit: 125,
    standardPrice: 8000,
    presentation: 'Estuche 125g',
    imageUrl: '/assets/productos/estuche-arandanos-125g.jpg',
    imageAlt: 'Estuche Fresh Pick de 125g con etiqueta Premium Blueberries sobre arándanos frescos de alta montaña, cultivados con polinización 100% natural y cero residualidad química',
    brix: '13.0° – 15.0° Brix',
    altitude: 'Más de 2.800 m.s.n.m.',
    benefits: [
      'Cero residualidad química',
      'Polinización 100% natural',
      'Cosecha manual selectiva',
      'Sin ceras artificiales'
    ],
    shelfLife: '14 - 18 días en refrigeración',
    inStock: true,
    popular: false,
  },
  {
    id: 'arandanos-250g',
    name: 'Arándanos Premium 250g',
    scientificName: 'Vaccinium corymbosum',
    variety: 'Alta Montaña · Cosecha Manual',
    category: 'frescos',
    tagline: 'Formato ideal para familias pequeñas y consumo diario',
    description: 'Arándanos premium de alta montaña cultivados con polinización 100% natural y cosecha manual selectiva. Libres de ceras artificiales y con cero residualidad de productos químicos, garantizan la máxima frescura, textura crujiente y pureza desde el origen.',
    pricePerGram: 60, // $15.000 COP los 250g -> 60 COP/g
    defaultGramUnit: 250,
    standardPrice: 15000,
    presentation: 'Estuche 250g',
    imageUrl: '/assets/productos/estuche-arandanos-250g.jpg',
    imageAlt: 'Estuche Fresh Pick de 250g con etiqueta Premium Blueberries sobre arándanos frescos, cosechados a mano a más de 2.800 msnm con pruina natural intacta',
    brix: '13.0° – 15.0° Brix',
    altitude: 'Más de 2.800 m.s.n.m.',
    benefits: [
      'Cero residualidad química',
      'Polinización 100% natural',
      'Cosecha manual selectiva',
      'Sin ceras artificiales'
    ],
    shelfLife: '14 - 18 días en refrigeración',
    inStock: true,
    popular: true,
  },
  {
    id: 'arandanos-500g',
    name: 'Arándanos Premium 500g',
    scientificName: 'Vaccinium corymbosum',
    variety: 'Alta Montaña · Cosecha Manual',
    category: 'frescos',
    tagline: 'Estuche familiar, perfecto para compartir y para recetas',
    description: 'Arándanos premium de alta montaña cultivados con polinización 100% natural y cosecha manual selectiva. Libres de ceras artificiales y con cero residualidad de productos químicos, garantizan la máxima frescura, textura crujiente y pureza desde el origen.',
    pricePerGram: 60, // $30.000 COP los 500g -> 60 COP/g
    defaultGramUnit: 500,
    standardPrice: 30000,
    presentation: 'Estuche 500g',
    imageUrl: '/assets/productos/estuche-arandanos-500g.jpg',
    imageAlt: 'Estuche familiar Fresh Pick de 500g con etiqueta Premium Blueberries sobre arándanos frescos, cosechados a mano con agricultura limpia',
    brix: '13.0° – 15.0° Brix',
    altitude: 'Más de 2.800 m.s.n.m.',
    benefits: [
      'Cero residualidad química',
      'Polinización 100% natural',
      'Cosecha manual selectiva',
      'Sin ceras artificiales'
    ],
    shelfLife: '14 - 18 días en refrigeración',
    inStock: true,
    popular: false,
  }
];

export const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    id: 'pack-eco-kraft',
    name: 'Estuche Kraft Biodegradable',
    description: 'Estuche de cartón biodegradable con visor, ideal para conservar la frescura y proteger la pruina natural.',
    extraPrice: 0,
    iconName: 'Package',
    bestFor: 'Incluido sin costo en todos los pedidos',
    badge: 'Sin costo adicional'
  },
  {
    id: 'pack-clamshell-refrigerable',
    name: 'Clamshell Ventilado rPET',
    description: 'Contenedor transparente de plástico reciclado post-consumo, perfecto para guardar directamente en la nevera.',
    extraPrice: 2500,
    iconName: 'Snowflake',
    bestFor: 'Mayor duración y control de porciones'
  },
  {
    id: 'pack-canasta-regalo',
    name: 'Canasta Artesanal de Fique con Lazo',
    description: 'Canasta tejida a mano por artesanas andinas, forrada en papel encerado vegetal.',
    extraPrice: 14000,
    iconName: 'Gift',
    bestFor: 'Obsequios y detalles especiales',
    badge: 'Favorito para regalo'
  }
];

export const ADDONS_DATA: AddOnItem[] = [
  {
    id: 'miel-finca',
    name: 'Miel Cruda de Nuestras Abejas',
    description: 'Miel 100% pura y sin pasteurizar cosechada en los apiarios de polinización de la finca.',
    price: 18000,
    unit: 'Frasco de vidrio 300g',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Frasco de miel cruda pura de abejas polinizadoras de cultivos de arándanos de alta montaña con agricultura responsable'
  },
  {
    id: 'granola-artesanal',
    name: 'Granola Andina Horneada con Semillas',
    description: 'Avena integral tostada con almendras, semillas de calabaza, canela y chips de coco.',
    price: 15000,
    unit: 'Bolsa kraft resellable 350g',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Bolsa de granola andina artesanal horneada con avena integral, frutos secos y semillas'
  },
  {
    id: 'mermelada-arandanos',
    name: 'Mermelada de Arándanos 0% Azúcar',
    description: 'Preparada únicamente con nuestros arándanos de alta montaña, zumo de limón y pectina natural.',
    price: 16500,
    unit: 'Tarro gourmet 230g',
    imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Tarro de mermelada artesanal 0% azúcar añadida elaborada con arándanos frescos de alta montaña'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-mensual-fresco',
    title: 'Plan Mensual Fresco',
    subtitle: 'Para los que quieren arándano fresco cada semana del mes.',
    weight: '2.000g al mes (4 entregas de 500g)',
    priceMonth: 144000,
    deliveryFrequency: 'Semanal · 500g por entrega',
    idealFor: 'Hogares y consumo semanal',
    features: [
      'Entregas semanales de 500g garantizan arándano fresco cada semana',
      'Estuche 500g por despacho',
      'Cosechado en su punto óptimo de madurez',
      'Cancela o pausa cuando quieras'
    ],
    isPopular: true
  },
  {
    id: 'plan-mensual-salud',
    title: 'Plan Mensual Salud',
    subtitle: 'Pensado para familias que prefieren entregas quincenales en mayor cantidad.',
    weight: '2.000g al mes (2 entregas de 1.000g)',
    priceMonth: 132000,
    deliveryFrequency: 'Quincenal · 1.000g por entrega',
    idealFor: 'Familias y stock de temporada',
    features: [
      'Entregas quincenales de 1.000g',
      'Mejor precio por gramo',
      'Estuche 500g (2 unidades por entrega)',
      'Cancela o pausa cuando quieras'
    ]
  },
  {
    id: 'plan-mensual-flexible-fresco',
    title: 'Plan Mensual Flexible Fresco',
    subtitle: 'Estuches individuales de 125g servidos semanalmente para máxima frescura.',
    weight: '2.000g al mes (8 entregas de 250g)',
    priceMonth: 152000,
    deliveryFrequency: 'Semanal · 250g por entrega (estuche 125g x 2)',
    idealFor: 'Personas solas o parejas',
    features: [
      'Entregas semanales en estuches 125g x 2',
      'Porciones prácticas listas para consumir',
      'Mayor frescura al recibir fruta cada semana',
      'Cancela o pausa cuando quieras'
    ]
  },
  {
    id: 'plan-mensual-flexible-salud',
    title: 'Plan Mensual Flexible Salud',
    subtitle: 'Estuches individuales servidos quincenalmente para quienes prefieren abastecerse menos veces.',
    weight: '2.000g al mes (2 entregas de 1.000g)',
    priceMonth: 140000,
    deliveryFrequency: 'Quincenal · 1.000g por entrega (estuche 125g x 8)',
    idealFor: 'Quincenas y consumo moderado',
    features: [
      'Entregas quincenales en estuches 125g x 8',
      'Estuches individuales para control de porciones',
      'Equilibrio entre frescura y conveniencia',
      'Cancela o pausa cuando quieras'
    ]
  }
];

export const CERTIFICATIONS_LIST = [
  {
    id: 'global-gap',
    title: 'GLOBALG.A.P.',
    code: 'Inocuidad alimentaria internacional',
    description: 'Estándar internacional de referencia que certifica inocuidad alimentaria rigurosa, trazabilidad completa de cosecha y sostenibilidad ambiental.'
  },
  {
    id: 'grasp',
    title: 'GRASP',
    code: 'Evaluación de prácticas sociales',
    description: 'Módulo auditado de responsabilidad social que garantiza el bienestar, salud, seguridad y derechos laborales justos de nuestros trabajadores agrícolas.'
  },
  {
    id: 'ica-predio',
    title: 'ICA Predio Exportador',
    code: 'Registro sanitario de producción',
    description: 'Acreditación oficial del Instituto Colombiano Agropecuario como predio productor habilitado para exportación.'
  },
  {
    id: 'ica-bpa',
    title: 'ICA BPA',
    code: 'Buenas Prácticas Agrícolas',
    description: 'Certificación del ICA en Buenas Prácticas Agrícolas: producción limpia, inocua y libre de contaminantes.'
  }
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Carolina Velásquez',
    role: 'Chef Pastelera & Propietaria de Café Dulce Cacao',
    city: 'Bogotá, Colombia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    imageAlt: 'Carolina Velásquez, chef pastelera cliente de arándanos frescos de alta montaña Fresh Pick en Bogotá',
    rating: 5,
    comment: 'Trabajar con Fresh Pick cambió el estándar de nuestras tartaletas. El calibre de los arándanos es gigante y nunca vienen húmedos ni golpeados. El pedido personalizado nos permite pedir la fruta en su punto exacto.',
    verifiedOrder: 'Pedido Personalizado recurrente (4 kg/semana)'
  },
  {
    id: 'test-2',
    name: 'Dr. Santiago Restrepo',
    role: 'Médico Deportólogo y Maratonista',
    city: 'Medellín, Colombia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    imageAlt: 'Dr. Santiago Restrepo, médico deportólogo que consume arándanos de alta montaña cultivados con agricultura responsable',
    rating: 5,
    comment: 'Estoy suscrito al Plan Mensual Fresco y la calidad es constante: cada martes llega fruta crujiente, dulce y con la pruina intacta. Lo recomiendo para familias que quieren incorporar antioxidantes reales a su dieta diaria.',
    verifiedOrder: 'Suscripción Plan Mensual Fresco'
  },
  {
    id: 'test-3',
    name: 'Mariana Duarte',
    role: 'Nutricionista Clínica',
    city: 'Chía, Cundinamarca',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    imageAlt: 'Mariana Duarte, nutricionista clínica que recomienda arándanos frescos de alta montaña y agricultura limpia',
    rating: 5,
    comment: 'Recomiendo Fresh Pick a mis pacientes por la transparencia de su proceso: cero ceras, cero residuos y la polinización natural se nota en el sabor. Mis pacientes diabéticos lo toleran perfecto por su bajo índice glucémico.',
    verifiedOrder: 'Plan Mensual Fresco'
  }
];

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'pedidos',
    question: '¿Cuál es el pedido mínimo y condiciones de envío?',
    answer: 'El pedido mínimo total para entrega a domicilio es de 500g. Puedes combinar formatos como desees. Por motivos de logística y seguridad en el empaque: los estuches de 125g y 250g se deben pedir obligatoriamente en múltiplos de 2 unidades (ej: 2, 4, 6); los de 500g se pueden pedir desde 1 unidad en adelante.'
  },
  {
    id: 'faq-2',
    category: 'pedidos',
    question: '¿Cómo puedo hacer un pedido?',
    answer: 'Puedes hacer tu pedido directamente desde la sección "Armar Pedido" de esta página o escribirnos por WhatsApp al +57 317 893 1026. Te confirmaremos disponibilidad, fecha de despacho y forma de pago.'
  },
  {
    id: 'faq-3',
    category: 'entregas',
    question: '¿Qué días y en qué horario entregan?',
    answer: 'Realizamos entregas los martes y miércoles de 8:00 a.m. a 3:00 p.m. en la zona de cobertura. Para eventos o pedidos especiales coordinamos la fecha directamente contigo.'
  },
  {
    id: 'faq-4',
    category: 'entregas',
    question: '¿Cuánto cuesta el envío?',
    answer: 'El costo de envío base es de $6.000 COP dentro de nuestra zona de cobertura. El envío gratis no aplica actualmente.'
  },
  {
    id: 'faq-5',
    category: 'pagos',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos transferencia bancaria y Bre-B a la cuenta @9010401617. Tras confirmar el pago programamos tu despacho.'
  },
  {
    id: 'faq-6',
    category: 'calidad',
    question: '¿Qué garantía de frescura tienen?',
    answer: 'Garantizamos arándanos frescos o te los reemplazamos. Si al recibir tu pedido la fruta no cumple el estándar de calidad que prometemos, escríbenos por WhatsApp y gestionaremos el cambio o reembolso a la mayor brevedad.'
  },
  {
    id: 'faq-7',
    category: 'calidad',
    question: '¿Por qué son más dulces y crocantes sus arándanos?',
    answer: 'Nuestros cultivos están a más de 2.800 m.s.n.m. en la Cordillera Oriental. La amplitud térmica entre el día y la noche concentra azúcares naturales y produce bayas más firmes, con pruina natural intacta.'
  },
  {
    id: 'faq-8',
    category: 'pedidos',
    question: '¿Tienen planes mensuales o suscripciones?',
    answer: 'Sí, ofrecemos 4 planes mensuales de 2.000g al mes (Plan Mensual Fresco, Plan Mensual Salud, Plan Mensual Flexible Fresco y Plan Mensual Flexible Salud) con entregas semanales o quincenales. Puedes suscribirte desde la sección de Planes Mensuales.'
  }
];
