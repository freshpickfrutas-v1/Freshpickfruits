import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Award, Truck } from 'lucide-react';

interface HeroProps {
  onGoToCustomOrder: () => void;
  onExploreFruits: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGoToCustomOrder, onExploreFruits }) => {
  return (
    <section className="relative overflow-hidden fp-gradient-hero pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-200/60">
      {/* Decorative backdrop elements - warmer organic tones */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-green-100/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top pill badge */}
            <div className="fp-pill text-xs sm:text-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Cultivo Responsable de Alta Montaña · Guasca, Colombia</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-stone-900 tracking-tight leading-[1.12] font-display">
              Arándanos frescos con{' '}
              <span className="text-[#1B4D3E] underline decoration-emerald-300/80 decoration-wavy decoration-2 underline-offset-4">
                sabor intenso
              </span>{' '}
              que solo la alta montaña puede lograr.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
              En <strong className="text-stone-900 font-semibold">Fresh Pick</strong> cultivamos
              arándanos premium de alta montaña a más de 2.800 m.s.n.m. Un producto puro por naturaleza:
              polinización 100% natural, libre de ceras artificiales, sin residuos químicos y
              recolectado a mano en su punto exacto de madurez.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-custom-order-btn"
                onClick={onGoToCustomOrder}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 fp-btn-primary text-base active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
                <span>Haz tu Pedido de Arándanos en Línea</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-explore-catalog-btn"
                onClick={onExploreFruits}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 fp-btn-secondary text-base active:scale-[0.98] cursor-pointer"
              >
                <span>Explora tus opciones en la cosecha de arándanos</span>
              </button>
            </div>

            {/* Trust Seals */}
            <div className="pt-6 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">GLOBALG.A.P.</div>
                  <div className="text-[11px] text-stone-500">Inocuidad alimentaria</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">GRASP</div>
                  <div className="text-[11px] text-stone-500">Bienestar social</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lime-100 flex items-center justify-center text-lime-800 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">13° – 15° Brix</div>
                  <div className="text-[11px] text-stone-500">Dulzor natural andino</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">7 Colmenas</div>
                  <div className="text-[11px] text-stone-500">Abeja Melífera · Polinización natural</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">

              {/* Primary Image Container */}
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-emerald-950/15 border-4 border-white aspect-[4/3] sm:aspect-[5/4] relative">
                <img
                  src="/assets/blueberries.jpg"
                  alt="Arándanos frescos de Fresh Pick recién cosechados a mano en cultivo andino de alta montaña a más de 2.800 msnm con agricultura responsable y limpia"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Caption on image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-700/90 text-[11px] font-bold uppercase tracking-wider mb-1">
                    Cosecha Manual
                  </span>
                  <p className="text-sm font-semibold">Arándanos Premium de Alta Montaña</p>
                  <p className="text-xs text-stone-200">Vereda Santa Bárbara · Guasca, Cundinamarca · 2.800 m.s.n.m.</p>
                </div>
              </div>

              {/* Floating Feature Box 1 */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white p-3.5 sm:p-4 rounded-xl shadow-xl border border-stone-100/80 flex items-center gap-3.5 max-w-xs">
                <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl">
                  🫐
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Estuche de Arándanos 125g</div>
                  <div className="text-[11px] text-stone-500">Pruina natural protectora intacta</div>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">
                    $8.000 COP <span className="font-normal text-stone-500 text-[10px]">/ 125g</span>
                  </div>
                </div>
              </div>

              {/* Floating Feature Box 2 */}
              <div className="hidden sm:flex absolute -top-5 -right-4 bg-[#1B4D3E] text-white p-3.5 rounded-xl shadow-xl border border-emerald-700/40 items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div className="text-xs">
                  <p className="font-bold">Entregas Martes y Miércoles</p>
                  <p className="text-emerald-200 text-[11px]">Horario 8:00 a.m. – 3:00 p.m.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
