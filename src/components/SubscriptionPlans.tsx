import React from 'react';
import { SubscriptionPlan } from '../types';
import { Check, Sparkles, CalendarCheck, ShieldCheck, HeartHandshake } from 'lucide-react';

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  plans,
  onSelectPlan
}) => {
  return (
    <section id="planes-mensuales" className="py-12 sm:py-16 bg-[#F7F5F0]/80 backdrop-blur-[2px] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider mb-3">
            <CalendarCheck className="w-3.5 h-3.5 text-[#7B4382]" />
            <span>Suscripciones & Entregas Programadas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F183C] tracking-tight font-display">
            Planes Mensuales de Arándanos Frescos a tu Puerta
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-700">
            Cuatro planes de 2.000g al mes con entregas semanales o quincenales. Entregas los martes y miércoles de 8:00 a.m. a 3:00 p.m. Sin contratos de permanencia.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between ${
                  plan.isPopular
                    ? 'bg-[#2F183C] text-white shadow-2xl shadow-[#2F183C]/30 ring-2 ring-[#DDA83A] z-10'
                    : 'bg-white text-stone-900 border border-[#EADBEE] shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Popular Ribbon */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#DDA83A] text-[#2F183C] text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 border border-white/40">
                    <Sparkles className="w-3 h-3 text-[#2F183C]" />
                    <span>El Más Popular</span>
                  </div>
                )}

                <div>
                  {/* Title & subtitle */}
                  <div className="mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider ${plan.isPopular ? 'text-[#DDA83A]' : 'text-[#7B4382]'}`}>
                      {plan.idealFor}
                    </span>
                    <h3 className="text-xl font-bold font-display mt-1">{plan.title}</h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-600'}`}>
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Weight tag */}
                  <div className={`py-2 px-3 rounded-xl text-xs font-semibold mb-5 ${
                    plan.isPopular ? 'bg-[#432356] text-[#DDA83A] border border-[#7B4382]' : 'bg-[#FAF7F0] text-[#2F183C] border border-[#EADBEE]'
                  }`}>
                    📦 {plan.weight}
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black font-display">
                        ${plan.priceMonth.toLocaleString('es-CO')}
                      </span>
                      <span className={`text-xs font-medium ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-500'}`}>
                        COP / mes
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 font-medium ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-[#7B4382]'}`}>
                      {plan.deliveryFrequency}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-4 border-t border-stone-200/40 text-xs">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.isPopular ? 'bg-[#7B4382] text-[#DDA83A]' : 'bg-[#F5ECF9] text-[#7B4382]'
                        }`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={plan.isPopular ? 'text-stone-100' : 'text-stone-700'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div className="pt-6">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      plan.isPopular
                        ? 'bg-[#DDA83A] text-[#2F183C] hover:bg-[#c9952e] font-black shadow-md active:scale-98'
                        : 'bg-[#2F183C] text-white hover:bg-[#432356] active:scale-98 shadow-xs'
                    }`}
                  >
                    Suscribirme al {plan.title}
                  </button>
                  <p className={`text-[10px] text-center mt-2 ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-500'}`}>
                    Sin contratos de permanencia · Cancela cuando quieras
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Corporate & Wholesale Strip */}
        <div className="mt-12 bg-white rounded-2xl border border-[#EADBEE] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5ECF9] text-[#7B4382] border border-[#DFCEE6] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#2F183C] font-display">
                ¿Eres restaurante, repostería, cafetería o distribuidor?
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Escríbenos por WhatsApp y te enviamos lista de precios institucionales para negocios. Pedido mínimo 500g.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20tengo%20un%20negocio/restaurante%20y%20me%20gustar%C3%ADa%20conocer%20la%20lista%20de%20precios%20institucionales%20de%20ar%C3%A1ndanos%20al%20por%20mayor."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-3 rounded-xl bg-[#2F183C] text-white text-xs sm:text-sm font-bold hover:bg-[#432356] transition-colors"
          >
            Cotizar por Mayor
          </a>
        </div>

      </div>
    </section>
  );
};
