import React from 'react';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, FileText, Heart, Instagram, Facebook } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { openCookieSettings } from './CookieBanner';

export const Footer: React.FC = () => {
  const { isStaff } = useAuth();
  return (
    <footer id="contacto" className="bg-[#1E0E27] text-stone-300 pt-16 pb-12 border-t border-[#432356]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#432356]">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              <div className="h-16 sm:h-20 w-28 sm:w-36 rounded-xl bg-white p-2 border-2 border-[#7B4382] shadow-xl flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Fresh Pick - Logo de arándanos de alta montaña y agricultura limpia"
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
                    Arándanos
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#DFCEE6] mt-1 font-medium">
                  Arándanos de Alta Montaña · Guasca, Cundinamarca
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              Inspirados en la agricultura responsable andina. Cosechamos a mano arándanos de alta montaña con polinización natural, calibre superior y respeto por la biodiversidad.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20hacer%20un%20pedido%20de%20ar%C3%A1ndanos"
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
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Nuestros Arándanos
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#variedades" className="hover:text-[#DDA83A] transition-colors">
                  Estuche 125g
                </a>
              </li>
              <li>
                <a href="/#variedades" className="hover:text-[#DDA83A] transition-colors">
                  Estuche 250g
                </a>
              </li>
              <li>
                <a href="/#variedades" className="hover:text-[#DDA83A] transition-colors">
                  Estuche 500g
                </a>
              </li>
              <li>
                <a href="/#planes-mensuales" className="hover:text-[#DDA83A] transition-colors">
                  Planes Mensuales
                </a>
              </li>
              <li>
                <a href="/recetas" className="hover:text-[#DDA83A] transition-colors">
                  Recetas con Arándanos
                </a>
              </li>
              <li>
                <a href="/noticias" className="hover:text-[#DDA83A] transition-colors">
                  Noticias de Arándanos
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Servicios & Pedidos
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#pedidos-personalizados" className="text-[#DDA83A] font-semibold hover:underline">
                  ★ Armar Pedido Personalizado en Línea
                </a>
              </li>
              <li>
                <a href="/#planes-mensuales" className="hover:text-[#DDA83A] transition-colors">
                  Planes Mensuales Familiares
                </a>
              </li>
              <li>
                <a href="/panel" className="hover:text-[#DDA83A] transition-colors">
                  Mi cuenta / Panel usuario
                </a>
              </li>
              {isStaff && (
                <li>
                  <a href="/admin" className="hover:text-[#DDA83A] transition-colors">
                    Panel del equipo
                  </a>
                </li>
              )}
              <li>
                <a href="/#sostenibilidad" className="hover:text-[#DDA83A] transition-colors">
                  Nuestra Biofábrica & Polinización
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-[#DDA83A] transition-colors">
                  Preguntas Frecuentes y Envíos
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Atención & Despachos
            </h4>

            <div className="space-y-2 text-stone-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#DDA83A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Línea & WhatsApp:</span>
                  <span>+57 317 893 1026</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#DDA83A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Correo:</span>
                  <span>info@freshpickfruits.com</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#DDA83A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Ubicación de Cultivos:</span>
                  <span>Vereda Santa Bárbara · Guasca, Cundinamarca</span>
                  <span className="block text-xs text-stone-500">Más de 2.800 m.s.n.m.</span>
                  <span className="block text-xs text-stone-500">Entregas: martes y miércoles · 8:00 a.m. – 3:00 p.m.</span>
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
                Políticas & Términos
              </h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/privacidad"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2F183C] border border-[#7B4382] text-xs text-[#DFCEE6] hover:border-[#DDA83A] hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#DDA83A]" />
                  <span>Política de Privacidad</span>
                </a>
                <a
                  href="/terminos"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2F183C] border border-[#7B4382] text-xs text-[#DFCEE6] hover:border-[#DDA83A] hover:text-white transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#DDA83A]" />
                  <span>Términos y Condiciones</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Fresh Pick - Arándanos de Alta Montaña · Fundada en 2017 · Guasca, Colombia. Todos los derechos reservados.</p>

          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <a href="/privacidad" className="hover:text-[#DDA83A] transition-colors">Política de Datos</a>
            <a href="/terminos" className="hover:text-[#DDA83A] transition-colors">Términos y Condiciones</a>
            <a href="/cookies" className="hover:text-[#DDA83A] transition-colors">Cookies</a>
            <button type="button" onClick={openCookieSettings} className="hover:text-[#DDA83A] transition-colors cursor-pointer">Configurar cookies</button>
          </nav>

          <div className="flex items-center gap-2 text-xs">
            <span>Medios de pago:</span>
            <span className="px-2 py-0.5 bg-[#2F183C] border border-[#7B4382]/50 rounded text-[#DFCEE6] font-medium">Transferencia</span>
            <span className="px-2 py-0.5 bg-[#2F183C] border border-[#7B4382]/50 rounded text-[#DDA83A] font-medium">Bre-B @9010401617</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
