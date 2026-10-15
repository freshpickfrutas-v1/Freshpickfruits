import React from 'react';
import { SiteShell } from '../components/SiteShell';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { usePageMeta } from '../lib/seo';

export type LegalKind = 'privacidad' | 'terminos';

const UPDATED = '15 de octubre de 2026';
const EMAIL = 'info@freshpickfruits.com';

interface Section { title: string; body: React.ReactNode }

const PAGES: Record<LegalKind, { title: string; description: string; intro: string; sections: Section[] }> = {
  privacidad: {
    title: 'Política de Privacidad',
    description: 'Cómo Fresh Pick recoge, usa y protege tus datos personales al comprar arándanos de alta montaña o iniciar sesión en nuestra página.',
    intro: 'En Fresh Pick (Arándanos de Alta Montaña, Guasca, Cundinamarca, Colombia) respetamos tu privacidad. Esta política explica qué datos recogemos, para qué los usamos y cómo puedes ejercer tus derechos, conforme a la Ley 1581 de 2012 de protección de datos personales.',
    sections: [
      { title: 'Datos que recogemos', body: <p>Nombre, correo electrónico, foto de perfil de tu cuenta de Google (si inicias sesión con Google), teléfono, direcciones de entrega, datos de facturación y el historial de tus pedidos y suscripciones.</p> },
      { title: 'Inicio de sesión', body: <p>Puedes ingresar con Google u otros proveedores a través de Firebase Authentication. Solo recibimos tu nombre, correo y foto de perfil; nunca tu contraseña de Google.</p> },
      { title: 'Para qué usamos tus datos', body: <p>Gestionar y entregar tus pedidos, administrar tu cuenta y suscripciones, coordinar entregas por WhatsApp o correo, emitir la facturación y mejorar el servicio. No vendemos tus datos a terceros.</p> },
      { title: 'Con quién los compartimos', body: <p>Solo con proveedores necesarios para operar: Google Firebase (cuentas y base de datos), Vercel (alojamiento), Wompi (pagos en línea) y transportadores para la entrega. Cada uno trata los datos únicamente para prestar su servicio.</p> },
      { title: 'Conservación y seguridad', body: <p>Guardamos tus datos mientras tengas una cuenta o los necesitemos para obligaciones legales y contables. Usamos conexiones cifradas (HTTPS) y acceso restringido a la información.</p> },
      { title: 'Tus derechos', body: <p>Puedes conocer, actualizar, rectificar o eliminar tus datos y revocar tu autorización escribiendo a <a className="text-[#7B4382] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>. Respondemos en los plazos que fija la ley.</p> },
      { title: 'Cookies y almacenamiento local', body: <p>Usamos almacenamiento del navegador para mantener tu sesión y tu carrito de compras. Puedes borrarlos desde la configuración de tu navegador.</p> },
      { title: 'Cambios y contacto', body: <p>Podemos actualizar esta política y publicaremos la nueva versión en esta página. Para cualquier consulta escríbenos a <a className="text-[#7B4382] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> o por WhatsApp al +57 317 893 1026.</p> }
    ]
  },
  terminos: {
    title: 'Términos y Condiciones',
    description: 'Condiciones de uso, pedidos, pagos, entregas y devoluciones de Fresh Pick, arándanos frescos de alta montaña en Guasca, Colombia.',
    intro: 'Al usar este sitio y hacer pedidos a Fresh Pick aceptas estas condiciones. Si no estás de acuerdo, por favor no uses el servicio.',
    sections: [
      { title: 'Quiénes somos', body: <p>Fresh Pick cultiva y vende arándanos frescos de alta montaña en la Vereda Santa Bárbara, Guasca, Cundinamarca, Colombia. Contacto: <a className="text-[#7B4382] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> · WhatsApp +57 317 893 1026.</p> },
      { title: 'Pedidos y disponibilidad', body: <p>Los productos son frescos y dependen de la cosecha. Un pedido queda confirmado cuando Fresh Pick lo acepta; si no hay disponibilidad te lo informaremos y propondremos una alternativa o el reembolso.</p> },
      { title: 'Precios y pagos', body: <p>Los precios se muestran en pesos colombianos (COP). Puedes pagar por transferencia, Bre-B o en línea con Wompi, según lo disponible al hacer el pedido.</p> },
      { title: 'Entregas', body: <p>Las entregas se programan los martes y miércoles entre las 8:00 a.m. y las 3:00 p.m., en las zonas de cobertura indicadas. Es responsabilidad del cliente suministrar una dirección y un contacto correctos.</p> },
      { title: 'Cambios y devoluciones', body: <p>Por ser un producto perecedero, si recibes fruta en mal estado avísanos por WhatsApp o correo el mismo día de la entrega, con una foto, y la reemplazaremos o reembolsaremos. Para compras a distancia aplica también el derecho de retracto de la Ley 1480 de 2011, salvo en bienes perecederos.</p> },
      { title: 'Suscripciones', body: <p>Los planes mensuales se renuevan según el plan elegido. Puedes pausarlos o cancelarlos avisándonos antes de la siguiente entrega.</p> },
      { title: 'Tu cuenta', body: <p>Eres responsable de la información de tu cuenta y de la actividad realizada con ella. Podemos suspender cuentas que hagan un uso indebido del servicio.</p> },
      { title: 'Contenido del sitio', body: <p>Los textos, imágenes y marca de Fresh Pick son nuestros o se usan con autorización; no pueden reproducirse sin permiso. La información de recetas y noticias es informativa y no reemplaza consejo médico.</p> },
      { title: 'Datos personales y cambios', body: <p>El tratamiento de tus datos se rige por nuestra <a className="text-[#7B4382] underline" href="/privacidad">Política de Privacidad</a>. Podemos actualizar estos términos y publicaremos la versión vigente en esta página. Se rigen por las leyes de Colombia.</p> }
    ]
  }
};

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const page = PAGES[kind];
  usePageMeta({
    title: `${page.title} | Fresh Pick`,
    description: page.description,
    path: `/${kind}`
  });

  return (
    <SiteShell>
      <section className="fp-gradient-hero">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: page.title }]} />
          <h1 className="mt-6 text-3xl sm:text-4xl font-black font-display">{page.title}</h1>
          <p className="mt-2 text-xs text-stone-500">Última actualización: {UPDATED}</p>
          <p className="mt-5 text-stone-700 leading-relaxed">{page.intro}</p>
          <div className="mt-8 space-y-6">
            {page.sections.map((s, i) => (
              <section key={s.title}>
                <h2 className="text-lg font-bold font-display">{i + 1}. {s.title}</h2>
                <div className="mt-1.5 text-stone-700 leading-relaxed text-sm sm:text-base">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
