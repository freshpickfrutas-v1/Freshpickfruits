import React from 'react';
import { MapPin, CalendarDays, Truck, Wallet, MessageCircle, ShieldCheck } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BlueberryIcon } from '../components/BlueberryIcon';
import { JsonLd, usePageMeta } from '../lib/seo';
import { useLang, useT, withLang } from '../lib/i18n';
import { WHATSAPP_DISPLAY, waLink } from '../lib/contact';
import { FRUITS_DATA } from '../data/mockData';
import { FRUITS_EN, localizeList } from '../data/mockData.en';

/** Ruta de la página de venta a domicilio en Bogotá (la comparten el menú, el pie, el sitemap y el prerender). */
export const BOGOTA_PATH = '/arandanos-a-domicilio-bogota';

const cop = (n: number) => `$${n.toLocaleString('es-CO')}`;
const grams = (id: string) => Number(id.match(/(\d+)g$/)?.[1] ?? 0);

/**
 * Página que responde la búsqueda "arándanos a domicilio en Bogotá": qué se vende, de dónde viene, cuánto cuesta,
 * cuándo y dónde se entrega y cómo se pide. Los datos de precio salen del mismo catálogo que la tienda.
 * Regla de entrega única (la misma de los Términos, el FAQ, el esquema y llms.txt): solo Bogotá D.C.,
 * martes y miércoles de 8:00 a.m. a 3:00 p.m., primera fecha 8 días después del pedido, domicilio $7.000.
 */
export default function BogotaPage() {
  const t = useT();
  const lang = useLang();
  const fruits = localizeList(FRUITS_DATA, FRUITS_EN, lang);

  usePageMeta({
    title: t('Arándanos frescos a domicilio en Bogotá, directo de la finca | Fresh Pick', 'Fresh blueberries delivered in Bogotá, straight from the farm | Fresh Pick'),
    description: t(
      'Pide arándanos premium de alta montaña cosechados en Guasca y entregados en Bogotá. Estuches de 125 g, 250 g y 500 g desde $8.000, domicilio $7.000, entregas martes y miércoles. Pedidos por WhatsApp.',
      'Order premium high-mountain blueberries picked in Guasca and delivered in Bogotá. 125 g, 250 g and 500 g boxes from COP 8,000, delivery COP 7,000, Tuesdays and Wednesdays. Orders on WhatsApp.'
    ),
    path: BOGOTA_PATH
  });

  const crumbs = [
    { label: t('Inicio', 'Home'), href: '/' },
    { label: t('Arándanos a domicilio en Bogotá', 'Blueberries delivered in Bogotá') }
  ];

  const facts: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    {
      icon: <BlueberryIcon className="w-5 h-5" />,
      label: t('Qué es', 'What it is'),
      value: t('Arándanos frescos premium de alta montaña, cosechados a mano y empacados en estuches de 125 g, 250 g y 500 g.', 'Premium fresh high-mountain blueberries, hand-picked and packed in 125 g, 250 g and 500 g boxes.')
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: t('De dónde viene', 'Where it comes from'),
      value: t('De nuestra finca en la vereda Santa Bárbara, Guasca (Cundinamarca), a más de 2.800 m.s.n.m. Venta directa del productor.', 'From our farm in Vereda Santa Bárbara, Guasca (Cundinamarca), above 2,800 m. Sold directly by the grower.')
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      label: t('Precio', 'Price'),
      value: t('Desde $8.000 el estuche de 125 g. El kilo sale entre $60.000 y $64.000 según el formato. Pedido mínimo: 500 g en total.', 'From COP 8,000 for the 125 g box. A kilo costs between COP 60,000 and 64,000 depending on the size. Minimum order: 500 g in total.')
    },
    {
      icon: <Truck className="w-5 h-5" />,
      label: t('Domicilio', 'Delivery fee'),
      value: t('$7.000 por pedido, siempre. No hay envío gratis.', 'COP 7,000 per order, always. There is no free shipping.')
    },
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: t('Cuándo llega', 'When it arrives'),
      value: t('Entregamos martes y miércoles de 8:00 a.m. a 3:00 p.m. La primera fecha disponible es 8 días después de hacer el pedido, según tu dirección y la ruta del domiciliario.', 'We deliver on Tuesdays and Wednesdays from 8:00 a.m. to 3:00 p.m. The first available date is 8 days after placing the order, depending on your address and the courier route.')
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: t('Dónde entregamos', 'Where we deliver'),
      value: t('Entregamos en Bogotá D.C., de sur a norte desde la calle 13 hasta la calle 192 y de oriente a occidente desde la carrera 5 este hasta la carrera 85. Escríbenos tu dirección por WhatsApp y te confirmamos. Para el resto de Colombia, consulta la venta al por mayor.', 'We deliver in Bogotá D.C., from south to north between calle 13 and calle 192, and from east to west between carrera 5 este and carrera 85. Message us your address on WhatsApp and we will confirm. For the rest of Colombia, see wholesale.')
    }
  ];

  const faqs = [
    {
      q: t('¿Entregan arándanos a domicilio en Bogotá?', 'Do you deliver blueberries in Bogotá?'),
      a: t('Sí. Entregamos en Bogotá D.C. los martes y miércoles de 8:00 a.m. a 3:00 p.m. El domicilio cuesta $7.000.', 'Yes. We deliver in Bogotá D.C. on Tuesdays and Wednesdays from 8:00 a.m. to 3:00 p.m. Delivery costs COP 7,000.')
    },
    {
      q: t('¿Cuánto tardan en llegar?', 'How long does delivery take?'),
      a: t('La primera fecha disponible es 8 días después de hacer el pedido; llega el martes o miércoles que corresponda a tu dirección. No hacemos entregas el mismo día.', 'The first available date is 8 days after you place the order; it arrives on the Tuesday or Wednesday that fits your address. We do not offer same-day delivery.')
    },
    {
      q: t('¿Cuánto cuesta el kilo de arándanos?', 'How much is a kilo of blueberries?'),
      a: t('Entre $60.000 y $64.000 el kilo, según el formato: estuche de 125 g a $8.000, de 250 g a $15.000 y de 500 g a $30.000.', 'Between COP 60,000 and 64,000 per kilo depending on the size: 125 g box at COP 8,000, 250 g at COP 15,000 and 500 g at COP 30,000.')
    },
    {
      q: t('¿Cómo hago el pedido y cómo pago?', 'How do I order and pay?'),
      a: t('Desde la sección “Armar pedido” de la tienda o por WhatsApp. Pagas por transferencia bancaria o Bre-B y programamos el despacho cuando confirmamos el pago.', 'From the “Build your order” section of the shop or on WhatsApp. You pay by bank transfer or Bre-B and we schedule dispatch once payment is confirmed.')
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };

  const orderMessage = t('Hola Fresh Pick, quiero pedir arándanos a domicilio en Bogotá. Mi barrio es: ', 'Hello Fresh Pick, I would like to order blueberries delivered in Bogotá. My neighborhood is: ');

  return (
    <SiteShell>
      <JsonLd data={faqSchema} />
      <section className="fp-gradient-hero border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pb-14">
          <Breadcrumbs items={crumbs} />
          <div className="max-w-3xl mt-6">
            <div className="fp-pill text-xs shadow-sm">
              <BlueberryIcon className="w-4 h-4" />
              <span>{t('Directo de la finca · Guasca → Bogotá', 'Straight from the farm · Guasca → Bogotá')}</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              {t('Arándanos frescos a domicilio en Bogotá, directo de la finca', 'Fresh blueberries delivered in Bogotá, straight from the farm')}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-700 leading-relaxed">
              {t(
                'Cultivamos y cosechamos a mano arándanos de alta montaña en Guasca y te los llevamos a tu casa en Bogotá, sin intermediarios.',
                'We grow and hand-pick high-mountain blueberries in Guasca and bring them to your door in Bogotá, with no middlemen.'
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={waLink(orderMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 fp-btn-primary text-sm">
                <MessageCircle className="w-4 h-4" aria-hidden="true" /> {t('Pedir por WhatsApp', 'Order on WhatsApp')}
              </a>
              <a href={withLang('/#pedidos-personalizados', lang)} className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-[#7B4382] text-[#7B4382] font-bold text-sm hover:bg-[#F5ECF9] transition-colors">
                {t('Armar pedido en línea', 'Build your order online')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7F5F0]/90 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <h2 className="text-2xl font-black font-display text-[#2F183C]">{t('Lo esencial, en pocas líneas', 'The essentials at a glance')}</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {facts.map(f => (
                <div key={f.label} className="rounded-2xl bg-white border border-[#EADBEE] p-5 shadow-xs">
                  <dt className="flex items-center gap-2 font-bold font-display text-[#2F183C]">
                    <span className="w-9 h-9 rounded-lg bg-[#F5ECF9] text-[#7B4382] border border-[#DFCEE6] flex items-center justify-center shrink-0">{f.icon}</span>
                    {f.label}
                  </dt>
                  <dd className="mt-2 text-sm text-stone-700 leading-relaxed">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div id="precios">
            <h2 className="text-2xl font-black font-display text-[#2F183C]">{t('Precios por formato', 'Prices by size')}</h2>
            <p className="mt-2 text-sm text-stone-600">{t('Precios en pesos colombianos (COP). El domicilio ($7.000) se suma al total del pedido.', 'Prices in Colombian pesos (COP). Delivery (COP 7,000) is added to the order total.')}</p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[#EADBEE] bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F5ECF9] text-[#2F183C]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">{t('Formato', 'Size')}</th>
                    <th scope="col" className="px-4 py-3 font-bold">{t('Precio', 'Price')}</th>
                    <th scope="col" className="px-4 py-3 font-bold">{t('Precio por kilo', 'Price per kilo')}</th>
                    <th scope="col" className="px-4 py-3 font-bold">{t('Cómo se pide', 'How to order')}</th>
                  </tr>
                </thead>
                <tbody>
                  {fruits.map(f => {
                    const g = grams(f.id);
                    return (
                      <tr key={f.id} id={f.id} className="border-t border-[#EADBEE]">
                        <th scope="row" className="px-4 py-3 font-semibold text-[#2F183C]">{f.name}</th>
                        <td className="px-4 py-3">{cop(f.standardPrice)}</td>
                        <td className="px-4 py-3">{g ? cop(Math.round((f.standardPrice / g) * 1000)) : '—'}</td>
                        <td className="px-4 py-3 text-stone-600">
                          {g === 500
                            ? t('Desde 1 unidad', 'From 1 box')
                            : t('En múltiplos de 2 unidades', 'In multiples of 2 boxes')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-stone-600">{t('Pedido mínimo total: 500 g. Puedes combinar formatos.', 'Minimum total order: 500 g. You can combine sizes.')}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white border border-[#EADBEE] p-6">
              <h2 className="text-xl font-black font-display text-[#2F183C]">{t('Cómo pedir', 'How to order')}</h2>
              <ol className="mt-3 space-y-2 text-sm text-stone-700 list-decimal pl-5 leading-relaxed">
                <li>{t('Elige tus estuches en la tienda o escríbenos por WhatsApp al', 'Choose your boxes in the shop or message us on WhatsApp at')} {WHATSAPP_DISPLAY}.</li>
                <li>{t('Dinos tu dirección en Bogotá para confirmar la ruta y la fecha.', 'Tell us your Bogotá address so we can confirm the route and date.')}</li>
                <li>{t('Paga por transferencia bancaria o Bre-B.', 'Pay by bank transfer or Bre-B.')}</li>
                <li>{t('Recibe tus arándanos el martes o miércoles acordado, entre 8:00 a.m. y 3:00 p.m.', 'Receive your blueberries on the agreed Tuesday or Wednesday, between 8:00 a.m. and 3:00 p.m.')}</li>
              </ol>
            </div>
            <div className="rounded-2xl bg-white border border-[#EADBEE] p-6">
              <h2 className="flex items-center gap-2 text-xl font-black font-display text-[#2F183C]">
                <ShieldCheck className="w-5 h-5 text-[#7B4382]" aria-hidden="true" /> {t('Por qué directo de la finca', 'Why straight from the farm')}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-700 list-disc pl-5 leading-relaxed">
                <li>{t('Cultivo a más de 2.800 m.s.n.m. con polinización 100% natural.', 'Grown above 2,800 m with 100% natural pollination.')}</li>
                <li>{t('Cosecha manual selectiva, sin ceras artificiales ni residuos químicos.', 'Selective hand harvesting, no artificial waxes or chemical residues.')}</li>
                <li>{t('Vida útil de 14 a 18 días en refrigeración.', '14 to 18 days of shelf life when refrigerated.')}</li>
                <li>{t('Si la fruta no cumple el estándar al recibirla, la reemplazamos o te devolvemos el dinero.', 'If the fruit does not meet our standard on arrival, we replace it or refund you.')}</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black font-display text-[#2F183C]">{t('Preguntas frecuentes sobre el domicilio en Bogotá', 'Frequently asked questions about delivery in Bogotá')}</h2>
            <div className="mt-4 space-y-3">
              {faqs.map(f => (
                <details key={f.q} className="rounded-2xl bg-white border border-[#EADBEE] p-5">
                  <summary className="cursor-pointer font-bold text-[#2F183C]">{f.q}</summary>
                  <p className="mt-2 text-sm text-stone-700 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-4 text-sm text-stone-600">
              {t('¿Más dudas? Mira todas las ', 'More questions? See all the ')}
              <a href={withLang('/#faq', lang)} className="font-semibold text-[#7B4382] underline">{t('preguntas frecuentes', 'frequently asked questions')}</a>
              {t(' o escríbenos por WhatsApp.', ' or message us on WhatsApp.')}
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
