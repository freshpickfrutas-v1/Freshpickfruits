import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Award } from 'lucide-react';
import { BlueberryIcon } from './BlueberryIcon';

interface HeroProps {
  onGoToCustomOrder: () => void;
  onExploreFruits: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGoToCustomOrder, onExploreFruits }) => {
  return (
    <section className="relative overflow-hidden fp-gradient-hero pt-8 pb-10 lg:pt-12 lg:pb-14 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/*
          Desktop: row 1 = text | photo, row 2 = buttons | product box (same row, so they share
          the same height), row 3 = trust seals across the full width.
          Mobile keeps the reading order: text, buttons, photo, product box, seals.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-6">

          {/* Text Content */}
          <div className="order-1 lg:order-none lg:col-span-7 lg:row-start-1 self-center space-y-6 text-left">
            {/* Top pill badge */}
            <div className="fp-pill text-xs sm:text-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#7B4382] animate-pulse" />
              <span>Cultivo Responsable de Alta Montaña · Guasca, Colombia</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-[#2F183C] tracking-tight leading-[1.12] font-display">
              Arándanos frescos con{' '}
              <span className="text-[#7B4382]">
                sabor intenso
              </span>{' '}
              que solo la alta montaña puede lograr.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-700 max-w-2xl leading-relaxed">
              En <strong className="text-[#2F183C] font-bold">Fresh Pick</strong> cultivamos
              arándanos premium de alta montaña a más de 2.800 m.s.n.m. Un producto puro por naturaleza:
              polinización 100% natural, libre de ceras artificiales, sin residuos químicos y
              recolectado a mano en su punto exacto de madurez.
            </p>
          </div>

          {/* Visual Showcase */}
          <div className="order-3 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1 self-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#2F183C]/20 border-4 border-white aspect-[4/3] sm:aspect-[5/4] relative mx-auto max-w-md lg:max-w-none">
              <img
                src="/assets/finca/finca-arandanos-mano-1.jpg"
                alt="Arándanos frescos de Fresh Pick recién cosechados a mano en cultivo andino de alta montaña a más de 2.800 msnm con agricultura responsable y limpia"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E0E27]/80 via-transparent to-transparent pointer-events-none" />

              {/* Caption on image */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#2F183C]/90 text-[#DDA83A] text-[11px] font-bold uppercase tracking-wider mb-1 border border-[#DDA83A]/30">
                  Cosecha Manual
                </span>
                <p className="text-sm font-semibold">Arándanos Premium de Alta Montaña</p>
                <p className="text-xs text-stone-200">Vereda Santa Bárbara · Guasca, Cundinamarca · 2.800 m.s.n.m.</p>
              </div>
            </div>
          </div>

          {/* CTAs: stretch to the height of the product box next to them */}
          <div className="order-2 lg:order-none lg:col-span-7 lg:row-start-2 flex flex-col sm:flex-row items-stretch gap-3">
            <button
              id="hero-custom-order-btn"
              onClick={onGoToCustomOrder}
              className="group flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 fp-btn-primary text-base active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#DDA83A] group-hover:rotate-12 transition-transform shrink-0" />
              <span>Haz tu Pedido de Arándanos en Línea</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              id="hero-explore-catalog-btn"
              onClick={onExploreFruits}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 fp-btn-secondary text-base active:scale-[0.98] cursor-pointer"
            >
              <span>Explora tus opciones en la cosecha de arándanos</span>
            </button>
          </div>

          {/* Product & Delivery Box */}
          <div className="order-4 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-2 w-full max-w-md mx-auto lg:max-w-none bg-white rounded-xl shadow-md border border-[#EADBEE] p-3.5 sm:p-4 flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-stretch xl:items-center justify-center gap-3.5 sm:gap-4 lg:gap-3.5 xl:gap-4">
            <div className="flex items-center gap-3.5 sm:flex-1">
              <div className="w-11 h-11 rounded-lg bg-[#F5ECF9] border border-[#DFCEE6] flex items-center justify-center shrink-0">
                <BlueberryIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2F183C]">Estuche de Arándanos 125g</div>
                <div className="text-[11px] text-stone-500">Pruina natural protectora intacta</div>
                <div className="text-xs font-bold text-[#7B4382] mt-0.5">
                  $8.000 COP <span className="font-normal text-stone-500 text-[10px]">/ 125g</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3.5 border-t sm:pt-0 sm:pl-4 sm:border-t-0 sm:border-l lg:pt-3.5 lg:pl-0 lg:border-t lg:border-l-0 xl:pt-0 xl:pl-4 xl:border-t-0 xl:border-l border-[#EADBEE] sm:flex-1">
              <span className="relative flex w-2.5 h-2.5 shrink-0">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#DDA83A] opacity-75 animate-ping" />
                <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-[#C59328]" />
              </span>
              <div className="text-xs">
                <p className="font-bold text-[#2F183C]">Entregas Martes y Miércoles</p>
                <p className="text-stone-500 text-[11px]">Horario 8:00 a.m. – 3:00 p.m.</p>
              </div>
            </div>
          </div>

          {/* Trust Seals: full width below both columns */}
          <div className="order-5 lg:order-none lg:col-span-12 lg:row-start-3 pt-6 mt-2 border-t border-[#EADBEE] grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8">
            <div className="flex items-center gap-2.5 lg:justify-center">
              <div className="w-9 h-9 rounded-xl bg-[#F5ECF9] flex items-center justify-center text-[#2F183C] shrink-0 border border-[#DFCEE6]">
                <ShieldCheck className="w-4 h-4 text-[#7B4382]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2F183C]">GLOBALG.A.P.</div>
                <div className="text-[11px] text-stone-600">Inocuidad alimentaria</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 lg:justify-center">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2DF] flex items-center justify-center text-[#785412] shrink-0 border border-[#EED7A1]">
                <Award className="w-4 h-4 text-[#C59328]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2F183C]">GRASP</div>
                <div className="text-[11px] text-stone-600">Bienestar social</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 lg:justify-center">
              <div className="w-9 h-9 rounded-xl bg-[#F5ECF9] flex items-center justify-center text-[#7B4382] shrink-0 border border-[#DFCEE6]">
                <Sparkles className="w-4 h-4 text-[#7B4382]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2F183C]">13° – 15° Brix</div>
                <div className="text-[11px] text-stone-600">Dulzor natural andino</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 lg:justify-center">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2DF] flex items-center justify-center text-[#2F183C] shrink-0 border border-[#EED7A1]">
                <HeartHandshake className="w-4 h-4 text-[#7B4382]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2F183C]">7 Colmenas</div>
                <div className="text-[11px] text-stone-600">Polinización natural</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
