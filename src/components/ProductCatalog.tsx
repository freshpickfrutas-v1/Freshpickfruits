import React, { useState } from 'react';
import { Fruit } from '../types';
import { Sparkles, Info, Plus, Check, X, SunMedium, Compass, Shield, Heart } from 'lucide-react';

interface ProductCatalogProps {
  fruits: Fruit[];
  onAddToCart: (fruit: Fruit, quantity?: number) => void;
  onCustomizeWithFruit: (fruitId: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  fruits,
  onAddToCart,
  onCustomizeWithFruit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFruitModal, setActiveFruitModal] = useState<Fruit | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const filteredFruits = fruits.filter(fruit => {
    if (selectedCategory === 'all') return true;
    return fruit.category === selectedCategory;
  });

  const handleAdd = (fruit: Fruit) => {
    onAddToCart(fruit, 1);
    setAddedMap(prev => ({ ...prev, [fruit.id]: true }));
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [fruit.id]: false }));
    }, 1500);
  };

  return (
    <section id="variedades" className="py-16 sm:py-20 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Nuestras Variedades de Cosecha</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            Frutas de Altura con Dulzor y Textura Extraordinarios
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600">
            Cada fruto es cuidado desde la floración con abejas polinizadoras nativas y cosechado a mano una a una para preservar su pruina natural intacta.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Todas las Variedades ({fruits.length})
            </button>
            <button
              onClick={() => setSelectedCategory('berries')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'berries'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Berries & Arándanos
            </button>
            <button
              onClick={() => setSelectedCategory('exoticas')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'exoticas'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Exóticas Andinas (Uchuva)
            </button>
            <button
              onClick={() => setSelectedCategory('packs')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'packs'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Blends & Mixes
            </button>
          </div>
        </div>

        {/* Fruit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFruits.map(fruit => {
            const isJustAdded = addedMap[fruit.id];

            return (
              <div
                key={fruit.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={fruit.imageUrl}
                    alt={fruit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {fruit.popular && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
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

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
                      {fruit.variety}
                    </p>
                    <h3 className="text-xl font-bold font-display leading-tight drop-shadow-xs">
                      {fruit.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-stone-500 italic mb-2">{fruit.scientificName}</p>
                    <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {fruit.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {fruit.benefits.slice(0, 2).map((benefit, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100/80 font-medium"
                        >
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 block font-medium">
                        Presentación: {fruit.presentation}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-blue-950 font-display">
                          ${fruit.standardPrice.toLocaleString('es-CO')}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">COP</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveFruitModal(fruit)}
                        className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Ver ficha agronómica completa"
                        aria-label={`Ver detalles de ${fruit.name}`}
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleAdd(fruit)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isJustAdded
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-800 text-white hover:bg-blue-900 active:scale-95 shadow-xs'
                        }`}
                      >
                        {isJustAdded ? (
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

                  {/* Customize Mini Promo */}
                  <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                    <span className="text-blue-900 font-medium">¿La quieres en caja a medida?</span>
                    <button
                      onClick={() => onCustomizeWithFruit(fruit.id)}
                      className="text-blue-700 font-bold hover:text-blue-900 hover:underline flex items-center gap-0.5 cursor-pointer"
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

      {/* Agronomic Technical Sheet Modal */}
      {activeFruitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">
            <div className="relative aspect-[16/8] bg-stone-900">
              <img
                src={activeFruitModal.imageUrl}
                alt={activeFruitModal.name}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
              <button
                onClick={() => setActiveFruitModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
                  Ficha Técnica Agronómica
                </span>
                <h3 className="text-2xl font-black font-display">{activeFruitModal.name}</h3>
                <p className="text-xs text-stone-300 italic">
                  {activeFruitModal.scientificName} · {activeFruitModal.variety}
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-stone-700 text-sm">
              <p className="leading-relaxed">{activeFruitModal.description}</p>

              {/* Agronomic Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                    <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                    <span>Dulzor</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">
                    {activeFruitModal.brix}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    <span>Altitud</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">
                    {activeFruitModal.altitude}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Vida Útil</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">
                    {activeFruitModal.shelfLife}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Beneficios Saludables & Antioxidantes</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeFruitModal.benefits.map((b, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 bg-blue-50/50 p-2 rounded-md border border-blue-100"
                    >
                      <span className="text-blue-700 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fresh Pick Tip */}
              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">💡 Consejo de Conservación Fresh Pick:</span>
                <p>
                  No laves la fruta antes de guardarla. Mantenla refrigerada entre 2°C y 4°C en su empaque original para conservar su pruina protectora natural. Lávala únicamente minutos antes de su consumo.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-stone-500 block">Precio regular</span>
                <span className="text-xl font-black text-blue-950 font-display">
                  ${activeFruitModal.standardPrice.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const fruitId = activeFruitModal.id;
                    setActiveFruitModal(null);
                    onCustomizeWithFruit(fruitId);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-blue-300 text-blue-800 text-xs font-bold hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Personalizar Gramos
                </button>
                <button
                  onClick={() => {
                    handleAdd(activeFruitModal);
                    setActiveFruitModal(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-800 text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs cursor-pointer"
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
