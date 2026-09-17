import React from 'react';
import { FruitItem } from '../types';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

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
  const isFreeDelivery = subtotal >= 60000;
  const deliveryFee = items.length === 0 ? 0 : (isFreeDelivery ? 0 : 7000);
  const total = subtotal + deliveryFee;

  const handleWhatsAppCheckout = () => {
    const list = items.map(item => `• ${item.fruit.name} (${item.fruit.presentation}) x${item.quantity}: $${(item.fruit.standardPrice * item.quantity).toLocaleString('es-CO')} COP`).join('%0A');
    const msg = `*PEDIDO DIRECTO - FRESH PICK ARÁNDANOS*%0A%0A` +
      `*Productos:*%0A${list}%0A%0A` +
      `*Subtotal:* $${subtotal.toLocaleString('es-CO')} COP%0A` +
      `*Envío:* ${isFreeDelivery ? 'GRATIS' : '$7.000 COP'}%0A` +
      `*TOTAL:* $${total.toLocaleString('es-CO')} COP%0A%0A` +
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
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Armar Pedido de Arándanos</span>
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.fruit.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80"
              >
                <img
                  src={item.fruit.imageUrl}
                  alt={item.fruit.imageAlt || `${item.fruit.name} (${item.fruit.presentation}) - Arándanos frescos de alta montaña cultivados con agricultura responsable`}
                  className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {item.fruit.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {item.fruit.presentation} · ${item.fruit.standardPrice.toLocaleString('es-CO')}
                  </p>
                  <p className="text-xs font-extrabold text-blue-800 mt-0.5">
                    ${(item.fruit.standardPrice * item.quantity).toLocaleString('es-CO')} COP
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg p-1">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        onUpdateQuantity(item.fruit.id, item.quantity - 1);
                      } else {
                        onRemoveItem(item.fruit.id);
                      }
                    }}
                    className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.fruit.id, item.quantity + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.fruit.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-800">${subtotal.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Envío:</span>
                {isFreeDelivery ? (
                  <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.2 rounded">¡Gratis!</span>
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
              <span className="text-xs font-bold text-stone-900 uppercase">Total:</span>
              <span className="text-xl font-black text-blue-950 font-display">
                ${total.toLocaleString('es-CO')} COP
              </span>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full py-3 px-4 rounded-xl bg-blue-700 text-white font-bold text-xs sm:text-sm hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Completar Pedido por WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { onClose(); onGoToCustomOrder(); }}
              className="w-full py-2 px-3 rounded-lg border border-blue-300 text-blue-800 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>O arma tu caja personalizada con gramajes exactos</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
