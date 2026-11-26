import React from 'react';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, FileText, Heart, Instagram, Facebook, Music2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { openCookieSettings } from './CookieBanner';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useT } from '../lib/i18n';
import { waLink, SOCIAL_LINKS } from '../lib/contact';

export const Footer: React.FC = () => {
  const { isStaff } = useAuth();
  const t = useT();
  return (
    <footer id="contacto" className="bg-[#1E0E27] text-stone-300 pt-16 pb-12 border-t border-[#432356]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#432356]">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              <div className="h-16 sm:h-20 w-28 sm:w-36 rounded-xl bg-white p-2 border-2 border-[#7B4382] shadow-xl flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt={t('Fresh Pick - Logo de arándanos de alta montaña y agricultura limpia', 'Fresh Pick - Logo: high-mountain blueberries and clean farming')}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                    Fresh Pick
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#432356] text-[#DDA83A] border border-[#7B4382]">
                    {t('Arándanos', 'Blueberries')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#DFCEE6] mt-1 font-medium">
                  {t('Arándanos de Alta Montaña', 'High-Mountain Blueberries')} · Guasca, Cundinamarca
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              {t('Inspirados en la agricultura responsable andina. Cosechamos a mano arándanos de alta montaña con polinización natural, calibre superior y respeto por la biodiversidad.', 'Inspired by responsible Andean farming. We hand-pick high-mountain blueberries with natural pollination, premium size and respect for biodiversity.')}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={waLink(t('Hola Fresh Pick, quiero hacer un pedido de arándanos', 'Hello Fresh Pick, I would like to order blueberries'))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#2F183C] border border-[#7B4382] flex items-center justify-center text-[#DDA83A] hover:bg-[#DDA83A] hover:text-[#2F183C] transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`mailto:info@freshpickfruits.com`}
                className="w-9 h-9 rounded-lg bg-[#2F183C] border border-[#7B4382] flex items-center justify-center text-stone-300 hover:bg-[#DDA83A] hover:text-[#2F183C] transition-colors"
                aria-label={t('Correo electrónico', 'Email')}
              >
                <Mail className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[#2F183C] border border-[#7B4382] flex items-center justify-center text-stone-300 hover:bg-[#DDA83A] hover:text-[#2F183C] transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[#2F183C] border border-[#7B4382] flex items-center justify-center text-stone-300 hover:bg-[#DDA83A] hover:text-[#2F183C] transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[#2F183C] border border-[#7B4382] flex items-center justify-center text-stone-300 hover:bg-[#DDA83A] hover:text-[#2F183C] transition-colors" aria-label="X">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[#2F183C] border border-[#7B4382] flex items-center justify-center text-stone-300 hover:bg-[#DDA83A] hover:text-[#2F183C] transition-colors" aria-label="TikTok">
                <Music2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('Nuestros Arándanos', 'Our Blueberries')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#variedades" className="hover:text-[#DDA83A] transition-colors">
                  {t('Estuche 125g', '125 g box')}
                </a>
              </li>
              <li>
                <a href="/#variedades" className="hover:text-[#DDA83A] transition-colors">
                  {t('Estuche 250g', '250 g box')}
                </a>
              </li>
              <li>
                <a href="/#variedades" className="hover:text-[#DDA83A] transition-colors">
                  {t('Estuche 500g', '500 g box')}
                </a>
              </li>
              <li>
                <a href="/#planes-mensuales" className="hover:text-[#DDA83A] transition-colors">
                  {t('Planes Mensuales', 'Monthly Plans')}
                </a>
              </li>
              <li>
                <a href="/recetas" className="hover:text-[#DDA83A] transition-colors">
                  {t('Recetas con Arándanos', 'Blueberry Recipes')}
                </a>
              </li>
              <li>
                <a href="/noticias" className="hover:text-[#DDA83A] transition-colors">
                  {t('Noticias de Arándanos', 'Blueberry News')}
                </a>
              </li>
              <li>
                <a href="/arandanos-a-domicilio-bogota" className="hover:text-[#DDA83A] transition-colors">
                  {t('Arándanos a domicilio en Bogotá', 'Blueberries delivered in Bogotá')}
                </a>
              </li>
              <li>
                <a href="/mayoristas" className="hover:text-[#DDA83A] transition-colors">
                  {t('Ventas nacionales al por mayor', 'International Wholesale')}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('Servicios & Pedidos', 'Services & Orders')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#pedidos-personalizados" className="text-[#DDA83A] font-semibold hover:underline">
                  {t('★ Armar Pedido Personalizado en Línea', '★ Build a Custom Order Online')}
                </a>
              </li>
              <li>
                <a href="/#planes-mensuales" className="hover:text-[#DDA83A] transition-colors">
                  {t('Planes Mensuales Familiares', 'Monthly Family Plans')}
                </a>
              </li>
              <li>
                <a href="/panel" className="hover:text-[#DDA83A] transition-colors">
                  {t('Mi cuenta / Panel usuario', 'My account / Customer panel')}
                </a>
              </li>
              {isStaff && (
                <li>
                  <a href="/admin" className="hover:text-[#DDA83A] transition-colors">
                    {t('Panel del equipo', 'Team panel')}
                  </a>
                </li>
              )}
              <li>
                <a href="/#sostenibilidad" className="hover:text-[#DDA83A] transition-colors">
                  {t('Nuestra Biofábrica & Polinización', 'Our Bio-factory & Pollination')}
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-[#DDA83A] transition-colors">
                  {t('Preguntas Frecuentes y Envíos', 'FAQ & Shipping')}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('Atención & Despachos', 'Support & Dispatch')}
            </h4>

            <div className="space-y-2 text-stone-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#DDA83A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">{t('Línea & WhatsApp:', 'Phone & WhatsApp:')}</span>
                  <span>+57 317 893 1026</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#DDA83A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">{t('Correo:', 'Email:')}</span>
                  <span>info@freshpickfruits.com</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#DDA83A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">{t('Ubicación de Cultivos:', 'Farm location:')}</span>
                  <span>{t('Vereda Santa Bárbara · Guasca, Cundinamarca', 'Santa Bárbara hamlet · Guasca, Cundinamarca')}</span>
                  <span className="block text-xs text-stone-500">{t('Más de 2.800 m.s.n.m.', 'Over 2,800 m above sea level')}</span>
                  <span className="block text-xs text-stone-500">{t('Entregas: martes y miércoles · 8:00 a.m. – 3:00 p.m.', 'Deliveries: Tuesdays and Wednesdays · 8:00 a.m. – 3:00 p.m.')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {['GLOBALG.A.P.', 'GRASP', 'ICA'].map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2F183C] border border-[#7B4382] text-xs text-[#DFCEE6]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#DDA83A]" />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {t('Políticas & Términos', 'Policies & Terms')}
              </h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/privacidad"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2F183C] border border-[#7B4382] text-xs text-[#DFCEE6] hover:border-[#DDA83A] hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#DDA83A]" />
                  <span>{t('Política de Privacidad', 'Privacy Policy')}</span>
                </a>
                <a
                  href="/terminos"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2F183C] border border-[#7B4382] text-xs text-[#DFCEE6] hover:border-[#DDA83A] hover:text-white transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#DDA83A]" />
                  <span>{t('Términos y Condiciones', 'Terms & Conditions')}</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Fresh Pick - {t('Arándanos de Alta Montaña · Fundada en 2017 · Guasca, Colombia. Todos los derechos reservados.', 'High-Mountain Blueberries · Founded in 2017 · Guasca, Colombia. All rights reserved.')}</p>

          <nav aria-label={t('Legal', 'Legal')} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <a href="/privacidad" className="hover:text-[#DDA83A] transition-colors">{t('Política de Datos', 'Data Policy')}</a>
            <a href="/terminos" className="hover:text-[#DDA83A] transition-colors">{t('Términos y Condiciones', 'Terms & Conditions')}</a>
            <a href="/cookies" className="hover:text-[#DDA83A] transition-colors">Cookies</a>
            <button type="button" onClick={openCookieSettings} className="hover:text-[#DDA83A] transition-colors cursor-pointer">{t('Configurar cookies', 'Cookie settings')}</button>
          </nav>

          <div className="flex items-center gap-2 text-xs">
            <LanguageSwitcher variant="dark" className="mr-2" />
            <span>{t('Medios de pago:', 'Payment methods:')}</span>
            <span className="px-2 py-0.5 bg-[#2F183C] border border-[#7B4382]/50 rounded text-[#DFCEE6] font-medium">{t('Transferencia', 'Bank transfer')}</span>
            <span className="px-2 py-0.5 bg-[#2F183C] border border-[#7B4382]/50 rounded text-[#DDA83A] font-medium">Bre-B @9010401617</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
