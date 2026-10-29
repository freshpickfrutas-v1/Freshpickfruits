import React from 'react';
import { SiteShell } from '../components/SiteShell';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { usePageMeta } from '../lib/seo';
import { openCookieSettings } from '../components/CookieBanner';

type LegalKind = 'datos' | 'terminos' | 'cookies';

const COMPANY = 'ANDEAN FRUIT COMPANY SAS';
const BRAND = 'Fresh Pick';
const EMAIL = 'info@freshpickfruits.com';
const PHONE = '+57 317 893 1026';
const SITE = 'https://www.freshpickfruits.com';
// Pendiente de completar por la empresa antes de publicar: NIT y dirección legal.
const NIT = '[NIT por completar]';
const ADDRESS = 'Vereda Santa Bárbara, Guasca, Cundinamarca, Colombia';
const UPDATED = '29 de octubre de 2026';

const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-black text-[#2F183C] font-display mt-8 mb-2">{children}</h2>
);
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-stone-700 leading-relaxed mb-3">{children}</p>;
const UL: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-6 space-y-1.5 text-stone-700 leading-relaxed mb-3">
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ul>
);

const Datos = () => (
  <>
    <P>
      <strong>{COMPANY}</strong> ({BRAND}), NIT {NIT}, con domicilio en {ADDRESS}, es la responsable del tratamiento de los datos personales que recolecta a través de {SITE}, WhatsApp y demás canales de atención.
      Contacto: <a className="underline text-[#7B4382]" href={`mailto:${EMAIL}`}>{EMAIL}</a> · {PHONE}.
    </P>
    <H>1. Marco legal</H>
    <P>Esta política se rige por la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las instrucciones de la Superintendencia de Industria y Comercio (SIC).</P>
    <H>2. Datos que recolectamos</H>
    <P>Nombre, teléfono o WhatsApp, correo electrónico, dirección de entrega, documento de identidad o NIT y datos de facturación (opcionales según el caso), historial de pedidos y datos técnicos de navegación. No solicitamos datos sensibles ni de menores de edad.</P>
    <H>3. Finalidades del tratamiento</H>
    <UL items={[
      'Gestionar tu pedido: confirmación, cobro, alistamiento, entrega a domicilio y seguimiento.',
      'Emitir facturas y cumplir obligaciones contables y tributarias.',
      'Atender consultas, peticiones, quejas y reclamos (PQR).',
      'Enviarte información comercial, promociones y novedades, solo si lo autorizas de forma adicional.',
      'Medir el uso del sitio y mejorar la experiencia, con cookies cuando las aceptes.',
      'Cumplir requerimientos de autoridades competentes.',
    ]} />
    <H>4. Derechos del titular</H>
    <P>Como titular puedes conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización; ser informado del uso que se les ha dado; presentar quejas ante la SIC; revocar la autorización o solicitar la supresión cuando no se respeten los principios y garantías legales; y acceder gratuitamente a tus datos.</P>
    <H>5. Cómo ejercer tus derechos</H>
    <P>Escríbenos a <a className="underline text-[#7B4382]" href={`mailto:${EMAIL}`}>{EMAIL}</a> o por WhatsApp al {PHONE}. Las consultas se responden en máximo 10 días hábiles (prorrogables 5 días hábiles más, con aviso) y los reclamos en máximo 15 días hábiles.</P>
    <H>6. Transferencia y transmisión de datos</H>
    <P>Usamos proveedores tecnológicos que pueden almacenar o procesar datos fuera de Colombia, como Google (Firebase, autenticación y base de datos), Vercel (alojamiento) y Wompi (pagos en línea). Exigimos a estos proveedores niveles adecuados de seguridad y confidencialidad.</P>
    <H>7. Conservación y seguridad</H>
    <P>Conservamos tus datos mientras exista la relación comercial y durante los plazos exigidos por la ley contable y tributaria. Aplicamos medidas técnicas, humanas y administrativas como conexión cifrada (HTTPS), control de acceso por roles y reglas de acceso a la base de datos.</P>
    <H>8. Cookies</H>
    <P>Consulta nuestra <a className="underline text-[#7B4382]" href="/politica-de-cookies">Política de Cookies</a>.</P>
    <H>9. Vigencia</H>
    <P>Esta política rige desde el {UPDATED}. Cualquier cambio sustancial será publicado en este sitio.</P>
  </>
);

const Terminos = () => (
  <>
    <H>1. Quiénes somos</H>
    <P>{BRAND} es una marca de {COMPANY}. {BRAND} produce y comercializa arándanos frescos de alta montaña cultivados en Guasca, Cundinamarca, y los entrega a domicilio en Bogotá.</P>
    <H>2. Pedidos y precios</H>
    <P>El pedido mínimo es de 500 g en total. Los estuches de 125 g y 250 g se piden en múltiplos de 2 unidades. Máximo por pedido: 80 estuches de 125 g, 40 de 250 g y 20 de 500 g; para volúmenes mayores, escríbenos por WhatsApp. Los precios están en pesos colombianos (COP).</P>
    <H>3. Disponibilidad</H>
    <P>Los pedidos se atienden de acuerdo a disponibilidad de cosecha. Si no podemos cumplir un pedido total o parcialmente, te lo informaremos y acordaremos una alternativa o la devolución de lo pagado por lo no entregado.</P>
    <H>4. Entregas</H>
    <UL items={[
      'Entregamos únicamente en Bogotá, los martes y miércoles, entre las 8:00 a.m. y las 3:00 p.m.',
      'La fecha de entrega se programa mínimo 8 días después de hacer el pedido.',
      'Debes proporcionar una dirección completa y estar disponible para recibir. Si nadie recibe el pedido, lo reprogramaremos y podría generar un costo adicional de envío.',
      'El valor del domicilio es de $6.000 COP con transferencia o Bre-B y de $7.000 COP con pago en línea.',
    ]} />
    <H>5. Calidad del producto</H>
    <P>Si tu pedido llega en mal estado o con diferencias frente a lo pedido, repórtalo por WhatsApp el mismo día de la entrega, con fotos. Previa verificación, reemplazaremos el producto afectado.</P>
    <H>6. Pagos</H>
    <P>Puedes pagar por transferencia, Bre-B o en línea. Los pagos en línea se procesan por Wompi y tienen una comisión de la pasarela del 5% que se informa antes de pagar. No iniciamos el alistamiento sin pago confirmado.</P>
    <H>7. Uso del sitio y de tu cuenta</H>
    <P>Eres responsable de la información que ingresas y de mantener segura tu cuenta. Nos reservamos el derecho de suspender o cancelar pedidos o cuentas por uso indebido del servicio o de tu cuenta, o por información falsa.</P>
    <H>8. Suscripciones</H>
    <P>Las suscripciones se entregan según el plan elegido, en los mismos días y condiciones de entrega descritos arriba. Puedes pausar o cancelar avisándonos por WhatsApp antes del siguiente despacho.</P>
    <H>9. Datos personales</H>
    <P>El tratamiento de tus datos se rige por nuestra <a className="underline text-[#7B4382]" href="/politica-de-tratamiento-de-datos">Política de Tratamiento de Datos Personales</a>.</P>
    <H>10. Contacto y vigencia</H>
    <P>Escríbenos a <a className="underline text-[#7B4382]" href={`mailto:${EMAIL}`}>{EMAIL}</a> o al {PHONE}. Estos términos rigen desde el {UPDATED} y se rigen por las leyes de Colombia.</P>
  </>
);

const Cookies = () => (
  <>
    <P>Las cookies son pequeños archivos que el sitio guarda en tu navegador. En {BRAND} las usamos así:</P>
    <H>Cookies necesarias</H>
    <P>Mantienen tu sesión iniciada, tu carrito y tus preferencias de cookies. Sin ellas el sitio no funciona; no requieren consentimiento.</P>
    <H>Cookies de análisis</H>
    <P>Nos dicen qué páginas se visitan y qué tan rápido carga el sitio, para mejorarlo. Solo se activan si las aceptas.</P>
    <H>Cookies de marketing</H>
    <P>Permiten medir campañas de Google y Meta y mostrarte anuncios de {BRAND}. Solo se activan si las aceptas.</P>
    <H>Cómo cambiar tu decisión</H>
    <P>
      <button type="button" onClick={openCookieSettings} className="underline font-semibold text-[#7B4382] cursor-pointer">Abrir configuración de cookies</button>
      {' '}o borra las cookies desde los ajustes de tu navegador.
    </P>
    <P>Más información en la <a className="underline text-[#7B4382]" href="/politica-de-tratamiento-de-datos">Política de Tratamiento de Datos</a>. Última actualización: {UPDATED}.</P>
  </>
);

const PAGES: Record<LegalKind, { title: string; description: string; path: string; Body: React.FC }> = {
  datos: {
    title: 'Política de Tratamiento de Datos Personales',
    description: 'Cómo Fresh Pick (ANDEAN FRUIT COMPANY SAS) trata tus datos personales según la Ley 1581 de 2012 y cómo ejercer tus derechos.',
    path: '/politica-de-tratamiento-de-datos',
    Body: Datos,
  },
  terminos: {
    title: 'Términos y Condiciones',
    description: 'Condiciones de compra, pago y entrega a domicilio de Fresh Pick: arándanos de alta montaña en Bogotá.',
    path: '/terminos-y-condiciones',
    Body: Terminos,
  },
  cookies: {
    title: 'Política de Cookies',
    description: 'Qué cookies usa freshpickfruits.com, para qué sirven y cómo gestionarlas.',
    path: '/politica-de-cookies',
    Body: Cookies,
  },
};

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const { title, description, path, Body } = PAGES[kind];
  usePageMeta({ title: `${title} | Fresh Pick`, description, path });

  return (
    <SiteShell>
      <section className="fp-gradient-hero border-b border-stone-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: title }]} />
          <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight font-display">{title}</h1>
        </div>
      </section>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 bg-white/90 rounded-2xl my-8 shadow-sm">
        <Body />
      </article>
    </SiteShell>
  );
}
