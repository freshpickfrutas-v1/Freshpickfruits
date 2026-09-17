import { FruitItem, PackagingOption, AddOnItem, SubscriptionPlan, RecipeItem, TestimonialItem, FaqItem } from '../types';

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
    imageUrl: '/assets/blueberries.jpg',
    imageAlt: 'Arándanos premium de alta montaña Fresh Pick en estuche de 125g, cultivados con polinización 100% natural y cero residualidad química',
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
    imageUrl: '/assets/blueberries.jpg',
    imageAlt: 'Arándanos premium de alta montaña Fresh Pick en estuche de 250g, cosechados a mano a más de 2.800 msnm con pruina natural intacta',
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
    imageUrl: '/assets/blueberries.jpg',
    imageAlt: 'Arándanos premium de alta montaña Fresh Pick en estuche familiar de 500g, cosechados a mano con agricultura limpia',
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

export const RECIPES_DATA: RecipeItem[] = [
  {
    id: 'muffins-arandanos',
    title: 'Muffins de Arándanos Suaves y Esponjosos',
    prepTime: '35 min',
    difficulty: 'Intermedio',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Muffins de arándanos frescos de alta montaña horneados, esponjosos y dorados, elaborados con receta profesional',
    description: 'Muffins clásicos de arándanos con miga esponjosa, logrados mediante un batido inicial riguroso y horneado de choque que garantiza volumen y textura profesional.',
    ingredients: [
      '250 g de harina de trigo',
      '2 cucharaditas (10 g) de levadura química (polvos de hornear)',
      '150 g de azúcar',
      '60 g de mantequilla blanda',
      '250 ml de leche',
      '2 huevos',
      'Ralladura de limón al gusto',
      '150 g de arándanos frescos'
    ],
    instructions: [
      'Areado: bate los huevos con el azúcar durante un mínimo de 3 minutos hasta obtener una mezcla notablemente esponjosa.',
      'Integra la mantequilla, la leche y la ralladura de limón.',
      'Mezcla la harina con la levadura e intégrala suavemente.',
      'Enharina ligeramente los arándanos para evitar que decanten al fondo del molde.',
      'Reposa la masa en refrigeración por 30 minutos.',
      'Precalienta el horno a 210°C. Llena los moldes a 2/3 y hornea los primeros 5 minutos a 210°C; luego reduce a 180°C por 15-20 minutos más (total 20-25 min).'
    ]
  },
  {
    id: 'panqueques-arandanos',
    title: 'Panqueques de Arándanos con Limón y Amapola',
    prepTime: '25 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Panqueques esponjosos con arándanos frescos, ralladura de limón y semillas de amapola, recién hechos en sartén',
    description: 'Panqueques equilibrados que destacan por el crujiente de la semilla de amapola y la frescura cítrica del limón, con arándanos enteros caramelizados en la superficie.',
    ingredients: [
      '270 g de harina (sin polvos)',
      '2 cucharaditas de polvos de hornear',
      '100 g de azúcar',
      '1 cucharadita de sal',
      'Ralladura de 1 limón',
      '1 huevo',
      '300 ml de leche',
      '1/2 cucharadita de esencia de vainilla',
      '10 g de mantequilla sin sal (derretida)',
      '100 g de arándanos frescos o congelados escurridos',
      '2 cucharaditas de semillas de amapola'
    ],
    instructions: [
      'Combina harina, sal, azúcar, polvos y ralladura. Forma un hoyo central (método de volcán).',
      'Vierte leche, huevo y vainilla en el centro. Mezcla gradualmente desde el interior para evitar grumos.',
      'Añade la mantequilla derretida en forma de hilo mientras bates. Incorpora los arándanos y las semillas de amapola con espátula.',
      'Cocina en sartén antiadherente a fuego medio-bajo. Voltea únicamente cuando aparezcan burbujas en la superficie.'
    ]
  },
  {
    id: 'ponque-limon-arandanos',
    title: 'Ponqué de Limón y Arándanos Súper Húmedo',
    prepTime: '1 h 15 min',
    difficulty: 'Intermedio',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Ponqué húmedo de limón y arándanos frescos glaseado, recién horneado con textura esponjosa',
    description: 'Budín de textura súper húmeda gracias a la combinación de yogur griego y aceite de oliva, con arándanos frescos y un glaseado de limón aplicado solo cuando el ponqué está frío.',
    ingredients: [
      '2 tazas de harina de trigo (reservar 2 cucharadas para la fruta)',
      '3/4 taza (150 g) de azúcar',
      '1 taza de yogur griego',
      '2/3 taza de aceite de oliva',
      '2 huevos',
      '2 cucharaditas de polvo de hornear',
      '1 pizca de sal',
      '1 taza de arándanos frescos',
      'Ralladura de 2 limones',
      'Glaseado: 1 taza de azúcar pulverizada + 2-3 cucharadas de limón'
    ],
    instructions: [
      'Bate yogur, aceite y huevos. Suma el azúcar y la ralladura (solo la parte verde para evitar amargor).',
      'Cierne harina, polvo y sal. Extrae las 2 cucharadas de harina reservadas y cubre con ellas los arándanos (evita el exceso de secos en la masa final).',
      'Mezcla con espátula. Prohibido batir en exceso para no activar el gluten y comprometer la esponjosidad.',
      'Hornea en molde de 20x10 cm a 180°C por 55 minutos.',
      'Glaseado: mezcla azúcar pulverizada con limón y bate vigorosamente hasta obtener textura lisa y densa. Vierte solo cuando el ponqué esté totalmente frío sobre rejilla.'
    ]
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
    question: '¿Cuál es el pedido mínimo?',
    answer: 'El pedido mínimo para entrega a domicilio es de 500g de arándanos. Puedes combinar estuches de 125g para alcanzarlo o elegir el estuche de 500g directamente.'
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
