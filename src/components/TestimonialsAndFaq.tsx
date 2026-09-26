import React, { useState } from 'react';
import { TESTIMONIALS_DATA, FAQ_DATA } from '../data/mockData';
import { Star, ChevronDown, ChevronUp, HelpCircle, MessageSquareQuote, CheckCircle } from 'lucide-react';

export const TestimonialsAndFaq: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_DATA[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => prev === id ? null : id);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white/85 backdrop-blur-[2px] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials Section */}
        <div className="mb-14">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider mb-3">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>Experiencias de Nuestros Clientes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F183C] tracking-tight font-display">
              La Calidad Fresh Pick Habla por Sí Sola
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-700">
              Chefs de repostería, profesionales de la salud y familias que priorizan la nutrición limpia eligen nuestros arándanos de alta montaña.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS_DATA.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-[#EADBEE] shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-[#DDA83A] mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#DDA83A] text-[#DDA83A]" />
                    ))}
                  </div>

                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EADBEE] flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.imageAlt || `Cliente de arándanos de alta montaña Fresh Pick: ${t.name}, en ${t.city}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#DFCEE6]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#2F183C]">{t.name}</h4>
                    <p className="text-[11px] text-stone-500">{t.role} · {t.city}</p>
                    <span className="text-[10px] text-[#7B4382] font-semibold flex items-center gap-0.5 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-[#7B4382]" />
                      <span>{t.verifiedOrder}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>Resuelve tus Dudas</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2F183C] font-display">
              Preguntas Frecuentes
            </h3>
            <p className="text-stone-700 text-xs sm:text-sm mt-1">
              Todo lo que necesitas saber sobre nuestros pedidos, entregas (martes y miércoles) y garantía de frescura.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_DATA.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[#EADBEE] overflow-hidden transition-all bg-white shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#F5ECF9] transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#2F183C]">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#7B4382] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 text-xs sm:text-sm text-stone-700 leading-relaxed border-t border-[#EADBEE] bg-[#FAF7F0] animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
