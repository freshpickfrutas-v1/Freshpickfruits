import { BlogArticle, BlogCategory, BlogCategoryId } from '../types';

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'beneficios-arandanos',
    name: 'Beneficios de los Arándanos',
    description: 'Qué aportan los arándanos a tu alimentación y por qué vale la pena incluirlos.'
  },
  {
    id: 'nutricion-ciencia',
    name: 'Nutrición y Ciencia',
    description: 'Datos nutricionales, antioxidantes y lo que dice la investigación.'
  },
  {
    id: 'salud-digestiva-bienestar',
    name: 'Salud Digestiva y Bienestar',
    description: 'Fibra, digestión y hábitos que te hacen sentir bien.'
  },
  {
    id: 'estilo-vida-saludable',
    name: 'Estilo de Vida Saludable',
    description: 'Ideas prácticas para comer mejor todos los días.'
  },
  {
    id: 'cultivo-origen',
    name: 'Cultivo y Origen',
    description: 'Cómo cultivamos en Guasca a más de 2.800 m.s.n.m. y por qué se nota en el sabor.'
  }
];

const AUTHOR = 'Equipo Fresh Pick';

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'beneficios-de-los-arandanos-frescos',
    title: 'Beneficios de los Arándanos Frescos: Qué Aportan a tu Alimentación Diaria',
    metaDescription: 'Descubre los beneficios de los arándanos frescos: fibra, vitamina C, vitamina K, manganeso y antocianinas en una fruta baja en calorías. Guía completa Fresh Pick.',
    excerpt: 'Pocas frutas reúnen tanto en tan poco: fibra, vitaminas, minerales y antioxidantes naturales en una porción baja en calorías. Te contamos qué aporta realmente una taza de arándanos.',
    category: 'beneficios-arandanos',
    date: '2026-09-22',
    readMinutes: 6,
    author: AUTHOR,
    image: '/assets/finca/finca-arandanos-mano-2.jpg',
    imageAlt: 'Mano sosteniendo arándanos frescos recién cosechados en la finca Fresh Pick en Guasca',
    featured: true,
    relatedRecipes: ['smoothie-de-arandanos-y-avena', 'bowl-de-yogur-con-arandanos-y-granola'],
    blocks: [
      { type: 'p', text: 'Los arándanos son una de las frutas más valoradas en la alimentación saludable, y no es casualidad: en una porción pequeña y con pocas calorías reúnen fibra, vitaminas, minerales y compuestos antioxidantes naturales. En esta guía te explicamos qué aportan realmente y cómo aprovecharlos al máximo.' },
      { type: 'h2', text: 'Una fruta baja en calorías y rica en nutrientes' },
      { type: 'p', text: 'Cada 100 g de arándanos frescos aportan alrededor de 57 kcal, lo que los convierte en una opción ideal para quienes buscan comer rico sin excederse. Además, contienen aproximadamente un 84% de agua, por lo que también contribuyen a la hidratación.' },
      { type: 'h2', text: 'Fuente de vitamina C, vitamina K y manganeso' },
      { type: 'p', text: 'Una porción de 100 g cubre cerca del 11% del valor diario de vitamina C, alrededor del 16% de vitamina K y aproximadamente el 15% de manganeso. La vitamina C participa en el funcionamiento normal del sistema inmune; la vitamina K, en la coagulación normal de la sangre; y el manganeso, en el metabolismo energético.' },
      { type: 'h2', text: 'Antocianinas: el secreto de su color azul' },
      { type: 'p', text: 'El color azul-morado intenso de los arándanos proviene de las antocianinas, un grupo de pigmentos naturales con actividad antioxidante. La investigación científica sobre las antocianinas y la salud es muy activa y los resultados son prometedores, aunque todavía se está estudiando en qué medida se traducen en beneficios concretos para las personas.' },
      { type: 'quote', text: 'La mejor forma de aprovechar los arándanos es sencilla: comerlos con frecuencia, dentro de una alimentación variada y equilibrada.' },
      { type: 'h2', text: 'Fibra para una digestión más cómoda' },
      { type: 'p', text: 'Con cerca de 2,4 g de fibra por cada 100 g, los arándanos suman a la ingesta diaria de fibra, que ayuda al tránsito intestinal normal y aporta sensación de saciedad.' },
      { type: 'h2', text: '¿Cuántos arándanos comer al día?' },
      { type: 'p', text: 'No existe una cantidad mágica, pero una taza (unos 150 g) es una porción práctica que puedes incluir en el desayuno, como merienda o en un batido. Lo importante es la constancia y combinarlos con otras frutas, verduras y alimentos integrales.' },
      { type: 'h2', text: 'Frescura y origen sí importan' },
      { type: 'p', text: 'Un arándano cosechado en su punto de madurez, sin ceras artificiales y con su pruina natural intacta conserva mejor su sabor, su firmeza y su textura. Por eso en Fresh Pick cosechamos a mano en Guasca, a más de 2.800 m.s.n.m., y entregamos directamente a tu casa.' }
    ]
  },
  {
    slug: 'tabla-nutricional-de-los-arandanos',
    title: 'Tabla Nutricional de los Arándanos: Calorías, Vitaminas y Minerales por 100 g',
    metaDescription: 'Tabla nutricional completa de los arándanos frescos por 100 g: calorías, carbohidratos, fibra, azúcares, vitamina C, vitamina K, manganeso y más.',
    excerpt: 'Todo lo que contiene una porción de arándanos frescos, explicado de forma clara y con datos de referencia internacionales.',
    category: 'nutricion-ciencia',
    date: '2026-09-18',
    readMinutes: 5,
    author: AUTHOR,
    imageAlt: 'Arándanos frescos de alta montaña junto a una tabla con información nutricional',
    relatedRecipes: ['mermelada-de-arandanos-con-chia'],
    blocks: [
      { type: 'p', text: 'Si cuentas calorías, sigues un plan de alimentación o simplemente quieres saber qué estás comiendo, esta es la información nutricional de los arándanos frescos, con valores de referencia de la base de datos del Departamento de Agricultura de Estados Unidos (USDA FoodData Central).' },
      { type: 'h2', text: 'Información nutricional por 100 g de arándanos frescos' },
      {
        type: 'table',
        caption: 'Valores aproximados para arándanos crudos. % VD calculado sobre una dieta de 2.000 kcal.',
        headers: ['Nutriente', 'Cantidad', '% Valor Diario'],
        rows: [
          ['Energía', '57 kcal', '3%'],
          ['Agua', '84 g', '—'],
          ['Carbohidratos', '14,5 g', '5%'],
          ['Fibra dietaria', '2,4 g', '9%'],
          ['Azúcares naturales', '10 g', '—'],
          ['Proteína', '0,7 g', '1%'],
          ['Grasa total', '0,3 g', '0%'],
          ['Vitamina C', '9,7 mg', '11%'],
          ['Vitamina K', '19,3 µg', '16%'],
          ['Manganeso', '0,34 mg', '15%'],
          ['Potasio', '77 mg', '2%']
        ]
      },
      { type: 'h2', text: 'Cómo leer esta tabla' },
      { type: 'ul', items: [
        'Los azúcares de los arándanos son naturales de la fruta, no azúcares añadidos.',
        'Una taza (unos 150 g) aporta aproximadamente 1,5 veces los valores de la tabla.',
        'Los valores pueden variar según la variedad, el grado de madurez y las condiciones de cultivo.'
      ] },
      { type: 'h2', text: '¿Frescos o congelados?' },
      { type: 'p', text: 'Los arándanos congelados sin azúcar añadido conservan un perfil nutricional muy similar al de los frescos. Congelar tus arándanos Fresh Pick es una excelente manera de tenerlos siempre disponibles para batidos y preparaciones.' },
      { type: 'h2', text: '¿Y los deshidratados?' },
      { type: 'p', text: 'Al perder el agua, los nutrientes y los azúcares se concentran, y muchas versiones comerciales llevan azúcar añadido. Por eso, en porciones iguales, los deshidratados tienen muchas más calorías que los frescos.' }
    ]
  },
  {
    slug: 'arandanos-y-salud-digestiva',
    title: 'Arándanos y Salud Digestiva: Cómo la Fibra Contribuye a tu Bienestar',
    metaDescription: 'Aprende cómo la fibra de los arándanos contribuye al tránsito intestinal normal y la saciedad, y cómo incluirlos en tu rutina para cuidar tu digestión.',
    excerpt: 'La fibra es una de las grandes aliadas de la digestión, y los arándanos son una forma deliciosa de sumarla a tu día.',
    category: 'salud-digestiva-bienestar',
    date: '2026-09-15',
    readMinutes: 5,
    author: AUTHOR,
    imageAlt: 'Bowl de desayuno con yogur, avena y arándanos frescos para una digestión saludable',
    relatedRecipes: ['bowl-de-yogur-con-arandanos-y-granola', 'smoothie-de-arandanos-y-avena'],
    blocks: [
      { type: 'p', text: 'Una buena digestión empieza por lo que ponemos en el plato. La fibra dietaria, el agua y los alimentos poco procesados son la base, y los arándanos aportan los tres.' },
      { type: 'h2', text: 'Qué hace la fibra en tu cuerpo' },
      { type: 'p', text: 'La fibra es la parte de los vegetales que nuestro cuerpo no digiere por completo. Contribuye al tránsito intestinal normal, da sensación de saciedad y sirve de alimento a las bacterias beneficiosas del intestino.' },
      { type: 'h2', text: 'Cuánta fibra aportan los arándanos' },
      { type: 'p', text: 'Una taza de arándanos frescos (unos 150 g) aporta alrededor de 3,6 g de fibra. Las recomendaciones generales para adultos rondan los 25–30 g al día, y la mayoría de las personas no alcanza esa cifra.' },
      { type: 'h2', text: 'Combinaciones que suman' },
      { type: 'ul', items: [
        'Arándanos + avena: dos fuentes de fibra en un mismo desayuno.',
        'Arándanos + yogur natural o kéfir: fibra junto a alimentos fermentados.',
        'Arándanos + chía o linaza: una cucharada de semillas aporta todavía más fibra.'
      ] },
      { type: 'h2', text: 'Consejos para aumentar la fibra sin molestias' },
      { type: 'ol', items: [
        'Aumenta la fibra de forma gradual, a lo largo de varias semanas.',
        'Toma suficiente agua durante el día.',
        'Reparte las frutas y verduras en varias comidas en lugar de concentrarlas en una sola.'
      ] },
      { type: 'p', text: 'Si tienes una condición digestiva diagnosticada, consulta con tu médico o nutricionista antes de hacer cambios importantes en tu alimentación.' }
    ]
  },
  {
    slug: 'formas-faciles-de-incluir-arandanos-en-tu-rutina',
    title: '7 Formas Fáciles de Incluir Arándanos en tu Rutina Diaria',
    metaDescription: 'Ideas prácticas para comer arándanos todos los días: en el desayuno, la lonchera, batidos, ensaladas y postres. Más cómo conservarlos frescos por más tiempo.',
    excerpt: 'Del desayuno a la cena: ideas sencillas para que los arándanos formen parte de tu día sin complicarte.',
    category: 'estilo-vida-saludable',
    date: '2026-09-10',
    readMinutes: 4,
    author: AUTHOR,
    imageAlt: 'Arándanos frescos servidos en diferentes preparaciones: desayuno, ensalada y bebida',
    relatedRecipes: ['ensalada-de-espinaca-arandanos-y-queso-campesino', 'refresco-de-arandanos-con-hierbabuena', 'yogur-helado-crocante-de-arandanos'],
    blocks: [
      { type: 'p', text: 'Comer mejor no tiene que ser complicado. Estas son siete maneras prácticas de disfrutar tus arándanos Fresh Pick a lo largo del día.' },
      { type: 'h2', text: '1. En tu desayuno' },
      { type: 'p', text: 'Agrégalos a la avena, al yogur o a los panqueques. Un puñado basta para darle color y sabor a la primera comida del día.' },
      { type: 'h2', text: '2. En un batido' },
      { type: 'p', text: 'Arándanos, yogur y avena: en 5 minutos tienes un batido saciador y lleno de color.' },
      { type: 'h2', text: '3. Como merienda para llevar' },
      { type: 'p', text: 'Son de los pocos snacks que no necesitan preparación: lávalos, sécalos y llévalos en un recipiente pequeño.' },
      { type: 'h2', text: '4. En tus ensaladas' },
      { type: 'p', text: 'Combinan muy bien con espinaca, queso campesino y nueces. El toque dulce-ácido equilibra los sabores salados.' },
      { type: 'h2', text: '5. En bebidas refrescantes' },
      { type: 'p', text: 'Machacados con hierbabuena y agua con gas, son una alternativa natural a las gaseosas.' },
      { type: 'h2', text: '6. Como postre ligero' },
      { type: 'p', text: 'Un yogur helado con arándanos satisface el antojo de dulce con ingredientes simples.' },
      { type: 'h2', text: '7. En preparaciones para toda la semana' },
      { type: 'p', text: 'Una mermelada casera con chía dura hasta una semana en la nevera y sirve para tostadas, yogur o postres.' },
      { type: 'h2', text: 'Cómo conservarlos frescos por más tiempo' },
      { type: 'ul', items: [
        'Guárdalos en la nevera, en su estuche original, sin lavar.',
        'Lávalos solo justo antes de comerlos: la pruina natural los protege.',
        'Si no los vas a consumir en unos días, congélalos extendidos en una bandeja y luego pásalos a una bolsa.'
      ] }
    ]
  },
  {
    slug: 'arandanos-de-alta-montana-por-que-saben-diferente',
    title: 'Arándanos de Alta Montaña: Por Qué Cultivar a 2.800 m.s.n.m. se Nota en el Sabor',
    metaDescription: 'Conoce cómo cultivamos arándanos en Guasca, Cundinamarca, a más de 2.800 m.s.n.m.: polinización natural, cosecha manual y un dulzor natural de 13° a 15° Brix.',
    excerpt: 'Radiación solar de montaña, noches frías, agua de manantial y polinización con abejas: así nacen los arándanos Fresh Pick.',
    category: 'cultivo-origen',
    date: '2026-09-05',
    readMinutes: 6,
    author: AUTHOR,
    image: '/assets/finca/finca-arandanos-invernadero-3.jpg',
    imageAlt: 'Cultivo de arándanos Fresh Pick en la Vereda Santa Bárbara, Guasca, a más de 2.800 m.s.n.m.',
    featured: true,
    relatedRecipes: ['panqueques-de-arandanos-limon-y-amapola'],
    blocks: [
      { type: 'p', text: 'En la Vereda Santa Bárbara, en Guasca (Cundinamarca), a más de 2.800 metros sobre el nivel del mar, cultivamos nuestros arándanos. La altura no es un detalle: influye en el sabor, la firmeza y el color de cada fruto.' },
      { type: 'h2', text: 'El efecto altura' },
      { type: 'p', text: 'En la alta montaña andina, los días tienen una radiación solar intensa y las noches son frías. Esa diferencia de temperatura hace que la planta madure sus frutos más despacio, lo que favorece la concentración de azúcares naturales y produce bayas más firmes y crocantes.' },
      { type: 'h2', text: 'Dulzor natural de 13° a 15° Brix' },
      { type: 'p', text: 'Los grados Brix miden el contenido de azúcares solubles de una fruta. Nuestros arándanos alcanzan típicamente entre 13° y 15° Brix, un dulzor natural que se equilibra con su acidez característica.' },
      { type: 'h2', text: 'Polinización 100% natural' },
      { type: 'p', text: 'En la finca tenemos 7 colmenas de abejas que polinizan el cultivo. La polinización natural favorece frutos bien formados y es parte de nuestro compromiso con la biodiversidad.' },
      { type: 'h2', text: 'Agua de manantial y tierra negra' },
      { type: 'p', text: 'Regamos con agua de manantial y agua lluvia, y cultivamos sobre tierra negra de hasta 2 metros de profundidad, rica en materia orgánica.' },
      { type: 'h2', text: 'Cosecha manual en el punto exacto' },
      { type: 'p', text: 'Cada arándano se recoge a mano, seleccionando solo los que están en su punto óptimo de madurez. Así protegemos la pruina, esa capa blanquecina natural que cubre el fruto y lo mantiene fresco por más tiempo.' },
      { type: 'h2', text: 'Certificaciones que respaldan nuestro trabajo' },
      { type: 'ul', items: [
        'GLOBALG.A.P.: buenas prácticas agrícolas e inocuidad alimentaria.',
        'GRASP: bienestar social de los trabajadores.',
        'ICA: certificación en Buenas Prácticas Agrícolas en Colombia.'
      ] },
      { type: 'quote', text: 'Cuidamos tu alimento, cuidamos a quien lo cultiva y cuidamos nuestro planeta.' }
    ]
  }
];

export function getBlogCategory(id: BlogCategoryId) {
  return BLOG_CATEGORIES.find(c => c.id === id)!;
}

export function getArticleBySlug(slug: string) {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}

/** Articles sorted newest first. */
export function sortedArticles() {
  return [...BLOG_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatArticleDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}
