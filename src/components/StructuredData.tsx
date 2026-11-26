import React from 'react';
import { JsonLd } from '../lib/seo';
import { FRUITS_DATA, FAQ_DATA, TESTIMONIALS_DATA } from '../data/mockData';
import { FAQ_EN, FRUITS_EN, localizeList } from '../data/mockData.en';
import { Lang, useLang } from '../lib/i18n';
import { SOCIAL_LINKS } from '../lib/contact';

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

function buildOrganizationSchema(lang: Lang) {
  const en = lang === 'en';
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: 'Fresh Pick',
    legalName: 'ANDEAN FRUIT COMPANY SAS',
    alternateName: en ? 'Fresh Pick High-Mountain Blueberries' : 'Fresh Pick Arándanos de Alta Montaña',
    description: en
      ? 'Fresh Pick grows and sells premium high-mountain blueberries (above 2,800 m) in Guasca, Cundinamarca, Colombia, with 100% natural pollination, selective hand harvesting and zero chemical residues. Home delivery in Bogotá D.C. only, on Tuesdays and Wednesdays (first available date 8 days after the order), with orders by WhatsApp or a custom order online. Wholesale supply for Colombia and export.'
      : 'Fresh Pick cultiva y vende arándanos premium de alta montaña (más de 2.800 m.s.n.m.) en Guasca, Cundinamarca, Colombia, con polinización 100% natural, cosecha manual selectiva y cero residualidad química. Entrega a domicilio solo en Bogotá D.C., martes y miércoles (primera fecha disponible 8 días después del pedido), con pedidos por WhatsApp o pedido personalizado en línea.',
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
    // Negocio de área de servicio: se entrega solo en Bogotá D.C. (la finca no recibe público; el horario es de entregas, ver shippingDetails).
    areaServed: { '@type': 'City', name: 'Bogotá', containedInPlace: { '@type': 'Country', name: 'Colombia' } },
    sameAs: Object.values(SOCIAL_LINKS),
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

const REAL_TESTIMONIALS = TESTIMONIALS_DATA.filter(t => !t.pendiente);

function buildProductSchemas(lang: Lang) {
  const fruits = localizeList(FRUITS_DATA, FRUITS_EN, lang);
  const en = lang === 'en';
  const avgRating =
    REAL_TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / (REAL_TESTIMONIALS.length || 1);

  return fruits.map(f => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/#product-${f.id}`,
    name: f.name,
    description: `${f.tagline}. ${f.description}`,
    image: absoluteImage(f.imageUrl),
    brand: { '@type': 'Brand', name: 'Fresh Pick' },
    category: en ? 'Fresh blueberries' : 'Arándanos frescos / Blueberries',
    sku: f.id,
    additionalProperty: [
      { '@type': 'PropertyValue', name: en ? 'Brix degrees' : 'Grados Brix', value: f.brix },
      { '@type': 'PropertyValue', name: en ? 'Growing altitude' : 'Altitud de cultivo', value: f.altitude },
      { '@type': 'PropertyValue', name: en ? 'Shelf life' : 'Vida útil', value: f.shelfLife },
    ],
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/arandanos-a-domicilio-bogota#${f.id}`,
      priceCurrency: 'COP',
      price: f.standardPrice,
      availability: f.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 7000, currency: 'COP' },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CO',
          addressRegion: 'Bogotá D.C.',
        },
        // Una sola regla de plazo: primera entrega 8 días después del pedido, solo martes y miércoles de 8:00 a 15:00.
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 8, unitCode: 'DAY' },
          businessDays: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Tuesday', 'Wednesday'],
            opens: '08:00',
            closes: '15:00',
          },
        },
      },
    },
    aggregateRating:
      REAL_TESTIMONIALS.length > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            reviewCount: REAL_TESTIMONIALS.length,
            bestRating: 5,
          }
        : undefined,
  }));
}

function buildFaqSchema(lang: Lang) {
  const faqs = localizeList(FAQ_DATA, FAQ_EN, lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(item => ({
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
  return REAL_TESTIMONIALS.map(t => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@id': `${SITE_URL}/#organization` },
    author: { '@type': 'Person', name: t.name },
    reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
    reviewBody: t.comment,
  }));
}

function buildWebSiteSchema(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Fresh Pick',
    inLanguage: lang === 'en' ? 'en' : 'es-CO',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

// Se pinta como <script> dentro de la página (no con un efecto del navegador) para que también salga en el HTML prerenderizado.
export const StructuredData: React.FC = () => {
  const lang = useLang();
  return (
    <>
      {[
        buildOrganizationSchema(lang),
        buildWebSiteSchema(lang),
        ...buildProductSchemas(lang),
        buildFaqSchema(lang),
        ...buildReviewSchemas(),
      ].map((schema, i) => <JsonLd key={i} data={schema} />)}
    </>
  );
};
