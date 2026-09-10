import { Fruit, PackagingOption, AddOn, SubscriptionPlan, Certification, Recipe, Testimonial, FAQ } from '../types';

export const fruits: Fruit[] = [
  {
    "id": "arandanos-premium",
    "name": "Arándanos Biloxi & Emerald",
    "scientificName": "Vaccinium corymbosum",
    "variety": "Biloxi / Emerald Alta Montaña",
    "category": "berries",
    "tagline": "Crocantes, dulces y de calibre extra grande",
    "description": "Nuestra fruta insignia. Cultivados a más de 2.450 m.s.n.m. bajo sol andino y neblina matutina, lo que potencia su concentración de antioxidantes y produce una pruina natural perfecta.",
    "pricePerGram": 28,
    "defaultGramUnit": 250,
    "standardPrice": 7000,
    "presentation": "Clamshell ventilado 250g",
    "imageUrl": "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80",
    "brix": "14.5° - 16° Brix",
    "altitude": "2.480 m.s.n.m.",
    "benefits": [
      "Rico en antocianinas",
      "Mejora la memoria y concentración",
      "Bajo índice glucémico",
      "100% libre de ceras artificiales"
    ],
    "shelfLife": "14 - 18 días en refrigeración",
    "inStock": true,
    "popular": true
  },
  {
    "id": "moras-castilla",
    "name": "Mora de Castilla Silvestre",
    "scientificName": "Rubus glaucus",
    "variety": "Castilla Seleccionada sin Espinas",
    "category": "berries",
    "tagline": "Sabor andino intenso con balance cítrico insuperable",
    "description": "Cosechada cuidadosamente a mano en su punto exacto de maduración. Fruto carnoso, jugoso, ideal para jugos vivos, repostería gourmet y mermeladas artesanales.",
    "pricePerGram": 18,
    "defaultGramUnit": 250,
    "standardPrice": 4500,
    "presentation": "Canastilla protectora 250g",
    "imageUrl": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    "brix": "11° - 13° Brix",
    "altitude": "2.350 m.s.n.m.",
    "benefits": [
      "Alta fuente de Vitamina C",
      "Potente antiinflamatorio natural",
      "Excelente para la salud cardiovascular"
    ],
    "shelfLife": "7 - 9 días en refrigeración",
    "inStock": true,
    "popular": true
  },
  {
    "id": "frambuesas-heritage",
    "name": "Frambuesas Heritage Rubí",
    "scientificName": "Rubus idaeus",
    "variety": "Heritage Andina",
    "category": "berries",
    "tagline": "Aroma delicado, textura aterciopelada y color rubí brillante",
    "description": "Fruta exquisita y frágil protegida con empaques acolchados especiales. Cada bocado estalla en boca con notas perfumadas y una acidez refinada.",
    "pricePerGram": 36,
    "defaultGramUnit": 250,
    "standardPrice": 9000,
    "presentation": "Clamshell microperforado 250g",
    "imageUrl": "https://images.unsplash.com/photo-1577069808021-5f25a72013f9?auto=format&fit=crop&w=800&q=80",
    "brix": "12° - 14° Brix",
    "altitude": "2.520 m.s.n.m.",
    "benefits": [
      "Ricas en fibra dietaria soluble",
      "Ácido elágico protector celular",
      "Favorece el control glucémico"
    ],
    "shelfLife": "5 - 7 días en refrigeración",
    "inStock": true
  },
  {
    "id": "fresas-albion",
    "name": "Fresas Albión Dulce Corazón",
    "scientificName": "Fragaria × ananassa",
    "variety": "Albión Hidropónica Protegida",
    "category": "berries",
    "tagline": "Rojas de punta a tallo, firmes y aromáticas",
    "description": "Cultivadas en sistemas elevados sostenibles con recirculación de agua pura de manantial de montaña. Cero contacto con suelo, garantizando higiene impecable.",
    "pricePerGram": 16,
    "defaultGramUnit": 250,
    "standardPrice": 4000,
    "presentation": "Caja Kraft respirable 250g",
    "imageUrl": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
    "brix": "10.5° - 12° Brix",
    "altitude": "2.400 m.s.n.m.",
    "benefits": [
      "90% agua e hidratación",
      "Aporte clave de ácido fólico",
      "Antioxidantes flavonoides"
    ],
    "shelfLife": "8 - 10 días en refrigeración",
    "inStock": true,
    "popular": true
  },
  {
    "id": "uchuvas-doradas",
    "name": "Uchuvas Andinas Doradas",
    "scientificName": "Physalis peruviana",
    "variety": "Ecotipo Colombia Dorada",
    "category": "exoticas",
    "tagline": "La superfruta dorada con capacho protector natural",
    "description": "Tesoros de los Andes colombianos. Con un perfil agridulce adictivo, son famosas a nivel mundial por sus propiedades purificadoras y su aporte de carotenoides.",
    "pricePerGram": 20,
    "defaultGramUnit": 250,
    "standardPrice": 5000,
    "presentation": "Bandeja con capacho deshidratado 250g",
    "imageUrl": "https://images.unsplash.com/photo-1546852199-2d8e8c4aaada?auto=format&fit=crop&w=800&q=80",
    "brix": "13° - 15° Brix",
    "altitude": "2.600 m.s.n.m.",
    "benefits": [
      "Gran fuente de Provitamina A",
      "Fortalece la visión y defensas",
      "Diurético y depurativo"
    ],
    "shelfLife": "20 - 25 días en ambiente fresco",
    "inStock": true
  },
  {
    "id": "mix-antioxidante",
    "name": "Mix Silvestre Antioxidante",
    "scientificName": "Blend Especial Fresh Pick",
    "variety": "Arándano + Mora + Frambuesa + Fresa",
    "category": "packs",
    "tagline": "El cuenco perfecto para tus mañanas y batidos energéticos",
    "description": "Selección premium con proporciones equilibradas de nuestros 4 frutos rojos estelares cosechados en el mismo amanecer.",
    "pricePerGram": 26,
    "defaultGramUnit": 500,
    "standardPrice": 13000,
    "presentation": "Eco-pack compartimentado 500g",
    "imageUrl": "https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=800&q=80",
    "brix": "13.5° Promedio",
    "altitude": "2.450 m.s.n.m.",
    "benefits": [
      "Máxima sinergia de fitoquímicos",
      "Ideal para desayunos fit",
      "Listos para consumir"
    ],
    "shelfLife": "7 - 10 días en refrigeración",
    "inStock": true,
    "popular": true
  }
];

export const packagingOptions: PackagingOption[] = [
  {
    "id": "pack-eco-kraft",
    "name": "Caja Kraft Biodegradable",
    "description": "Elaborada con cartón virgen reciclable y visor de almidón de maíz. Sostenible y protege la fruta fresca.",
    "extraPrice": 0,
    "iconName": "Package",
    "bestFor": "Uso diario en familia y cocina consciente",
    "badge": "Sin costo adicional"
  },
  {
    "id": "pack-canasta-regalo",
    "name": "Canasta Artesanal de Fique con Lazo",
    "description": "Canasta tejida a mano por artesanas andinas, forrada en papel encerado vegetal y lazo decorativo.",
    "extraPrice": 14000,
    "iconName": "Gift",
    "bestFor": "Obsequios de cumpleaños, aniversarios y detalles saludables",
    "badge": "Favorito para regalo"
  },
  {
    "id": "pack-clamshell-refrigerable",
    "name": "Set Clamshells rPET Ventilados",
    "description": "Contenedores individuales transparentes de plástico reciclado post-consumo que caben perfecto en gavetas de nevera.",
    "extraPrice": 3500,
    "iconName": "Snowflake",
    "bestFor": "Mayor duración y control de porciones individuales"
  },
  {
    "id": "pack-corporativo-catering",
    "name": "Caja Gourmet Exhibición Catering",
    "description": "Caja amplia de doble fondo con divisiones acolchadas, lista para poner en mesas de eventos o buffets.",
    "extraPrice": 18000,
    "iconName": "Award",
    "bestFor": "Eventos corporativos, restaurantes y reposterías"
  }
];

export const addOns: AddOn[] = [
  {
    "id": "miel-finca",
    "name": "Miel Cruda de Nuestras Abejas",
    "description": "Miel 100% pura y sin pasteurizar cosechada en los apiarios de polinización de la finca.",
    "price": 18000,
    "unit": "Frasco de vidrio 300g",
    "imageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": "granola-artesanal",
    "name": "Granola Andina Horneada con Semillas",
    "description": "Avena integral tostada con almendras, semillas de calabaza, canela y chips de coco.",
    "price": 15000,
    "unit": "Bolsa kraft resellable 350g",
    "imageUrl": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": "mermelada-arandanos",
    "name": "Mermelada de Arándanos 0% Azúcar",
    "description": "Preparada únicamente con nuestros arándanos de alta montaña, zumo de limón y pectina natural.",
    "price": 16500,
    "unit": "Tarro gourmet 230g",
    "imageUrl": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=400&q=80"
  }
];

export const plans: SubscriptionPlan[] = [
  {
    "id": "plan-esencial",
    "title": "Plan Esencial Frescura",
    "subtitle": "Para personas individuales o parejas que aman los desayunos saludables.",
    "weight": "1.5 kg al mes (375g por semana)",
    "priceMonth": 46000,
    "deliveryFrequency": "Entregas semanales o quincenales a tu elección",
    "idealFor": "1 - 2 personas",
    "features": [
      "Arándanos Biloxi seleccionados + Fruta de rotación estacional",
      "Despacho en 24h tras la recolección matutina",
      "10% de descuento incluido respecto al precio por gramo",
      "Pausa o cancela tu suscripción en cualquier momento",
      "Prioridad de cosecha los días lunes y jueves"
    ]
  },
  {
    "id": "plan-familiar",
    "title": "Plan Familiar Vitalidad",
    "subtitle": "El favorito de los hogares con niños y amantes de los smoothies.",
    "weight": "3.5 kg al mes (875g por semana)",
    "priceMonth": 95000,
    "deliveryFrequency": "Entregas semanales los martes o viernes",
    "isPopular": true,
    "idealFor": "3 - 5 personas",
    "features": [
      "Variedad libre: arándanos, moras, frambuesas y fresas",
      "Envío a domicilio 100% gratuito todas las semanas",
      "18% de ahorro sobre precio regular",
      "1 Frasco de Miel Cruda de la Finca gratis cada mes",
      "Acceso exclusivo a cosechas limitadas de temporada",
      "Cajas ecológicas retornables con bono verde"
    ]
  },
  {
    "id": "plan-gourmet-pro",
    "title": "Plan Gourmet & Negocios",
    "subtitle": "Diseñado para hogares de alto consumo, repostería casera o cafeterías specialty.",
    "weight": "7.0 kg al mes (1.75 kg por semana)",
    "priceMonth": 175000,
    "deliveryFrequency": "2 entregas semanales programadas",
    "idealFor": "Familias grandes, fitness & pequeños negocios",
    "features": [
      "Calibre Jumbo Premium garantizado en cada entrega",
      "Envíos prioritarios refrigerados sin costo",
      "25% de ahorro total garantizado",
      "Atención personalizada con agrónomo vía WhatsApp VIP",
      "Invitación especial para visita guiada a nuestra finca",
      "Empaques grado alimentario certificados con trazabilidad"
    ]
  }
];

export const certifications: Certification[] = [
  {
    "id": "global-gap",
    "title": "Global G.A.P. Certified",
    "code": "GGN: 4063061238910",
    "description": "Buenas prácticas agrícolas internacionales que garantizan inocuidad alimentaria, bienestar laboral y cuidado ambiental."
  },
  {
    "id": "bpa-ica",
    "title": "BPA ICA Colombia",
    "code": "Certificado Sanitario ICA N° 25-04-0018",
    "description": "Acreditación oficial del Instituto Colombiano Agropecuario de producción limpia y libre de metales pesados."
  },
  {
    "id": "polinizacion-viva",
    "title": "Polinización 100% Natural",
    "code": "Apis Mellifera & Meliponas Nativas",
    "description": "Nuestros cultivos albergan más de 40 colmenas activas que garantizan polinización uniforme y frutos más firmes."
  },
  {
    "id": "biofabrica",
    "title": "Biofábrica Circular Propia",
    "code": "Economía Circular Cero Desperdicio",
    "description": "Transformamos el 100% de los restos de poda y follaje en abonos orgánicos y biopreparados vivos desde 2022."
  }
];

export const recipes: Recipe[] = [
  {
    "id": "smoothie-bowl-antioxidante",
    "title": "Bowl Andino de Arándanos & Semillas",
    "prepTime": "10 min",
    "difficulty": "Fácil",
    "image": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80",
    "description": "Un desayuno revitalizante rico en polifenoles que te mantendrá con energía durante todo el día.",
    "ingredients": [
      "150g de Arándanos Fresh Pick congelados",
      "1 banano maduro congelado",
      "1/2 taza de leche de almendras o yogurt griego natural",
      "1 cda de miel cruda de la finca",
      "Topping: Granola andina, semillas de chía y frambuesas frescas"
    ],
    "instructions": [
      "Licuar los arándanos con el banano y la leche vegetal a velocidad alta hasta lograr textura espesa.",
      "Servir de inmediato en un cuenco hondo.",
      "Decorar con frambuesas frescas, un hilo de miel y la granola artesanal."
    ]
  },
  {
    "id": "torta-rustica-berries",
    "title": "Tarta Rústica de Frambuesas & Moras",
    "prepTime": "35 min",
    "difficulty": "Intermedio",
    "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    "description": "Una galette rústica dorada que resalta los jugos naturales y el brillo de nuestras bayas recién recolectadas.",
    "ingredients": [
      "200g de Moras de Castilla",
      "150g de Frambuesas Heritage Fresh Pick",
      "1 lámina de masa quebrada artesanal",
      "2 cucharadas de panela pulverizada o azúcar morena orgánica",
      "Ralladura de 1 limón verde"
    ],
    "instructions": [
      "Extender la masa sobre papel vegetal en una bandeja de horno.",
      "Mezclar con suavidad los frutos con la ralladura y la panela.",
      "Colocar las bayas en el centro y doblar los bordes rústicamente hacia adentro.",
      "Hornear a 190°C por 25 minutos hasta dorar la corteza. Servir tibia."
    ]
  },
  {
    "id": "infusion-tonica-berries",
    "title": "Agua Refrescante de Uchuvas & Fresas",
    "prepTime": "5 min",
    "difficulty": "Muy fácil",
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    "description": "Bebida de hidratación alcalina con rodajas de fruta fresca, menta de huerta y hielo picado.",
    "ingredients": [
      "1 taza de uchuvas cortadas a la mitad",
      "1 taza de fresas Albión en rodajas finas",
      "Hojas de menta o hierbabuena fresca",
      "1 litro de agua con o sin gas",
      "Hielo al gusto"
    ],
    "instructions": [
      "Macerar ligeramente las uchuvas y la menta en el fondo de una jarra de vidrio.",
      "Añadir las rodajas de fresa fresca y el hielo abundante.",
      "Completar con agua fría y dejar reposar 10 minutos antes de disfrutar."
    ]
  }
];

export const testimonials: Testimonial[] = [
  {
    "id": "test-1",
    "name": "Carolina Velásquez",
    "role": "Chef Pastelera & Propietaria de Café Dulce Cacao",
    "city": "Bogotá, Colombia",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    "rating": 5,
    "comment": "Trabajar con Fresh Pick Frutas cambió el estándar de nuestras tartaletas. El calibre de los arándanos es gigante y nunca vienen húmedos ni golpeados. El pedido personalizado nos permite pedir la fruta en su punto exacto.",
    "verifiedOrder": "Pedido Personalizado recurrente (4 kg/semana)"
  },
  {
    "id": "test-2",
    "name": "Dr. Santiago Restrepo",
    "role": "Médico Deportólogo y Maratonista",
    "city": "Medellín, Colombia",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    "rating": 5,
    "comment": "Compro el Plan Familiar de Frutos Rojos. Se nota la diferencia de la altitud: son mucho más dulces y la cáscara cruje al morder. Mis hijos ahora comen arándanos y uchuvas en vez de golosinas procesadas.",
    "verifiedOrder": "Suscripción Plan Familiar Vitalidad"
  },
  {
    "id": "test-3",
    "name": "Mariana Duarte",
    "role": "Nutricionista Clínica",
    "city": "Chía, Cundinamarca",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    "rating": 5,
    "comment": "Poder enviar canastas personalizadas de regalo con mensaje dedicado a mis pacientes y familiares es genial. La presentación con cartón kraft y lazo de fique es hermosa y 100% responsable con el medio ambiente.",
    "verifiedOrder": "Canasta Artesanal Personalizada con Regalo"
  }
];

export const faqs: FAQ[] = [
  {
    "id": "faq-1",
    "category": "pedidos",
    "question": "¿Cómo funciona la sección de pedidos personalizados en línea?",
    "answer": "En nuestra sección de pedidos personalizados puedes elegir exactamente los gramos de cada fruta (arándanos, moras, frambuesas, fresas o uchuvas), el tipo de empaque (desde cajas kraft eco hasta canastas de regalo), el nivel de maduración deseado, notas especiales o dedicatorias, y la fecha de entrega. Al finalizar puedes confirmar directamente en línea o enviarnos el resumen por WhatsApp con un solo clic."
  },
  {
    "id": "faq-2",
    "category": "calidad",
    "question": "¿Por qué las frutas de Fresh Pick tienen mejor sabor y firmeza?",
    "answer": "Nuestros cultivos se encuentran situados a 2.450 metros sobre el nivel del mar en la cordillera andina. La amplitud térmica entre el día y la noche genera una acumulación superior de azúcares naturales (Brix entre 14° y 16°) y una consistencia crocante insuperable. Además, practicamos polinización 100% natural con abejas nativas y no usamos ceras artificiales."
  },
  {
    "id": "faq-3",
    "category": "entregas",
    "question": "¿Cuánto tardan en entregar y cómo garantizan la cadena de frío?",
    "answer": "Recolectamos la fruta a primera hora del amanecer y la despachamos en vehículos acondicionados el mismo día o a la mañana siguiente (en menos de 24 horas tras la cosecha). Para envíos locales en Bogotá, Sabana, Chía, Cajicá, Cota y municipios aledaños la entrega se realiza el mismo día programado. También contamos con envíos exprés a principales ciudades."
  },
  {
    "id": "faq-4",
    "category": "pagos",
    "question": "¿Qué métodos de pago tienen disponibles?",
    "answer": "Aceptamos transferencias inmediatas por Nequi y Daviplata, transferencias Bancolombia / PSE, tarjetas de crédito y débito, y pago contraentrega en efectivo o datafono al recibir tu pedido en tu puerta."
  },
  {
    "id": "faq-5",
    "category": "pedidos",
    "question": "¿Hay un monto mínimo para hacer un pedido personalizado?",
    "answer": "No tenemos monto mínimo de compra. Sin embargo, para todos los pedidos superiores a $60.000 COP el envío es completamente GRATIS en nuestra zona de cobertura principal."
  },
  {
    "id": "faq-6",
    "category": "calidad",
    "question": "¿Qué certificados respaldan la inocuidad de sus frutas?",
    "answer": "Contamos con la certificación internacional Global G.A.P. y el certificado de Buenas Prácticas Agrícolas (BPA) otorgado por el ICA. Además, operamos una biofábrica propia donde reutilizamos los residuos vegetales para nutrir el suelo de manera regenerativa."
  }
];

export { plans as subscriptionPlans };

