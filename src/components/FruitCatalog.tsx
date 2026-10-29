import React, { useState } from 'react';
import { FruitItem } from '../types';
import { Plus, Minus, Check, Info, Sparkles, X, Shield, SunMedium, Compass, Heart } from 'lucide-react';

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

  // Cantidad elegida en cada tarjeta (estuches). Los de 125g y 250g van de 2 en 2, igual que en "Armar pedido".
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const stepOf = (fruit: FruitItem) => (fruit.defaultGramUnit === 125 || fruit.defaultGramUnit === 250 ? 2 : 1);
  const qtyOf = (fruit: FruitItem) => quantities[fruit.id] ?? stepOf(fruit);
  const changeQty = (fruit: FruitItem, direction: 1 | -1) => {
    const step = stepOf(fruit);
    setQuantities(prev => ({ ...prev, [fruit.id]: Math.max(step, (prev[fruit.id] ?? step) + direction * step) }));
  };

  const handleAdd = (fruit: FruitItem) => {
    onAddToCart(fruit, qtyOf(fruit));
    setQuantities(prev => ({ ...prev, [fruit.id]: stepOf(fruit) }));
    setAddedIds(prev => ({ ...prev, [fruit.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [fruit.id]: false }));
    }, 1500);
  };

  return (
    <section id="variedades" className="py-12 sm:py-16 bg-white/85 backdrop-blur-[2px] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider mb-3">
            <span>Nuestra Cosecha de Arándanos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F183C] tracking-tight font-display">
            Arándanos Premium de Alta Montaña
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-700">
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
                className="bg-white rounded-2xl border border-[#EADBEE] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
              >
                {/* Package photo: the label must stay fully visible, so nothing is laid over it. */}
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={fruit.imageUrl}
                    alt={fruit.imageAlt || `${fruit.name} (${fruit.presentation}) - Arándanos frescos de alta montaña cultivados con agricultura responsable y limpia`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1 flex-wrap mb-3">
                      {fruit.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-[#7B4382] text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                          <Sparkles className="w-3 h-3 text-[#DDA83A]" />
                          <span>Más pedido</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-[#2F183C] text-[#DDA83A] text-xs font-bold whitespace-nowrap">
                        {fruit.brix}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold whitespace-nowrap">
                        {fruit.altitude}
                      </span>
                    </div>
                    <p className="text-xs uppercase tracking-wider text-[#C59328] font-bold">
                      {fruit.variety}
                    </p>
                    <h3 className="text-xl font-bold font-display leading-tight text-[#2F183C] mb-1">
                      {fruit.name}
                    </h3>
                    <p className="text-xs text-[#7B4382] italic mb-2 font-medium">
                      {fruit.scientificName}
                    </p>
                    <p className="text-stone-700 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {fruit.description}
                    </p>

                    {/* Benefit tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {fruit.benefits.slice(0, 2).map((benefit, i) => (
                        <span
                          key={i}
                          className="text-xs bg-[#F5ECF9] text-[#2F183C] px-2 py-0.5 rounded-md border border-[#DFCEE6] font-semibold"
                        >
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action Bar */}
                  <div className="pt-4 border-t border-[#EADBEE] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs text-stone-500 block font-medium">
                          Presentación: {fruit.presentation}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-[#2F183C] font-display">
                            ${fruit.standardPrice.toLocaleString('es-CO')}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">COP c/u</span>
                        </div>
                        {stepOf(fruit) === 2 ? (
                          <span className="text-xs text-[#785412] font-semibold block">
                            ⚠️ Se piden de 2 en 2 estuches
                          </span>
                        ) : (
                          <span className="text-xs text-[#7B4382] font-semibold block">
                            ✨ Mínimo con 1 ud.
                          </span>
                        )}
                      </div>

                      {/* Info Button */}
                      <button
                        onClick={() => setActiveModalFruit(fruit)}
                        className="p-2 rounded-lg text-[#2F183C] hover:text-[#7B4382] hover:bg-[#F5ECF9] transition-colors cursor-pointer"
                        title="Ver ficha agronómica completa"
                        aria-label={`Ver detalles de ${fruit.name}`}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {/* Quantity selector (same as "Armar pedido") */}
                      <div className="flex items-center justify-between gap-1.5 bg-white border border-[#EADBEE] rounded-lg p-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => changeQty(fruit, -1)}
                          disabled={qtyOf(fruit) <= stepOf(fruit) || fruit.inStock === false}
                          className="w-8 h-8 rounded-md border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label={`Quitar estuches de ${fruit.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-[4.5rem] px-1 text-center">
                          <span className="text-sm font-black text-[#2F183C] block leading-tight">
                            {qtyOf(fruit)} {qtyOf(fruit) === 1 ? 'estuche' : 'estuches'}
                          </span>
                          <span className="text-xs text-[#7B4382] font-semibold block leading-tight">
                            {qtyOf(fruit) * (fruit.defaultGramUnit || 0)}g · ${(qtyOf(fruit) * fruit.standardPrice).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => changeQty(fruit, 1)}
                          disabled={fruit.inStock === false}
                          className="w-8 h-8 rounded-md bg-[#2F183C] text-white flex items-center justify-center hover:bg-[#432356] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label={`Agregar más estuches de ${fruit.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add to Order Button */}
                      <button
                        onClick={() => handleAdd(fruit)}
                        disabled={fruit.inStock === false}
                        className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                          isAdded
                            ? 'bg-[#7B4382] text-white'
                            : 'bg-[#2F183C] text-white hover:bg-[#432356] active:scale-95 shadow-xs'
                        }`}
                      >
                        {fruit.inStock === false ? (
                          <span>Agotado</span>
                        ) : isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#DDA83A]" />
                            <span>¡Agregado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-[#DDA83A]" />
                            <span>Agregar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Custom Builder link */}
                  <div className="bg-[#F5ECF9] p-2 rounded-lg border border-[#DFCEE6] flex items-center justify-between text-xs">
                    <span className="text-[#2F183C] font-medium">¿Necesitas otra cantidad?</span>
                    <button
                      onClick={() => onCustomizeWithFruit(fruit.id)}
                      className="text-[#7B4382] font-bold hover:text-[#2F183C] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Personalizar</span>
                      <Sparkles className="w-3 h-3 text-[#DDA83A]" />
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
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#EADBEE] max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="relative aspect-[16/8] bg-[#1E0E27]">
              <img
                src={activeModalFruit.imageUrl}
                alt={activeModalFruit.imageAlt || `Ficha agronómica de ${activeModalFruit.name} (${activeModalFruit.presentation}) - Arándanos de alta montaña y agricultura responsable`}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E0E27] via-transparent to-transparent" />

              <button
                onClick={() => setActiveModalFruit(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-xs uppercase tracking-wider text-[#DDA83A] font-bold">
                  Ficha Técnica Agronómica
                </span>
                <h3 className="text-2xl font-black font-display">{activeModalFruit.name}</h3>
                <p className="text-xs text-[#DFCEE6] italic">{activeModalFruit.scientificName} · {activeModalFruit.variety}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-stone-700 text-sm">
              <p className="leading-relaxed">
                {activeModalFruit.description}
              </p>

              {/* Agronomic Indicators */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#FAF7F0] border border-[#EADBEE] text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-600 font-medium">
                    <SunMedium className="w-3.5 h-3.5 text-[#DDA83A]" />
                    <span>Dulzor</span>
                  </div>
                  <div className="text-sm font-bold text-[#2F183C] mt-1">{activeModalFruit.brix}</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-600 font-medium">
                    <Compass className="w-3.5 h-3.5 text-[#7B4382]" />
                    <span>Altitud</span>
                  </div>
                  <div className="text-sm font-bold text-[#2F183C] mt-1">{activeModalFruit.altitude}</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-600 font-medium">
                    <Shield className="w-3.5 h-3.5 text-[#7B4382]" />
                    <span>Vida Útil</span>
                  </div>
                  <div className="text-sm font-bold text-[#2F183C] mt-1">{activeModalFruit.shelfLife}</div>
                </div>
              </div>

              {/* Benefits list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2F183C] mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#7B4382]" />
                  <span>Beneficios & Compromisos</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeModalFruit.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#F5ECF9] p-2 rounded-md border border-[#DFCEE6] text-[#2F183C]">
                      <span className="text-[#7B4382] font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Freshness Guarantee */}
              <div className="bg-[#FAF2DF] p-3.5 rounded-xl border border-[#EED7A1] text-xs text-[#785412] space-y-1">
                <span className="font-bold block text-[#2F183C]">🫐 Garantía de Frescura Fresh Pick:</span>
                <p>
                  Garantizamos arándanos frescos o te los reemplazamos. No laves la fruta antes de guardarla. Mantenla refrigerada entre 2°C y 4°C en su empaque original para conservar su pruina protectora natural.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EADBEE] bg-[#FAF7F0] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-stone-500 block">Precio regular</span>
                <span className="text-xl font-black text-[#2F183C] font-display">
                  ${activeModalFruit.standardPrice.toLocaleString('es-CO')} COP c/u
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = activeModalFruit.id;
                    setActiveModalFruit(null);
                    onCustomizeWithFruit(id);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DFCEE6] text-[#2F183C] text-xs font-bold hover:bg-[#F5ECF9] transition-colors"
                >
                  Personalizar Gramos
                </button>
                <button
                  onClick={() => {
                    handleAdd(activeModalFruit);
                    setActiveModalFruit(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#2F183C] text-white text-xs font-bold hover:bg-[#432356] transition-colors shadow-xs"
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
