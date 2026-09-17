import { useEffect } from 'react';
import { FRUITS_DATA, FAQ_DATA, TESTIMONIALS_DATA } from '../data/mockData';

// Inyecta datos estructurados JSON-LD (Schema.org) en <head> para SEO clásico
// y GEO (Generative Engine Optimization): ayuda a que Google, y también
// ChatGPT/Copilot/Gemini (que consultan Bing/Google y rastrean con sus
// propios bots), entiendan sin ambigüedad qué vende Fresh Pick, dónde,
// cuánto cuesta y cómo se entrega.
//
// Se inyecta vía useEffect (no en index.html) porque el catálogo de
// productos vive en React; si en el futuro los precios/stock se leen de
// Firestore (ver AdminPanel), este componente debería recibir esos datos
// como props en vez de importar mockData directamente, para que el schema
// siempre refleje el catálogo real.

const SITE_URL = 'https://www.freshpickfruits.com';
const LOGO_URL = `${SITE_URL}/logo.jpg`;
const PHONE = '+573178931026';
const EMAIL = 'info@freshpickfruits.com';

function absoluteImage(url: string) {
  if (url.startsWith('http')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    '@id': `${SITE_URL}/#organization`,
    name: 'Fresh Pick',
    legalName: 'ANDEAN FRUIT COMPANY SAS',
    alternateName: 'Fresh Pick Arándanos de Alta Montaña',
    description:
      'Fresh Pick cultiva y vende arándanos premium de alta montaña (más de 2.800 m.s.n.m.) en Guasca, Cundinamarca, Colombia, con polinización 100% natural, cosecha manual selectiva y cero residualidad química. Entrega a domicilio en la zona de cobertura con pedidos por WhatsApp o pedido personalizado en línea.',
    url: SITE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    telephone: PHONE,
    email: EMAIL,
    priceRange: '$$',
    foundingDate: '2017',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Vereda Santa Bárbara',
      addressLocality: 'Guasca',
      addressRegion: 'Cundinamarca',
      addressCountry: 'CO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 4.8631,
      longitude: -73.8783,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: 4.8631, longitude: -73.8783 },
      geoRadius: '80000',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday'],
        opens: '08:00',
        closes: '15:00',
      },
    ],
    sameAs: [],
    hasCredential: ['GLOBALG.A.P.', 'GRASP', 'ICA'],
    makesOffer: FRUITS_DATA.map(f => ({ '@type': 'Offer', itemOffered: { '@id': `${SITE_URL}/#product-${f.id}` } })),
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/#pedidos-personalizados`,
        actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'],
      },
      deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
    },
  };
}

function buildProductSchemas() {
  const avgRating =
    TESTIMONIALS_DATA.reduce((sum, t) => sum + t.rating, 0) / (TESTIMONIALS_DATA.length || 1);

  return FRUITS_DATA.map(f => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/#product-${f.id}`,
    name: f.name,
    description: `${f.tagline}. ${f.description}`,
    image: absoluteImage(f.imageUrl),
    brand: { '@type': 'Brand', name: 'Fresh Pick' },
    category: 'Arándanos frescos / Blueberries',
    sku: f.id,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Grados Brix', value: f.brix },
      { '@type': 'PropertyValue', name: 'Altitud de cultivo', value: f.altitude },
      { '@type': 'PropertyValue', name: 'Vida útil', value: f.shelfLife },
    ],
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/#variedades`,
      priceCurrency: 'COP',
      price: f.standardPrice,
      availability: f.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 6000, currency: 'COP' },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CO',
          addressRegion: 'Cundinamarca',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          businessDays: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Tuesday', 'Wednesday'],
          },
        },
      },
    },
    aggregateRating:
      TESTIMONIALS_DATA.length > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            reviewCount: TESTIMONIALS_DATA.length,
            bestRating: 5,
          }
        : undefined,
  }));
}

function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function buildReviewSchemas() {
  return TESTIMONIALS_DATA.map(t => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@id': `${SITE_URL}/#organization` },
    author: { '@type': 'Person', name: t.name },
    reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
    reviewBody: t.comment,
  }));
}

export const StructuredData: React.FC = () => {
  useEffect(() => {
    const schemas = [
      buildOrganizationSchema(),
      ...buildProductSchemas(),
      buildFaqSchema(),
      ...buildReviewSchemas(),
    ];

    const nodes: HTMLScriptElement[] = schemas.map((schema, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-schema', `fresh-pick-${i}`);
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      nodes.forEach(node => node.remove());
    };
  }, []);

  return null;
};
