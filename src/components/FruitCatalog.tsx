import React, { useState } from 'react';
import { FruitItem } from '../types';
import { Plus, Check, Info, Sparkles, X, Shield, SunMedium, Compass, Heart } from 'lucide-react';

interface FruitCatalogProps {
  fruits: FruitItem[];
  onAddToCart: (fruit: FruitItem, quantity?: number) => void;
  onCustomizeWithFruit: (fruitId: string) => void;
}

export const FruitCatalog: React.FC<FruitCatalogProps> = ({
  fruits,
  onAddToCart,
  onCustomizeWithFruit
}) => {
  const [activeModalFruit, setActiveModalFruit] = useState<FruitItem | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAdd = (fruit: FruitItem) => {
    onAddToCart(fruit, 1);
    setAddedIds(prev => ({ ...prev, [fruit.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [fruit.id]: false }));
    }, 1500);
  };

  return (
    <section id="variedades" className="py-16 sm:py-20 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Nuestra Cosecha de Arándanos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            Arándanos Premium de Alta Montaña
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600">
            Vaccinium corymbosum cultivado a más de 2.800 m.s.n.m. en Guasca, Cundinamarca. Polinización 100% natural con 7 colmenas de Abeja Melífera, cosecha manual selectiva, libre de ceras artificiales y sin residuos químicos.
          </p>
        </div>

        {/* Fruits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fruits.map((fruit) => {
            const isAdded = addedIds[fruit.id];

            return (
              <div
                key={fruit.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
              >
                {/* Fruit Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={fruit.imageUrl}
                    alt={fruit.imageAlt || `${fruit.name} (${fruit.presentation}) - Arándanos frescos de alta montaña cultivados con agricultura responsable y limpia`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {fruit.popular && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Más pedido</span>
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium">
                      {fruit.brix}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-bold tracking-tight">
                      {fruit.altitude}
                    </span>
                  </div>

                  {/* Title on Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">
                      {fruit.variety}
                    </p>
                    <h3 className="text-xl font-bold font-display leading-tight drop-shadow-xs">
                      {fruit.name}
                    </h3>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-stone-500 italic mb-2">
                      {fruit.scientificName}
                    </p>
                    <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {fruit.description}
                    </p>

                    {/* Benefit tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {fruit.benefits.slice(0, 2).map((benefit, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100/80 font-medium"
                        >
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action Bar */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 block font-medium">
                        Presentación: {fruit.presentation}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-stone-900 font-display">
                          ${fruit.standardPrice.toLocaleString('es-CO')}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">COP</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Info Button */}
                      <button
                        onClick={() => setActiveModalFruit(fruit)}
                        className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Ver ficha agronómica completa"
                        aria-label={`Ver detalles de ${fruit.name}`}
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {/* Add to Order Button */}
                      <button
                        onClick={() => handleAdd(fruit)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1B4D3E] text-white hover:bg-[#143D32] active:scale-95 shadow-xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Agregado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Custom Builder link */}
                  <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-medium">¿Necesitas otra cantidad?</span>
                    <button
                      onClick={() => onCustomizeWithFruit(fruit.id)}
                      className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Personalizar</span>
                      <Sparkles className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Details & Agronomic Sheet Modal */}
      {activeModalFruit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="relative aspect-[16/8] bg-stone-900">
              <img
                src={activeModalFruit.imageUrl}
                alt={activeModalFruit.imageAlt || `Ficha agronómica de ${activeModalFruit.name} (${activeModalFruit.presentation}) - Arándanos de alta montaña y agricultura responsable`}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />

              <button
                onClick={() => setActiveModalFruit(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                  Ficha Técnica Agronómica
                </span>
                <h3 className="text-2xl font-black font-display">{activeModalFruit.name}</h3>
                <p className="text-xs text-stone-300 italic">{activeModalFruit.scientificName} · {activeModalFruit.variety}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-stone-700 text-sm">
              <p className="leading-relaxed">
                {activeModalFruit.description}
              </p>

              {/* Agronomic Indicators */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                    <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                    <span>Dulzor</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">{activeModalFruit.brix}</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Altitud</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">{activeModalFruit.altitude}</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vida Útil</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">{activeModalFruit.shelfLife}</div>
                </div>
              </div>

              {/* Benefits list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Beneficios & Compromisos</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeModalFruit.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-md border border-emerald-100">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Freshness Guarantee */}
              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">🫐 Garantía de Frescura Fresh Pick:</span>
                <p>
                  Garantizamos arándanos frescos o te los reemplazamos. No laves la fruta antes de guardarla. Mantenla refrigerada entre 2°C y 4°C en su empaque original para conservar su pruina protectora natural.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-stone-500 block">Precio regular</span>
                <span className="text-xl font-black text-stone-900 font-display">
                  ${activeModalFruit.standardPrice.toLocaleString('es-CO')} COP
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = activeModalFruit.id;
                    setActiveModalFruit(null);
                    onCustomizeWithFruit(id);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors"
                >
                  Personalizar Gramos
                </button>
                <button
                  onClick={() => {
                    handleAdd(activeModalFruit);
                    setActiveModalFruit(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143D32] transition-colors shadow-xs"
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
