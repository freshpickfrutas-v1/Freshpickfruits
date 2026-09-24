import { Recipe, RecipeCategory, RecipeCategoryId } from '../types';

export const QUICK_RECIPE_MAX_MINUTES = 15;

export const RECIPE_CATEGORIES: RecipeCategory[] = [
  {
    id: 'smoothies-batidos',
    name: 'Smoothies y Batidos',
    description: 'Batidos cremosos y llenos de color con arándanos frescos de alta montaña.',
    emoji: '🥤'
  },
  {
    id: 'desayunos',
    name: 'Desayunos',
    description: 'Empieza el día con arándanos: bowls, panqueques, avenas y más.',
    emoji: '🥞'
  },
  {
    id: 'postres-saludables',
    name: 'Postres Saludables',
    description: 'Dulces más livianos donde el arándano es el protagonista.',
    emoji: '🍰'
  },
  {
    id: 'snacks-meriendas',
    name: 'Snacks y Meriendas',
    description: 'Opciones prácticas para la lonchera, la oficina o media tarde.',
    emoji: '🥣'
  },
  {
    id: 'ensaladas-platos-frescos',
    name: 'Ensaladas y Platos Frescos',
    description: 'El toque dulce y ácido del arándano en platos salados y frescos.',
    emoji: '🥗'
  },
  {
    id: 'bebidas-refrescos',
    name: 'Bebidas y Refrescos',
    description: 'Aguas saborizadas, refrescos y bebidas frías sin complicaciones.',
    emoji: '🧊'
  },
  {
    id: 'preparaciones-conservas',
    name: 'Preparaciones y Conservas',
    description: 'Mermeladas, compotas y salsas para tener arándanos toda la semana.',
    emoji: '🍯'
  },
  {
    id: 'recetas-rapidas',
    name: 'Recetas Rápidas (15 min o menos)',
    description: 'Todo listo en 15 minutos o menos, ideal para el día a día.',
    emoji: '⏱️'
  }
];

export const RECIPES: Recipe[] = [
  {
    slug: 'smoothie-de-arandanos-y-avena',
    title: 'Smoothie de Arándanos, Avena y Yogur Griego',
    excerpt: 'Un batido cremoso y saciador, listo en 5 minutos, con el color intenso y el sabor de los arándanos de alta montaña.',
    imageAlt: 'Smoothie morado de arándanos frescos con avena y yogur griego servido en vaso de vidrio',
    category: 'smoothies-batidos',
    extraCategories: ['desayunos'],
    prepMinutes: 5,
    cookMinutes: 0,
    difficulty: 'Fácil',
    servings: 2,
    featured: true,
    ingredients: [
      { text: '1 taza (150 g) de arándanos Fresh Pick, frescos o congelados', freshPick: true },
      { text: '1 taza (240 g) de yogur griego natural' },
      { text: '3 cucharadas de avena en hojuelas' },
      { text: '1 taza (240 ml) de leche o bebida vegetal' },
      { text: '1 cucharada de miel (opcional)' },
      { text: '4 cubos de hielo (omitir si usas arándanos congelados)' }
    ],
    steps: [
      'Pon en la licuadora la leche y el yogur primero; así las cuchillas giran con facilidad.',
      'Agrega la avena, los arándanos, la miel y el hielo.',
      'Licúa a velocidad alta durante 45–60 segundos, hasta que no queden trozos de avena.',
      'Prueba y ajusta: más leche si lo quieres más líquido, más miel si lo prefieres más dulce.',
      'Sirve de inmediato y decora con algunos arándanos enteros.'
    ],
    tips: [
      'Congela tus arándanos Fresh Pick en una bandeja y luego pásalos a una bolsa: el smoothie queda más espeso y frío sin aguarlo con hielo.',
      'Si remojas la avena 10 minutos en la leche antes de licuar, la textura queda más sedosa.'
    ]
  },
  {
    slug: 'panqueques-de-arandanos-limon-y-amapola',
    title: 'Panqueques de Arándanos con Limón y Amapola',
    excerpt: 'Panqueques esponjosos con el crujiente de la semilla de amapola, ralladura de limón y arándanos enteros que se caramelizan en la sartén.',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Panqueques esponjosos con arándanos frescos, ralladura de limón y semillas de amapola, recién hechos en sartén',
    category: 'desayunos',
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: 'Fácil',
    servings: 4,
    featured: true,
    ingredients: [
      { text: '270 g de harina de trigo (sin polvos)' },
      { text: '2 cucharaditas de polvo de hornear' },
      { text: '100 g de azúcar' },
      { text: '1 cucharadita de sal' },
      { text: 'Ralladura de 1 limón' },
      { text: '1 huevo' },
      { text: '300 ml de leche' },
      { text: '1/2 cucharadita de esencia de vainilla' },
      { text: '10 g de mantequilla sin sal, derretida' },
      { text: '100 g de arándanos Fresh Pick', freshPick: true },
      { text: '2 cucharaditas de semillas de amapola' }
    ],
    steps: [
      'Combina harina, sal, azúcar, polvo de hornear y ralladura. Forma un hoyo en el centro (método volcán).',
      'Vierte la leche, el huevo y la vainilla en el centro y mezcla desde adentro hacia afuera para evitar grumos.',
      'Añade la mantequilla derretida en forma de hilo mientras mezclas. Incorpora los arándanos y la amapola con espátula.',
      'Cocina en sartén antiadherente a fuego medio-bajo. Voltea solo cuando aparezcan burbujas en la superficie.'
    ],
    tips: [
      'Si usas arándanos congelados, no los descongeles: agrégalos directamente a la masa para que no la tiñan.',
      'Pon algunos arándanos extra sobre cada panqueque justo después de verter la masa en la sartén; así quedan repartidos de forma pareja.'
    ]
  },
  {
    slug: 'bowl-de-yogur-con-arandanos-y-granola',
    title: 'Bowl de Yogur con Arándanos, Granola y Miel',
    excerpt: 'El desayuno más rápido y completo: capas de yogur, granola crocante y arándanos frescos recién lavados.',
    imageAlt: 'Bowl de yogur natural con arándanos frescos, granola crocante y un hilo de miel',
    category: 'desayunos',
    extraCategories: ['snacks-meriendas'],
    prepMinutes: 5,
    cookMinutes: 0,
    difficulty: 'Fácil',
    servings: 1,
    ingredients: [
      { text: '3/4 taza (100 g) de arándanos Fresh Pick', freshPick: true },
      { text: '1 taza (240 g) de yogur natural o griego' },
      { text: '1/3 taza de granola' },
      { text: '1 cucharada de semillas de chía o linaza' },
      { text: '1 cucharadita de miel' }
    ],
    steps: [
      'Lava los arándanos justo antes de servir y sécalos suavemente con papel de cocina.',
      'Sirve el yogur en un bowl y alísalo con el dorso de una cuchara.',
      'Reparte la granola a un lado y los arándanos al otro.',
      'Espolvorea las semillas y termina con el hilo de miel.'
    ],
    tips: [
      'Lava los arándanos solo antes de comerlos: la pruina (capa blanquecina natural) los protege y se conservan mejor sin lavar en la nevera.',
      'Para llevar a la oficina, arma el bowl en un frasco y guarda la granola aparte para que no se ablande.'
    ]
  },
  {
    slug: 'muffins-de-arandanos-esponjosos',
    title: 'Muffins de Arándanos Suaves y Esponjosos',
    excerpt: 'Muffins clásicos con miga esponjosa gracias a un batido inicial riguroso y un horneado de choque que les da volumen profesional.',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Muffins de arándanos frescos de alta montaña horneados, esponjosos y dorados',
    category: 'snacks-meriendas',
    prepMinutes: 15,
    cookMinutes: 25,
    restMinutes: 30,
    difficulty: 'Intermedio',
    servings: 12,
    featured: true,
    ingredients: [
      { text: '250 g de harina de trigo' },
      { text: '2 cucharaditas (10 g) de polvo de hornear' },
      { text: '150 g de azúcar' },
      { text: '60 g de mantequilla blanda' },
      { text: '250 ml de leche' },
      { text: '2 huevos' },
      { text: 'Ralladura de limón al gusto' },
      { text: '150 g de arándanos Fresh Pick', freshPick: true }
    ],
    steps: [
      'Bate los huevos con el azúcar durante al menos 3 minutos, hasta obtener una mezcla muy esponjosa.',
      'Integra la mantequilla, la leche y la ralladura de limón.',
      'Mezcla la harina con el polvo de hornear e incorpórala suavemente.',
      'Enharina ligeramente los arándanos para que no se vayan al fondo del molde y agrégalos a la masa.',
      'Deja reposar la masa en la nevera 30 minutos.',
      'Precalienta el horno a 210 °C. Llena los moldes a 2/3 y hornea 5 minutos a 210 °C; luego baja a 180 °C y hornea 15–20 minutos más.'
    ],
    tips: [
      'El reposo en frío y el golpe inicial de calor alto son los que forman el "copete" de panadería.',
      'Guárdalos en un recipiente hermético hasta 3 días, o congélalos individualmente hasta por un mes.'
    ]
  },
  {
    slug: 'yogur-helado-crocante-de-arandanos',
    title: 'Yogur Helado Crocante de Arándanos',
    excerpt: 'Una lámina de yogur congelado con arándanos y almendras que se parte en trozos: postre fresco, fácil y sin horno.',
    imageAlt: 'Trozos de yogur helado con arándanos frescos y almendras sobre papel de horno',
    category: 'postres-saludables',
    extraCategories: ['snacks-meriendas'],
    prepMinutes: 10,
    cookMinutes: 0,
    restMinutes: 180,
    difficulty: 'Fácil',
    servings: 6,
    featured: true,
    ingredients: [
      { text: '1 taza (150 g) de arándanos Fresh Pick', freshPick: true },
      { text: '2 tazas (480 g) de yogur griego natural' },
      { text: '2 cucharadas de miel o sirope de agave' },
      { text: '1/2 cucharadita de esencia de vainilla' },
      { text: '1/4 taza de almendras fileteadas o nueces picadas' }
    ],
    steps: [
      'Forra una bandeja pequeña con papel de horno.',
      'Mezcla el yogur con la miel y la vainilla.',
      'Extiende la mezcla sobre el papel en una capa de aproximadamente 1 cm.',
      'Reparte los arándanos y las almendras por encima, presionándolos ligeramente.',
      'Congela mínimo 3 horas y parte en trozos irregulares justo antes de servir.'
    ],
    tips: [
      'Aplasta la mitad de los arándanos con un tenedor antes de ponerlos: crean vetas moradas muy vistosas.',
      'Consérvalo en el congelador en un recipiente hermético, separando las capas con papel.'
    ]
  },
  {
    slug: 'ponque-de-limon-y-arandanos',
    title: 'Ponqué de Limón y Arándanos Súper Húmedo',
    excerpt: 'Un ponqué muy húmedo gracias al yogur griego y al aceite de oliva, con arándanos frescos y glaseado de limón.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Ponqué húmedo de limón y arándanos frescos glaseado, recién horneado',
    category: 'postres-saludables',
    prepMinutes: 20,
    cookMinutes: 55,
    difficulty: 'Intermedio',
    servings: 10,
    ingredients: [
      { text: '2 tazas de harina de trigo (reserva 2 cucharadas para los arándanos)' },
      { text: '3/4 taza (150 g) de azúcar' },
      { text: '1 taza de yogur griego' },
      { text: '2/3 taza de aceite de oliva' },
      { text: '2 huevos' },
      { text: '2 cucharaditas de polvo de hornear' },
      { text: '1 pizca de sal' },
      { text: '1 taza de arándanos Fresh Pick', freshPick: true },
      { text: 'Ralladura de 2 limones' },
      { text: 'Glaseado: 1 taza de azúcar pulverizada + 2–3 cucharadas de jugo de limón' }
    ],
    steps: [
      'Bate el yogur, el aceite y los huevos. Suma el azúcar y la ralladura (solo la parte verde, para evitar amargor).',
      'Cierne la harina con el polvo de hornear y la sal. Cubre los arándanos con las 2 cucharadas de harina reservadas.',
      'Une las mezclas con espátula, sin batir de más para no desarrollar el gluten. Agrega los arándanos.',
      'Hornea en molde de 20 x 10 cm a 180 °C durante 55 minutos.',
      'Para el glaseado, mezcla la azúcar pulverizada con el limón hasta obtener una textura lisa y densa. Viértelo solo cuando el ponqué esté completamente frío.'
    ],
    tips: [
      'Si el ponqué se dora demasiado rápido, cúbrelo con papel aluminio a partir del minuto 35.',
      'Queda aún más húmedo al día siguiente: envuélvelo en papel film una vez frío.'
    ]
  },
  {
    slug: 'ensalada-de-espinaca-arandanos-y-queso-campesino',
    title: 'Ensalada de Espinaca, Arándanos y Queso Campesino',
    excerpt: 'Una ensalada fresca y colorida con el contraste dulce-ácido del arándano, queso campesino y nueces tostadas.',
    imageAlt: 'Ensalada de espinaca fresca con arándanos, queso campesino y nueces tostadas',
    category: 'ensaladas-platos-frescos',
    prepMinutes: 10,
    cookMinutes: 3,
    difficulty: 'Fácil',
    servings: 2,
    ingredients: [
      { text: '3/4 taza (100 g) de arándanos Fresh Pick', freshPick: true },
      { text: '3 tazas de espinaca baby lavada' },
      { text: '100 g de queso campesino en cubos' },
      { text: '1/4 taza de nueces' },
      { text: '1/4 de cebolla morada en plumas finas' },
      { text: 'Vinagreta: 3 cucharadas de aceite de oliva, 1 cucharada de vinagre balsámico, 1 cucharadita de miel, 1 cucharadita de mostaza, sal y pimienta' }
    ],
    steps: [
      'Tuesta las nueces en una sartén seca a fuego medio durante 2–3 minutos, moviéndolas para que no se quemen.',
      'Prepara la vinagreta agitando todos sus ingredientes en un frasco con tapa.',
      'En un bowl grande, mezcla la espinaca con la cebolla morada.',
      'Agrega el queso, los arándanos y las nueces tostadas.',
      'Aliña justo antes de servir y mezcla con suavidad.'
    ],
    tips: [
      'Machaca 5 o 6 arándanos dentro de la vinagreta: le dan color y un sabor frutal muy especial.',
      'Si preparas la ensalada con anticipación, guarda la vinagreta aparte para que la espinaca no se marchite.'
    ]
  },
  {
    slug: 'refresco-de-arandanos-con-hierbabuena',
    title: 'Refresco de Arándanos con Hierbabuena',
    excerpt: 'Una bebida burbujeante, natural y poco dulce, perfecta para días calurosos o para recibir visitas.',
    imageAlt: 'Vasos de refresco de arándanos con hojas de hierbabuena, hielo y agua con gas',
    category: 'bebidas-refrescos',
    prepMinutes: 10,
    cookMinutes: 0,
    difficulty: 'Fácil',
    servings: 4,
    ingredients: [
      { text: '1 taza (150 g) de arándanos Fresh Pick', freshPick: true },
      { text: '10 hojas de hierbabuena, y algunas más para decorar' },
      { text: '2 cucharadas de miel o panela rallada' },
      { text: 'Jugo de 1/2 limón' },
      { text: '1 litro de agua con gas bien fría' },
      { text: 'Hielo al gusto' }
    ],
    steps: [
      'En una jarra, machaca los arándanos con la hierbabuena y la miel hasta que suelten su jugo.',
      'Agrega el jugo de limón y mezcla.',
      'Llena la jarra con hielo y completa con el agua con gas.',
      'Revuelve suavemente y sirve con arándanos enteros y hojas de hierbabuena.'
    ],
    tips: [
      'Para una versión sin gas, usa agua fría y deja reposar la jarra 30 minutos en la nevera para que se intensifique el sabor.',
      'Congela arándanos dentro de cubos de hielo: decoran y enfrían sin aguar la bebida.'
    ]
  },
  {
    slug: 'mermelada-de-arandanos-con-chia',
    title: 'Mermelada de Arándanos con Chía (Sin Pectina)',
    excerpt: 'Una mermelada casera espesada con semillas de chía, con mucho menos azúcar que la tradicional y todo el sabor del arándano.',
    imageAlt: 'Frasco de vidrio con mermelada casera de arándanos y chía junto a arándanos frescos',
    category: 'preparaciones-conservas',
    prepMinutes: 5,
    cookMinutes: 10,
    restMinutes: 10,
    difficulty: 'Fácil',
    servings: 8,
    ingredients: [
      { text: '2 tazas (300 g) de arándanos Fresh Pick', freshPick: true },
      { text: '2 cucharadas de miel o azúcar' },
      { text: '1 cucharada de jugo de limón' },
      { text: '2 cucharadas de semillas de chía' },
      { text: '2 cucharadas de agua' }
    ],
    steps: [
      'Pon los arándanos y el agua en una olla pequeña a fuego medio.',
      'Cocina 5–7 minutos, aplastando los arándanos con un tenedor a medida que revientan.',
      'Retira del fuego y agrega la miel, el limón y la chía.',
      'Deja reposar 10 minutos para que la chía espese la mezcla.',
      'Pasa a un frasco limpio y refrigera. Espesará un poco más al enfriarse.'
    ],
    tips: [
      'Dura hasta 7 días en la nevera en frasco hermético, o hasta 3 meses congelada en porciones.',
      'Úsala sobre tostadas, yogur, avena o como relleno de panqueques.'
    ]
  }
];

/** Total time including rest; a recipe is "rápida" when this is 15 minutes or less. */
export function recipeTotalMinutes(recipe: Recipe) {
  return recipe.prepMinutes + recipe.cookMinutes + (recipe.restMinutes ?? 0);
}

export function recipeCategories(recipe: Recipe): RecipeCategoryId[] {
  const ids: RecipeCategoryId[] = [recipe.category, ...(recipe.extraCategories ?? [])];
  if (recipeTotalMinutes(recipe) <= QUICK_RECIPE_MAX_MINUTES) ids.push('recetas-rapidas');
  return ids;
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function getRecipeCategory(id: RecipeCategoryId) {
  return RECIPE_CATEGORIES.find(c => c.id === id)!;
}

export function getRecipeBySlug(slug: string) {
  return RECIPES.find(r => r.slug === slug);
}
