import React from 'react';
import { certifications } from '../data/mockData';
import { Recycle, Mountain, Sun, Users, Award } from 'lucide-react';

export const SustainabilitySection: React.FC = () => {
  return (
    <section id="sostenibilidad" className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-stone-100 border-4 border-stone-50">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
                alt="Finca de arándanos y frutas de alta montaña en Colombia"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
                  Nuestra Finca Andina
                </span>
                <h3 className="text-xl font-bold font-display">
                  Cordillera Oriental · Sabana de Cundinamarca
                </h3>
                <p className="text-xs text-stone-300">
                  Más de 2.450 m.s.n.m. de tierra volcánica fértil y aguas puras de páramo
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-blue-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl max-w-xs border border-blue-700/60 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-blue-300">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Biofábrica Circular</div>
                  <div className="text-[11px] text-blue-200">100% compostaje de podas</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <Mountain className="w-3.5 h-3.5" />
              <span>Nuestra Historia & Compromiso</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
              Amor por la tierra, rigor agronómico y respeto por cada fruto
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              <strong className="text-stone-900">Fresh Pick Frutas</strong> nació de una profunda vocación familiar por la agricultura regenerativa en Colombia. Nos propusimos demostrar que es posible cultivar los arándanos y frutos rojos más dulces y crocantes sin agredir el ecosistema.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase mb-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>El Efecto Altura</span>
                </div>
                <p className="text-xs text-stone-600">
                  La radiación solar de montaña y las noches frías concentran azúcares naturales y producen bayas de mayor calibre y consistencia.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Cosecha 100% Manual</span>
                </div>
                <p className="text-xs text-stone-600">
                  Mujeres y familias campesinas de la región seleccionan fruto por fruto, asegurando trato digno e impacto social positivo.
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-500 italic">
              "No alteramos los tiempos de la naturaleza; respetamos el ciclo de cada floración para que en tu mesa disfrutes fruta viva y pura."
            </p>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="pt-12 border-t border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold font-display text-stone-900">
              Certificaciones & Prácticas Verificadas
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Estándares nacionales e internacionales que respaldan nuestra calidad e inocuidad alimentaria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map(cert => (
              <div
                key={cert.id}
                className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200/90 hover:border-blue-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">{cert.title}</h4>
                  <div className="text-[11px] font-semibold text-blue-700 mt-0.5">{cert.code}</div>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {cert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
