import React from 'react';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, Heart, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white p-1 border border-stone-800 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Fresh Pick - Logo de arándanos de alta montaña y agricultura limpia"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-white font-display">
                    Fresh Pick
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-200 border border-blue-800/60">
                    Arándanos
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Arándanos de Alta Montaña
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
                className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-emerald-400 hover:bg-emerald-700 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`mailto:info@freshpickfruits.com`}
                className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:bg-emerald-700 hover:text-white transition-colors"
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
                <a href="#variedades" className="hover:text-emerald-400 transition-colors">
                  Estuche 125g
                </a>
              </li>
              <li>
                <a href="#variedades" className="hover:text-emerald-400 transition-colors">
                  Estuche 250g
                </a>
              </li>
              <li>
                <a href="#variedades" className="hover:text-emerald-400 transition-colors">
                  Estuche 500g
                </a>
              </li>
              <li>
                <a href="#planes-mensuales" className="hover:text-emerald-400 transition-colors">
                  Planes Mensuales
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
                <a href="#pedidos-personalizados" className="text-emerald-400 font-semibold hover:underline">
                  ★ Armar Pedido Personalizado en Línea
                </a>
              </li>
              <li>
                <a href="#planes-mensuales" className="hover:text-emerald-400 transition-colors">
                  Planes Mensuales Familiares
                </a>
              </li>
              <li>
                <a href="/panel" className="hover:text-emerald-400 transition-colors">
                  Mi cuenta / Panel usuario
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-emerald-400 transition-colors">
                  Panel administración
                </a>
              </li>
              <li>
                <a href="#sostenibilidad" className="hover:text-emerald-400 transition-colors">
                  Nuestra Biofábrica & Polinización
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
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
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Línea & WhatsApp:</span>
                  <span>+57 317 893 1026</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Correo:</span>
                  <span>info@freshpickfruits.com</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Ubicación de Cultivos:</span>
                  <span>Vereda Santa Bárbara · Guasca, Cundinamarca</span>
                  <span className="block text-[11px] text-stone-500">Más de 2.800 m.s.n.m.</span>
                  <span className="block text-[11px] text-stone-500">Entregas: martes y miércoles · 8:00 a.m. – 3:00 p.m.</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-[11px] text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GLOBALG.A.P. · GRASP · ICA</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Fresh Pick - Arándanos de Alta Montaña · Fundada en 2017 · Guasca, Colombia. Todos los derechos reservados.</p>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Medios de pago:</span>
            <span className="px-2 py-0.5 bg-stone-900 rounded text-stone-300 font-medium">Transferencia</span>
            <span className="px-2 py-0.5 bg-stone-900 rounded text-stone-300 font-medium">Bre-B @9010401617</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
