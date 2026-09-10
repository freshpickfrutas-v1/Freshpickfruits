import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Award, HeartHandshake, Clock } from 'lucide-react';

interface HeroProps {
  onGoToCustomOrder: () => void;
  onExploreFruits: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGoToCustomOrder, onExploreFruits }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-blue-50/40 to-[#f8fafc] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-blue-950/5">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-200/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-sky-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-300 text-blue-900 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Cultivo Responsable de Alta Montaña · Colombia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12] font-display">
              Frutas frescas con la{' '}
              <span className="text-blue-700 underline decoration-blue-300 decoration-wavy decoration-2">
                intensidad y el carácter
              </span>{' '}
              que nacen en la alta montaña.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
              En <strong className="text-stone-900 font-semibold">Fresh Pick Frutas</strong> cultivamos arándanos, moras, frambuesas y frutos rojos a más de 2.450 m.s.n.m. con polinización 100% natural, cero ceras artificiales y cosecha manual selectiva.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-custom-order-btn"
                onClick={onGoToCustomOrder}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-700 text-white font-bold text-base hover:bg-blue-800 active:scale-[0.98] transition-all shadow-md shadow-blue-800/20 hover:shadow-lg hover:shadow-blue-800/30 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-blue-200 group-hover:rotate-12 transition-transform" />
                <span>Haz tu Pedido Personalizado en Línea</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-explore-catalog-btn"
                onClick={onExploreFruits}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-base hover:bg-stone-50 hover:text-blue-800 hover:border-blue-300 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                <span>Explorar Frutas y Variedades</span>
              </button>
            </div>

            {/* Value Props Bar */}
            <div className="pt-6 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">BPA & Global GAP</div>
                  <div className="text-[11px] text-stone-500">Inocuidad certificada</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">14° - 16° Brix</div>
                  <div className="text-[11px] text-stone-500">Dulzor natural andino</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-800 shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Abejas Nativas</div>
                  <div className="text-[11px] text-stone-500">Polinización viva</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Entrega en 24h</div>
                  <div className="text-[11px] text-stone-500">Frescura de cosecha</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-950/20 border-4 border-white aspect-[4/3] sm:aspect-[5/4] relative">
                <img
                  src="https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=1200&q=85"
                  alt="Arándanos frescos de Fresh Pick Frutas recién cosechados"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600/90 text-[11px] font-bold uppercase tracking-wider mb-1">
                    Cosecha Manual
                  </span>
                  <p className="text-sm font-semibold">Arándanos Biloxi Seleccionados</p>
                  <p className="text-xs text-stone-200">
                    Sabana de Bogotá y Cordillera Oriental · 2.450 m.s.n.m.
                  </p>
                </div>
              </div>

              {/* Floating Quality Callout */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white p-3.5 sm:p-4 rounded-xl shadow-xl border border-stone-100 flex items-center gap-3.5 max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">
                  🫐
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Arándano Calibre Jumbo</div>
                  <div className="text-[11px] text-stone-500">Pruina natural protectora intacta</div>
                  <div className="text-xs font-bold text-blue-700 mt-0.5">
                    $7.000 COP <span className="font-normal text-stone-500 text-[10px]">/ 250g</span>
                  </div>
                </div>
              </div>

              {/* Floating Orders Alert */}
              <div className="hidden sm:flex absolute -top-5 -right-4 bg-blue-950 text-white p-3.5 rounded-xl shadow-xl border border-blue-700/50 items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <div className="text-xs">
                  <p className="font-bold">Pedidos Abiertos Hoy</p>
                  <p className="text-blue-200 text-[11px]">Envíos programados a domicilio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
