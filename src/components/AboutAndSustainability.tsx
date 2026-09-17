import React from 'react';
import { CERTIFICATIONS_LIST } from '../data/mockData';
import { Leaf, Award, Recycle, Sun, Mountain, Users, HeartHandshake } from 'lucide-react';

export const AboutAndSustainability: React.FC = () => {
  return (
    <section id="sostenibilidad" className="py-16 sm:py-24 bg-white/85 backdrop-blur-[2px] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Origin & Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">

          {/* Left Visual Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-stone-100 border-4 border-white">
              <img
                src="/assets/finca/finca-arandanos-invernadero-3.jpg"
                alt="Cultivo de arándanos Fresh Pick a más de 2.800 msnm en la Vereda Santa Bárbara, Guasca, Cundinamarca, con agricultura responsable y polinización natural"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E0E27]/80 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-xs uppercase font-bold tracking-wider text-[#DDA83A]">
                  Nuestra Finca Andina
                </span>
                <h3 className="text-xl font-bold font-display">
                  Vereda Santa Bárbara · Guasca, Cundinamarca
                </h3>
                <p className="text-xs text-stone-200">
                  A más de 2.800 m.s.n.m., con agua de manantial y tierra negra de 2 m de profundidad
                </p>
              </div>
            </div>

            {/* Small Overlay Card */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-[#2F183C] text-white p-4 sm:p-5 rounded-2xl shadow-xl max-w-xs border border-[#7B4382]/60 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#432356] flex items-center justify-center text-[#DDA83A]">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Agua 100% de Manantial</div>
                  <div className="text-[11px] text-[#DFCEE6]">Y agua lluvia para todo el cultivo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider">
              <Mountain className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>Nuestra Finca & Compromiso</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F183C] tracking-tight font-display">
              Cuidamos tu alimento, a quien lo cultiva y nuestro planeta
            </h2>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              <strong className="text-[#2F183C] font-bold">Fresh Pick</strong> cultiva arándanos premium de alta montaña en la Vereda Santa Bárbara (Guasca, Cundinamarca), a más de 2.800 metros sobre el nivel del mar. Trabajamos con polinización 100% natural y procesos estrictos para entregar un producto libre de ceras artificiales, sin residuo alguno de productos químicos y con la pruina natural intacta.
            </p>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              Cada arándano que llega a tu mesa es el resultado de una dedicación artesanal y una rigurosa cosecha manual selectiva, realizada justo en su punto óptimo de madurez para preservar sus propiedades antioxidantes y su sabor genuino.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#EADBEE]">
                <div className="flex items-center gap-2 text-[#7B4382] font-bold text-xs uppercase mb-1">
                  <Sun className="w-4 h-4 text-[#DDA83A]" />
                  <span>El Efecto Altura</span>
                </div>
                <p className="text-xs text-stone-600">
                  La radiación solar de montaña y las noches frías concentran azúcares naturales y producen bayas más firmes y crocantes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#EADBEE]">
                <div className="flex items-center gap-2 text-[#7B4382] font-bold text-xs uppercase mb-1">
                  <Users className="w-4 h-4 text-[#7B4382]" />
                  <span>Cosecha Manual & GRASP</span>
                </div>
                <p className="text-xs text-stone-600">
                  Cosechamos a mano únicamente los frutos en su punto óptimo de madurez. Orgánicos y biológicos para protección, fertilizantes balanceados para el sabor más intenso.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#7B4382] italic font-semibold">
              "Cuidamos tu alimento, cuidamos a quien lo cultiva y cuidamos nuestro planeta."
            </p>

          </div>

        </div>

        {/* Farm Gallery Strip */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold font-display text-[#2F183C]">
              Directo desde nuestros invernaderos
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Así se ve la cosecha real en la Vereda Santa Bárbara, día a día.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/5] border-4 border-white">
              <img
                src="/assets/finca/finca-arandanos-mano-2.jpg"
                alt="Arándanos maduros recién cosechados a mano en la finca Fresh Pick"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/5] border-4 border-white">
              <img
                src="/assets/finca/finca-arandanos-invernadero-1.jpg"
                alt="Racimos de arándanos madurando bajo invernadero en Fresh Pick"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/5] border-4 border-white">
              <img
                src="/assets/finca/finca-arandanos-invernadero-2.jpg"
                alt="Cultivo de arándanos en distintas etapas de maduración en los invernaderos de Fresh Pick"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Certifications and Pillars Bar */}
        <div className="pt-12 border-t border-[#EADBEE]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold font-display text-[#2F183C]">
              Certificaciones & Prácticas Verificadas
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Estándares nacionales e internacionales que respaldan nuestra calidad e inocuidad alimentaria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CERTIFICATIONS_LIST.map((cert) => (
              <div
                key={cert.id}
                className="bg-white p-5 rounded-2xl border border-[#EADBEE] hover:border-[#DFCEE6] transition-colors flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#F5ECF9] text-[#7B4382] border border-[#DFCEE6] flex items-center justify-center mb-3">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2F183C]">{cert.title}</h4>
                  <div className="text-[11px] font-semibold text-[#7B4382] mt-0.5">{cert.code}</div>
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
