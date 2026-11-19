import React, { useState } from 'react';
import { ArrowRight, Building2, Globe2, Mail, ShieldCheck, Snowflake, Sprout, ClipboardList, Truck } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BlueberryIcon } from '../components/BlueberryIcon';
import { usePageMeta } from '../lib/seo';
import { useT } from '../lib/i18n';
import { WHOLESALE_EMAILS, WHOLESALE_CONTACTS } from '../lib/contact';

export type WholesaleVariant = 'hub' | 'colombia' | 'world';

const field =
  'w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none';

/** Sección de ventas al por mayor: portada con las dos puertas, Colombia y exportación. */
export default function WholesalePage({ variant }: { variant: WholesaleVariant }) {
  const t = useT();

  const meta = {
    hub: {
      title: t('Venta al por mayor de arándanos | Fresh Pick', 'Wholesale Blueberries | Fresh Pick'),
      description: t(
        'Arándanos frescos de alta montaña cultivados en Guasca, Colombia, para restaurantes, hoteles, tiendas, distribuidores e importadores. Elige Al por mayor Colombia o Wholesale World.',
        'Fresh high-mountain blueberries grown in Guasca, Colombia, for restaurants, hotels, stores, distributors and importers. Choose Wholesale Colombia or Wholesale World.'
      ),
      path: '/mayoristas'
    },
    colombia: {
      title: t('Al por mayor Colombia | Arándanos frescos Fresh Pick', 'Wholesale Colombia | Fresh Pick Blueberries'),
      description: t(
        'Arándanos frescos de alta montaña al por mayor para todas las ciudades de Colombia. Pedido mínimo: 1 pallet (aprox. 360 kg). Pedidos únicamente por correo.',
        'Wholesale fresh high-mountain blueberries for every city in Colombia. Minimum order: 1 pallet (about 360 kg). Orders by email only.'
      ),
      path: '/mayoristas/colombia'
    },
    world: {
      title: t('Wholesale World | Arándanos de Colombia para importadores', 'Wholesale World | Colombian Blueberries for Importers'),
      description: t(
        'Arándanos frescos de alta montaña de Colombia para importadores y distribuidores internacionales. Finca registrada ante el ICA para exportación, GLOBALG.A.P. y GRASP.',
        'Fresh high-mountain blueberries from Colombia for importers and international distributors. ICA-registered export farm, GLOBALG.A.P. and GRASP certified.'
      ),
      path: '/mayoristas/mundo'
    }
  }[variant];

  usePageMeta({ ...meta });

  const crumbs = [
    { label: t('Inicio', 'Home'), href: '/' },
    variant === 'hub'
      ? { label: t('Mayoristas', 'Wholesale') }
      : { label: t('Mayoristas', 'Wholesale'), href: '/mayoristas' },
    ...(variant === 'colombia' ? [{ label: t('Al por mayor Colombia', 'Wholesale Colombia') }] : []),
    ...(variant === 'world' ? [{ label: 'Wholesale World' }] : [])
  ];

  return (
    <SiteShell>
      <section className="fp-gradient-hero border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pb-14">
          <Breadcrumbs items={crumbs} />
          <div className="max-w-3xl mt-6">
            <div className="fp-pill text-xs shadow-sm">
              <BlueberryIcon className="w-4 h-4" />
              <span>{t('Venta mayorista', 'Wholesale')}</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              {variant === 'hub' && t('Arándanos de alta montaña para tu negocio', 'High-mountain blueberries for your business')}
              {variant === 'colombia' && t('Al por mayor Colombia', 'Wholesale Colombia')}
              {variant === 'world' && 'Wholesale World'}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-700 leading-relaxed">
              {variant === 'hub' &&
                t(
                  'Cosechados a mano a más de 2.800 m.s.n.m. en Guasca, Cundinamarca. Elige tu mercado: pedido mínimo de 1 pallet (aprox. 360 kg), únicamente por correo.',
                  'Hand-picked above 2,800 m in Guasca, Cundinamarca. Choose your market: minimum order of 1 pallet (about 360 kg), by email only.'
                )}
              {variant === 'colombia' &&
                t(
                  'Venta al por mayor en todas las ciudades de Colombia. Pedido mínimo de 1 pallet (aprox. 360 kg). Los pedidos se hacen únicamente por correo.',
                  'Wholesale sales to every city in Colombia. Minimum order of 1 pallet (about 360 kg). Orders are placed by email only.'
                )}
              {variant === 'world' &&
                t(
                  'Arándanos frescos de Colombia para importadores y distribuidores internacionales. Pedido mínimo de 1 pallet (aprox. 360 kg). Las condiciones de exportación se establecen en la negociación.',
                  'Fresh blueberries from Colombia for importers and international distributors. Minimum order of 1 pallet (about 360 kg). Export terms are set in the negotiation.'
                )}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F7F5F0]/90 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {variant === 'hub' && <Hub />}
          {variant === 'colombia' && <ColombiaInfo />}
          {variant === 'world' && <WorldInfo />}
          {variant !== 'hub' && <QuoteForm variant={variant} />}
          <TrustStrip />
          <p className="text-center text-sm text-stone-700">
            {t('Más información comercial en', 'More commercial information at')}{' '}
            <a href="https://naugroupsas.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-[#7B4382] underline hover:text-[#2F183C]">naugroupsas.com</a>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}

const Hub: React.FC = () => {
  const t = useT();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <a
        href="/mayoristas/colombia"
        className="group rounded-3xl bg-white border border-[#EADBEE] shadow-sm p-6 sm:p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
      >
        <span className="w-12 h-12 rounded-xl bg-[#F5ECF9] text-[#7B4382] border border-[#DFCEE6] flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </span>
        <span className="mt-4 inline-block self-start text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]">Colombia</span>
        <h2 className="mt-3 text-2xl font-black font-display">{t('Al por mayor Colombia', 'Wholesale Colombia')}</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
          <li>• {t('Venta al por mayor en todas las ciudades de Colombia', 'Wholesale to every city in Colombia')}</li>
          <li>• {t('Mínimo 1 pallet (aprox. 360 kg)', 'Minimum 1 pallet (about 360 kg)')}</li>
          <li>• {t('Pedidos únicamente por correo', 'Orders by email only')}</li>
        </ul>
        <span className="mt-6 inline-flex items-center gap-2 font-bold text-[#7B4382] group-hover:text-[#2F183C]">
          {t('Cotizar en Colombia', 'Request a quote in Colombia')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </a>

      <a
        href="/mayoristas/mundo"
        className="group rounded-3xl bg-[#2F183C] text-white border border-[#7B4382]/60 shadow-sm p-6 sm:p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
      >
        <span className="w-12 h-12 rounded-xl bg-[#432356] text-[#DDA83A] border border-[#7B4382] flex items-center justify-center">
          <Globe2 className="w-6 h-6" />
        </span>
        <span className="mt-4 inline-block self-start text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#432356] text-[#DDA83A] border border-[#7B4382]">Export</span>
        <h2 className="mt-3 text-2xl font-black font-display !text-[#DDA83A]">Wholesale World</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-[#DFCEE6]">
          <li>• {t('Importadores y distribuidores internacionales', 'Importers and international distributors')}</li>
          <li>• {t('Mínimo 1 pallet (aprox. 360 kg)', 'Minimum 1 pallet (about 360 kg)')}</li>
          <li>• {t('Condiciones definidas en la negociación', 'Terms set in the negotiation')}</li>
        </ul>
        <span className="mt-6 inline-flex items-center gap-2 font-bold text-[#DDA83A]">
          {t('Solicitar cotización de exportación', 'Request an export quote')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </a>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="rounded-2xl bg-white border border-[#EADBEE] p-5 shadow-xs">
    <span className="w-10 h-10 rounded-lg bg-[#F5ECF9] text-[#7B4382] border border-[#DFCEE6] flex items-center justify-center">{icon}</span>
    <h3 className="mt-3 font-bold font-display text-[#2F183C]">{title}</h3>
    <p className="mt-1 text-sm text-stone-600 leading-relaxed">{text}</p>
  </div>
);

const ColombiaInfo: React.FC = () => {
  const t = useT();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Feature
        icon={<Sprout className="w-5 h-5" />}
        title={t('Fruta de alta montaña', 'High-mountain fruit')}
        text={t('Cultivada a más de 2.800 m.s.n.m., con polinización natural y cosecha manual selectiva.', 'Grown above 2,800 m with natural pollination and selective hand harvesting.')}
      />
      <Feature
        icon={<Snowflake className="w-5 h-5" />}
        title={t('Frescura', 'Freshness')}
        text={t('Vida útil de 14 a 18 días en refrigeración, con la pruina natural intacta.', '14 to 18 days of shelf life when refrigerated, with the natural bloom intact.')}
      />
      <Feature
        icon={<Truck className="w-5 h-5" />}
        title={t('Todas las ciudades', 'Every city')}
        text={t('Vendemos al por mayor en todas las ciudades de Colombia.', 'We sell wholesale to every city in Colombia.')}
      />
      <Feature
        icon={<ClipboardList className="w-5 h-5" />}
        title={t('Pedido mínimo: 1 pallet', 'Minimum order: 1 pallet')}
        text={t('Un pallet son aprox. 360 kg: 240 cajas de 1,5 kg, cada una con 12 estuches de 125 g. Varía según la presentación.', 'One pallet is about 360 kg: 240 boxes of 1.5 kg, each with 12 boxes of 125 g. It varies by pack size.')}
      />
    </div>
  );
};

const WorldInfo: React.FC = () => {
  const t = useT();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Feature
        icon={<ShieldCheck className="w-5 h-5" />}
        title={t('Certificaciones', 'Certifications')}
        text={t('GLOBALG.A.P. (inocuidad), GRASP (prácticas sociales) y registro ICA de predio exportador.', 'GLOBALG.A.P. (food safety), GRASP (social practice) and ICA export farm registration.')}
      />
      <Feature
        icon={<Sprout className="w-5 h-5" />}
        title={t('Origen', 'Origin')}
        text={t('Guasca, Cundinamarca, Colombia, a más de 2.800 m.s.n.m. Cosecha manual y trazabilidad de la finca.', 'Guasca, Cundinamarca, Colombia, above 2,800 m. Hand-picked, with farm traceability.')}
      />
      <Feature
        icon={<Snowflake className="w-5 h-5" />}
        title={t('Calidad', 'Quality')}
        text={t('13° a 15° Brix, fruta firme y con pruina natural. Sin ceras artificiales.', '13° to 15° Brix, firm fruit with natural bloom. No artificial waxes.')}
      />
      <Feature
        icon={<ClipboardList className="w-5 h-5" />}
        title={t('Pedido mínimo: 1 pallet', 'Minimum order: 1 pallet')}
        text={t('Aprox. 360 kg: 240 cajas de 1,5 kg (12 estuches de 125 g). Países, Incoterms y certificados se establecen en la negociación.', 'About 360 kg: 240 boxes of 1.5 kg (12 boxes of 125 g each). Destination countries, Incoterms and certificates are set in the negotiation.')}
      />
    </div>
  );
};

const QuoteForm: React.FC<{ variant: 'colombia' | 'world' }> = ({ variant }) => {
  const t = useT();
  const world = variant === 'world';
  const [v, setV] = useState({ company: '', contact: '', email: '', phone: '', kind: '', place: '', volume: '', incoterm: '', message: '' });
  const [showErrors, setShowErrors] = useState(false);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV(p => ({ ...p, [k]: e.target.value }));

  const missing = !v.company.trim() || !v.contact.trim() || !v.place.trim() || !v.email.trim();

  const lines = world
    ? [
        'WHOLESALE WORLD - QUOTE REQUEST',
        `Company: ${v.company}`,
        `Contact: ${v.contact}`,
        `Country / destination: ${v.place}`,
        `Business type: ${v.kind || '-'}`,
        `Volume (minimum 1 pallet, about 360 kg): ${v.volume || '-'}`,
        `Preferred Incoterm: ${v.incoterm || '-'}`,
        `Email: ${v.email}`,
        `WhatsApp / phone: ${v.phone || '-'}`,
        v.message ? `Message: ${v.message}` : ''
      ]
    : [
        t('AL POR MAYOR COLOMBIA - SOLICITUD DE PEDIDO', 'WHOLESALE COLOMBIA - ORDER REQUEST'),
        `${t('Negocio', 'Business')}: ${v.company}`,
        `${t('Contacto', 'Contact')}: ${v.contact}`,
        `${t('Ciudad', 'City')}: ${v.place}`,
        `${t('Tipo de negocio', 'Business type')}: ${v.kind || '-'}`,
        `${t('Cantidad (mínimo 1 pallet, aprox. 360 kg)', 'Quantity (minimum 1 pallet, about 360 kg)')}: ${v.volume || '-'}`,
        `${t('Correo', 'Email')}: ${v.email}`,
        `WhatsApp: ${v.phone || '-'}`,
        v.message ? `${t('Mensaje', 'Message')}: ${v.message}` : ''
      ];
  const text = lines.filter(Boolean).join('\n');
  const subject = world ? 'Wholesale World - quote request' : t('Al por mayor Colombia - solicitud de pedido', 'Wholesale Colombia - order request');

  // Los pedidos al por mayor se hacen solo por correo y deben llegar a los dos buzones.
  const send = () => {
    if (missing) { setShowErrors(true); return; }
    window.location.href = `mailto:${WHOLESALE_EMAILS.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  };

  const kinds = world
    ? ['Importer', 'Distributor', 'Retailer / supermarket chain', 'Food service', 'Other']
    : [t('Restaurante / hotel', 'Restaurant / hotel'), t('Pastelería / cafetería', 'Bakery / café'), t('Tienda / supermercado', 'Store / supermarket'), t('Distribuidor', 'Distributor'), t('Otro', 'Other')];

  const contacts = WHOLESALE_CONTACTS[variant];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5 space-y-4">
        <h2 className="text-2xl font-black font-display">{world ? 'Place your order request' : t('Haz tu solicitud de pedido', 'Place your order request')}</h2>
        <p className="text-stone-700 leading-relaxed">
          {world
            ? 'Wholesale orders are placed by email only. Complete the form and send it: the message goes to both of our wholesale mailboxes. Destination countries, Incoterms and certificates are agreed during the negotiation.'
            : t('Los pedidos al por mayor se hacen únicamente por correo. Completa el formulario y envíalo: el mensaje llega a nuestros dos correos de ventas mayoristas.', 'Wholesale orders are placed by email only. Complete the form and send it: the message goes to both of our wholesale mailboxes.')}
        </p>
        <div className="rounded-2xl bg-white border border-[#EADBEE] p-4 text-sm space-y-3">
          <p className="font-bold text-[#2F183C]">{world ? 'Minimum order: 1 pallet' : t('Pedido mínimo: 1 pallet', 'Minimum order: 1 pallet')}</p>
          <p className="text-stone-600">
            {world
              ? 'About 360 kg: 240 boxes of 1.5 kg, each with 12 boxes of 125 g. Exact weight varies by pack size.'
              : t('Aprox. 360 kg: 240 cajas de 1,5 kg, cada una con 12 estuches de 125 g. El peso exacto varía según la presentación.', 'About 360 kg: 240 boxes of 1.5 kg, each with 12 boxes of 125 g. Exact weight varies by pack size.')}
          </p>
          <p className="font-bold text-[#2F183C] pt-1">{world ? 'Questions? Contact us' : t('¿Dudas? Escríbenos', 'Questions? Contact us')}</p>
          <ul className="space-y-1.5">
            {contacts.map(c => (
              <li key={c.display + c.email}>
                <a className="font-semibold text-[#7B4382] underline" href={`https://wa.me/${c.phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer">WhatsApp {c.display}</a>
                {' · '}
                <a className="text-[#7B4382] underline break-all" href={`mailto:${c.email}`}>{c.email}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form
        className="lg:col-span-7 bg-white rounded-2xl border border-[#EADBEE] p-5 sm:p-6 shadow-sm space-y-3"
        onSubmit={e => { e.preventDefault(); send(); }}
        noValidate
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={field} placeholder={world ? 'Company' : t('Nombre del negocio', 'Business name')} name="organization" autoComplete="organization" value={v.company} onChange={set('company')} />
          <input className={field} placeholder={world ? 'Contact name' : t('Nombre de contacto', 'Contact name')} name="name" autoComplete="name" value={v.contact} onChange={set('contact')} />
          <input className={field} type="email" placeholder={world ? 'Email' : t('Correo', 'Email')} name="email" autoComplete="email" value={v.email} onChange={set('email')} />
          <input className={field} type="tel" placeholder={world ? 'WhatsApp / phone (with country code)' : t('WhatsApp / teléfono', 'WhatsApp / phone')} name="tel" autoComplete="tel" value={v.phone} onChange={set('phone')} />
          <input className={field} placeholder={world ? 'Country / destination port or airport' : t('Ciudad de entrega', 'Delivery city')} value={v.place} onChange={set('place')} />
          <select className={field} value={v.kind} onChange={set('kind')} aria-label={world ? 'Business type' : t('Tipo de negocio', 'Business type')}>
            <option value="">{world ? 'Business type' : t('Tipo de negocio', 'Business type')}</option>
            {kinds.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <input className={field} placeholder={world ? 'Quantity (number of pallets or kg)' : t('Cantidad (pallets o kg)', 'Quantity (pallets or kg)')} value={v.volume} onChange={set('volume')} />
          {world && (
            <select className={field} value={v.incoterm} onChange={set('incoterm')} aria-label="Preferred Incoterm">
              <option value="">Preferred Incoterm (optional)</option>
              {['EXW', 'FCA', 'FOB', 'CIF', 'CIP', 'DAP'].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          )}
        </div>
        <textarea className={field} rows={4} placeholder={world ? 'Pack size and anything else we should know' : t('Presentación y cualquier detalle que debamos saber', 'Pack size and anything else we should know')} value={v.message} onChange={set('message')} />
        {showErrors && missing && (
          <p role="alert" className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
            {world
              ? 'Please add your company, name, destination and email.'
              : t('Completa el negocio, tu nombre, la ciudad y tu correo.', 'Please add your business, name, city and email.')}
          </p>
        )}
        <button type="button" onClick={send} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2F183C] text-white font-bold hover:bg-[#432356] transition-colors cursor-pointer">
          <Mail className="w-4 h-4 text-[#DDA83A]" /> {world ? 'Send order request by email' : t('Enviar solicitud por correo', 'Send order request by email')}
        </button>
        <p className="text-xs text-stone-500 text-center">
          {world ? 'This opens your email app with the message ready to send.' : t('Se abrirá tu aplicación de correo con el mensaje listo para enviar.', 'This opens your email app with the message ready to send.')}
        </p>
      </form>
    </div>
  );
};

const TrustStrip: React.FC = () => {
  const t = useT();
  const items = [
    ['GLOBALG.A.P.', t('Inocuidad alimentaria', 'Food safety')],
    ['GRASP', t('Bienestar social', 'Social welfare')],
    ['ICA', t('Predio exportador', 'Export farm')],
    ['2.800 m', t('Cultivo de alta montaña', 'High-mountain crop')]
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl bg-[#F5ECF9] border border-[#DFCEE6] p-5">
      {items.map(([title, text]) => (
        <div key={title} className="text-center">
          <p className="font-black font-display text-[#2F183C]">{title}</p>
          <p className="text-xs text-stone-600">{text}</p>
        </div>
      ))}
    </div>
  );
};
