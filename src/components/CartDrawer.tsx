import React from 'react';
import { FruitItem } from '../types';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';

export interface CartItem {
  fruit: FruitItem;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (fruitId: string, quantity: number) => void;
  onRemoveItem: (fruitId: string) => void;
  onGoToCustomOrder: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onGoToCustomOrder
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + (item.fruit.standardPrice * item.quantity), 0);
  const totalGrams = items.reduce((acc, item) => acc + ((item.fruit.defaultGramUnit || 125) * item.quantity), 0);
  const meetsMinOrder = totalGrams >= 500;
  const hasPackingError = items.some(item => {
    const isMultiOfTwo = item.fruit.defaultGramUnit === 125 || item.fruit.defaultGramUnit === 250;
    return isMultiOfTwo && item.quantity % 2 !== 0;
  });

  const isFreeDelivery = subtotal >= 60000;
  const deliveryFee = items.length === 0 ? 0 : (isFreeDelivery ? 0 : 7000);
  const total = subtotal + deliveryFee;

  const handleWhatsAppCheckout = () => {
    if (!meetsMinOrder) {
      alert(`El pedido mínimo total son 500g. Llevas ${totalGrams}g (faltan ${500 - totalGrams}g para completar el mínimo).`);
      return;
    }
    if (hasPackingError) {
      alert('Por favor ajusta los estuches de 125g y 250g a múltiplos de 2 unidades para poder empacar tu envío.');
      return;
    }

    const list = items.map(item => {
      const g = (item.fruit.defaultGramUnit || 125) * item.quantity;
      return `• ${item.fruit.name} (${item.fruit.presentation}) x${item.quantity} [${g}g]: $${(item.fruit.standardPrice * item.quantity).toLocaleString('es-CO')} COP`;
    }).join('%0A');

    const msg = `*PEDIDO DIRECTO - FRESH PICK ARÁNDANOS*%0A%0A` +
      `*Productos (${totalGrams}g totales):*%0A${list}%0A%0A` +
      `*Subtotal:* $${subtotal.toLocaleString('es-CO')} COP%0A` +
      `*Envío:* ${isFreeDelivery ? 'GRATIS' : '$7.000 COP'}%0A` +
      `*TOTAL:* $${total.toLocaleString('es-CO')} COP%0A%0A` +
      `Nota: Cumple condición de despacho (mínimo total 500g y múltiplos de 2 para estuches de 125g y 250g).%0A` +
      `Hola! Deseo confirmar este pedido de arándanos frescos para despacho a domicilio.`;
    
    window.open(`https://wa.me/573178931026?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-800" />
            <h3 className="text-lg font-bold text-stone-900 font-display">
              Tu Carrito de Cosecha
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Condition / Notice Bar */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-b border-stone-200 space-y-2 bg-stone-50/70">
            {totalGrams < 500 ? (
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>
                  <strong>Pedido mín. total: 500g</strong> (Faltan <strong>{500 - totalGrams}g</strong> para completar el mínimo)
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-[#F5ECF9] border border-[#DFCEE6] text-[#2F183C] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7B4382]" />
                <span>
                  <strong>✓ Pedido mínimo completado</strong> ({totalGrams}g en total)
                </span>
              </div>
            )}
            {hasPackingError && (
              <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                <span>Ajusta a múltiplos de 2 unidades para 125g y 250g.</span>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl">
                🧺
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-base">Tu canasta está vacía</h4>
                <p className="text-stone-500 text-xs mt-1 max-w-xs">
                  Añade arándanos frescos desde nuestro catálogo o arma tu caja personalizada.
                </p>
              </div>

              <button
                onClick={() => { onClose(); onGoToCustomOrder(); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F183C] text-white text-xs font-bold hover:bg-[#432356] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DDA83A]" />
                <span>Armar Pedido de Arándanos</span>
              </button>
            </div>
          ) : (
            items.map((item) => {
              const step = item.fruit.defaultGramUnit || 125;
              const isMultiOfTwo = step === 125 || step === 250;
              const isOdd = isMultiOfTwo && item.quantity % 2 !== 0;
              const unitMultiplier = isMultiOfTwo ? 2 : 1;

              return (
                <div
                  key={item.fruit.id}
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
                    isOdd
                      ? 'bg-red-50/70 border-red-300'
                      : 'bg-stone-50 border-stone-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <img
                      src={item.fruit.imageUrl}
                      alt={item.fruit.imageAlt || `${item.fruit.name} (${item.fruit.presentation}) - Arándanos frescos de alta montaña cultivados con agricultura responsable`}
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#2F183C] truncate">
                        {item.fruit.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {item.fruit.presentation} · ${item.fruit.standardPrice.toLocaleString('es-CO')}
                      </p>
                      <p className="text-xs font-extrabold text-[#2F183C] mt-0.5">
                        ${(item.fruit.standardPrice * item.quantity).toLocaleString('es-CO')} COP ({step * item.quantity}g)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg p-1">
                      <button
                        onClick={() => {
                          const nextQty = item.quantity - unitMultiplier;
                          if (nextQty > 0) {
                            onUpdateQuantity(item.fruit.id, isMultiOfTwo && nextQty % 2 !== 0 ? Math.floor(nextQty / 2) * 2 : nextQty);
                          } else {
                            onRemoveItem(item.fruit.id);
                          }
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                        aria-label="Disminuir unidades"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-[#2F183C]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const nextQty = item.quantity + unitMultiplier;
                          onUpdateQuantity(item.fruit.id, isMultiOfTwo && nextQty % 2 !== 0 ? Math.ceil(nextQty / 2) * 2 : nextQty);
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                        aria-label="Aumentar unidades"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.fruit.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                    {step === 500 ? (
                      <span className="text-[#7B4382] font-medium">✨ ¡Con 1 solo estuche completas el pedido mínimo total!</span>
                    ) : (
                      <span className="text-amber-800 font-medium">⚠️ Nota de empaque: Solo disponible en múltiplos de 2 unidades.</span>
                    )}
                    {isOdd && (
                      <div className="mt-1 flex items-center justify-between gap-2 text-red-700 bg-red-100/80 p-1.5 rounded-md">
                        <span>(Por favor, ajusta a {item.quantity < 2 ? 2 : item.quantity + 1} unidades para poder empacar tu envío)</span>
                        <button
                          onClick={() => onUpdateQuantity(item.fruit.id, item.quantity < 2 ? 2 : item.quantity + 1)}
                          className="px-2 py-0.5 bg-red-700 text-white rounded font-bold text-[10px] cursor-pointer"
                        >
                          Ajustar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-[#2F183C]">${subtotal.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Envío:</span>
                {isFreeDelivery ? (
                  <span className="text-[#2F183C] font-bold bg-[#DFCEE6] px-2 py-0.5 rounded text-[11px]">¡Gratis!</span>
                ) : (
                  <span className="font-semibold text-stone-800">${deliveryFee.toLocaleString('es-CO')} COP</span>
                )}
              </div>
              {!isFreeDelivery && (
                <p className="text-[10px] text-stone-400">
                  Faltan ${(60000 - subtotal).toLocaleString('es-CO')} para envío gratis.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#2F183C] uppercase">Total:</span>
              <span className="text-xl font-black text-[#2F183C] font-display">
                ${total.toLocaleString('es-CO')} COP
              </span>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              disabled={!meetsMinOrder || hasPackingError}
              className="w-full py-3 px-4 rounded-xl bg-[#2F183C] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm hover:bg-[#432356] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#DDA83A]" />
              <span>Completar Pedido por WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { onClose(); onGoToCustomOrder(); }}
              className="w-full py-2 px-3 rounded-lg border border-[#DFCEE6] text-[#2F183C] text-xs font-bold hover:bg-[#F5ECF9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7B4382]" />
              <span>O arma tu caja personalizada con gramajes exactos</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
