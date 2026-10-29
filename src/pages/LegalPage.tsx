import React from 'react';
import { SiteShell } from '../components/SiteShell';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { usePageMeta } from '../lib/seo';
import { openCookieSettings } from '../components/CookieBanner';

export type LegalKind = 'privacidad' | 'terminos' | 'cookies';

const UPDATED = '29 de octubre de 2026';
const EMAIL = 'info@freshpickfruits.com';

interface Section { title: string; body: React.ReactNode }

const PAGES: Record<LegalKind, { title: string; description: string; intro: string; sections: Section[] }> = {
  privacidad: {
    title: 'Política de Privacidad',
    description: 'Cómo Fresh Pick recoge, usa y protege tus datos personales al comprar arándanos de alta montaña o iniciar sesión en nuestra página.',
    intro: 'En Fresh Pick (Arándanos de Alta Montaña, Guasca, Cundinamarca, Colombia) respetamos tu privacidad. Esta política explica qué datos recogemos, para qué los usamos y cómo puedes ejercer tus derechos, conforme a la Ley 1581 de 2012 de protección de datos personales.',
    sections: [
      { title: 'Quién es el responsable', body: <p>Fresh Pick (ANDEAN FRUIT COMPANY SAS, NIT [NIT por completar]), productor de arándanos de alta montaña con cultivos en la Vereda Santa Bárbara, Guasca, Cundinamarca, Colombia, es el responsable del tratamiento de los datos personales recogidos en freshpickfruits.com. Contacto: <a className="text-[#7B4382] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> · WhatsApp +57 317 893 1026.</p> },
      { title: 'Datos que recogemos', body: <p>Recogemos únicamente los datos necesarios para vender y entregar nuestros arándanos: nombre, correo electrónico, foto de perfil de tu cuenta (si inicias sesión con Google), teléfono, direcciones de entrega, datos de facturación (nombre o razón social y documento de identificación) y el historial de tus pedidos y suscripciones. Si nos escribes por WhatsApp o correo, guardamos esa conversación para atender tu pedido.</p> },
      { title: 'Datos de tu cuenta de Google', body: (
        <>
          <p>Si eliges «Iniciar sesión con Google», Google nos comparte solo tu <strong>nombre, tu dirección de correo electrónico y tu foto de perfil</strong> (permisos básicos de identidad: perfil y correo). No pedimos acceso a tu Gmail, contactos, calendario, Drive ni a ningún otro dato de tu cuenta de Google, y nunca recibimos tu contraseña.</p>
          <p className="mt-2">Usamos estos datos únicamente para: (a) crear y reconocer tu cuenta en Fresh Pick, (b) mostrarte tus pedidos, direcciones y suscripciones, y (c) contactarte sobre tus pedidos. No los usamos para publicidad, no los vendemos ni los transferimos a terceros para fines distintos, y no los usamos para entrenar modelos de inteligencia artificial. El uso que hacemos de la información recibida de Google se ajusta a la <a className="text-[#7B4382] underline" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Política de datos de usuario de los Servicios de API de Google</a>, incluidos los requisitos de uso limitado.</p>
        </>
      ) },
      { title: 'Para qué usamos tus datos', body: <p>Para gestionar y entregar tus pedidos, administrar tu cuenta y tus suscripciones mensuales, coordinar las entregas (martes y miércoles) por WhatsApp o correo, procesar pagos, emitir la facturación y cumplir obligaciones legales y contables. No vendemos tus datos ni los usamos para perfiles publicitarios.</p> },
      { title: 'Autorización y finalidades', body: <p>Al hacer un pedido nos autorizas, de forma previa, expresa e informada, a tratar tus datos para gestionar el pedido, cobrar, entregar, facturar y contactarte sobre el servicio. Solo te enviaremos información comercial si lo autorizas aparte. Esta autorización la puedes revocar en cualquier momento por los canales de contacto.</p> },
      { title: 'Con quién los compartimos', body: <p>Solo con los proveedores necesarios para operar el servicio, que tratan los datos únicamente para prestarlo: Google Firebase (autenticación y base de datos), Vercel (alojamiento del sitio), Wompi (pagos en línea), Resend (correos de confirmación de pedidos) y las empresas de transporte que realizan la entrega. También podemos compartir datos cuando una autoridad competente lo exija por ley.</p> },
      { title: 'Dónde y cuánto tiempo los guardamos', body: <p>Los datos se almacenan en los servidores de Google Firebase. Conservamos tu información mientras mantengas una cuenta activa y, después, solo el tiempo que exijan las obligaciones legales, tributarias y contables en Colombia (por ejemplo, la conservación de facturas). Pasado ese tiempo se eliminan o se anonimizan.</p> },
      { title: 'Seguridad', body: <p>Usamos conexiones cifradas (HTTPS), reglas de acceso para que cada cliente vea solo su propia información y acceso restringido para el equipo de Fresh Pick. Ningún sistema es completamente infalible, pero aplicamos medidas razonables para proteger tus datos.</p> },
      { title: 'Tus derechos y cómo eliminar tus datos', body: <p>Conforme a la Ley 1581 de 2012 puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar tu autorización, escribiendo a <a className="text-[#7B4382] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> o por WhatsApp al +57 317 893 1026. Para borrar tu cuenta y los datos asociados, solicítalo por esos medios; las consultas se responden en máximo 10 días hábiles (prorrogables 5 más, con aviso) y los reclamos en máximo 15 días hábiles. También puedes presentar quejas ante la Superintendencia de Industria y Comercio (SIC). También puedes retirar el acceso de Fresh Pick a tu cuenta de Google desde <a className="text-[#7B4382] underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.</p> },
      { title: 'Cookies y almacenamiento local', body: <p>Usamos almacenamiento del navegador para mantener tu sesión iniciada, tu carrito de compras y tus preferencias de cookies. Las cookies de análisis y marketing solo se activan si las aceptas. Consulta la <a className="text-[#7B4382] underline" href="/cookies">Política de Cookies</a>. Puedes borrar los datos desde la configuración de tu navegador; si lo haces, tendrás que volver a iniciar sesión.</p> },
      { title: 'Menores de edad', body: <p>Nuestro sitio no está dirigido a menores de 18 años y no recogemos conscientemente sus datos. Si crees que un menor nos ha entregado información, escríbenos para eliminarla.</p> },
      { title: 'Cambios y contacto', body: <p>Podemos actualizar esta política y publicaremos la versión vigente en esta página con su fecha de actualización. Para cualquier consulta escríbenos a <a className="text-[#7B4382] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> o por WhatsApp al +57 317 893 1026.</p> }
    ]
  },
  cookies: {
    title: 'Política de Cookies',
    description: 'Qué cookies usa freshpickfruits.com, para qué sirven y cómo gestionarlas.',
    intro: 'Las cookies son pequeños archivos que el sitio guarda en tu navegador. Así las usamos en Fresh Pick.',
    sections: [
      { title: 'Necesarias', body: <p>Mantienen tu sesión, tu carrito y tus preferencias de cookies. Sin ellas el sitio no funciona y no requieren consentimiento.</p> },
      { title: 'Análisis', body: <p>Nos dicen qué páginas se visitan y qué tan rápido carga el sitio para mejorarlo. Solo se activan si las aceptas.</p> },
      { title: 'Marketing', body: <p>Permiten medir campañas de Google y Meta. Solo se activan si las aceptas.</p> },
      { title: 'Cómo cambiar tu decisión', body: <p><button type="button" onClick={openCookieSettings} className="font-semibold text-[#7B4382] underline cursor-pointer">Abrir configuración de cookies</button>, o borra las cookies desde tu navegador. Más información en la <a className="text-[#7B4382] underline" href="/privacidad">Política de Privacidad</a>.</p> }
    ]
  },
  terminos: {
    title: 'Términos y Condiciones',
    description: 'Condiciones de uso, pedidos, pagos, entregas y devoluciones de Fresh Pick, arándanos frescos de alta montaña en Guasca, Colombia.',
    intro: 'Al usar este sitio y hacer pedidos a Fresh Pick aceptas estas condiciones. Si no estás de acuerdo, por favor no uses el servicio.',
    sections: [
      { title: 'Quiénes somos', body: <p>Fresh Pick (ANDEAN FRUIT COMPANY SAS) produce y comercializa arándanos frescos de alta montaña cultivados en la Vereda Santa Bárbara, Guasca, Cundinamarca, Colombia. Contacto: <a className="text-[#7B4382] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> · WhatsApp +57 317 893 1026.</p> },
      { title: 'Pedidos y disponibilidad', body: <p>Los productos son frescos y dependen de la cosecha. Un pedido queda confirmado cuando Fresh Pick lo acepta; si no hay disponibilidad te lo informaremos y propondremos una alternativa o el reembolso.</p> },
      { title: 'Precios y pagos', body: <p>Los precios se muestran en pesos colombianos (COP). Puedes pagar por transferencia, Bre-B o en línea con Wompi, de acuerdo a disponibilidad al hacer el pedido. El domicilio cuesta $6.000 COP con transferencia o Bre-B y $7.000 COP con pago en línea, que además tiene una comisión de la pasarela del 5% informada antes de pagar. No iniciamos el alistamiento sin pago confirmado.</p> },
      { title: 'Pedido mínimo y máximo', body: <p>El pedido mínimo es de 500 g en total; los estuches de 125 g y 250 g se piden en múltiplos de 2 unidades. Máximo por pedido: 80 estuches de 125 g, 40 de 250 g y 20 de 500 g. Para volúmenes mayores escríbenos por WhatsApp.</p> },
      { title: 'Entregas', body: <p>Entregamos en Bogotá los martes y miércoles entre las 8:00 a.m. y las 3:00 p.m., con mínimo 8 días de anticipación frente a la fecha del pedido. Es responsabilidad del cliente suministrar una dirección y un contacto correctos.</p> },
      { title: 'Cambios y devoluciones', body: <p>Por ser un producto perecedero, si recibes fruta en mal estado avísanos por WhatsApp o correo el mismo día de la entrega, con una foto, y la reemplazaremos. Para compras a distancia aplica también el derecho de retracto de la Ley 1480 de 2011, salvo en bienes perecederos.</p> },
      { title: 'Suscripciones', body: <p>Los planes mensuales se renuevan según el plan elegido. Puedes pausarlos o cancelarlos avisándonos antes de la siguiente entrega.</p> },
      { title: 'Tu cuenta', body: <p>Eres responsable de la información de tu cuenta y de la actividad realizada con ella. Podemos suspender cuentas o cancelar pedidos por uso indebido del servicio o de tu cuenta.</p> },
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
