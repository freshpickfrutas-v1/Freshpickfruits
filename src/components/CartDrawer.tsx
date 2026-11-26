import { track } from '../lib/analytics';
import React from 'react';
import { FruitItem } from '../types';
import { SHIPPING_FEE } from '../lib/pricing';
import { dateLocale, useLang, useT } from '../lib/i18n';
import { ModalDialog } from './ModalDialog';
import { waLink } from '../lib/contact';
import { CreditCard, X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';

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
  /** Carries the cart to the order form, where the customer enters delivery data and pays online. */
  onCheckoutOnline: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onGoToCustomOrder,
  onCheckoutOnline
}) => {
  const t = useT();
  const loc = dateLocale(useLang());
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + (item.fruit.standardPrice * item.quantity), 0);
  const totalGrams = items.reduce((acc, item) => acc + ((item.fruit.defaultGramUnit || 125) * item.quantity), 0);
  const meetsMinOrder = totalGrams >= 500;
  const hasPackingError = items.some(item => {
    const isMultiOfTwo = item.fruit.defaultGramUnit === 125 || item.fruit.defaultGramUnit === 250;
    return isMultiOfTwo && item.quantity % 2 !== 0;
  });

  // El envío es siempre $7.000 y no hay envío gratis. El pago en línea suma la comisión en el formulario de pedido.
  const deliveryFee = items.length === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + deliveryFee;

  const handleWhatsAppCheckout = () => {
    if (!meetsMinOrder) {
      alert(t(`El pedido mínimo total son 500g. Llevas ${totalGrams}g (faltan ${500 - totalGrams}g para completar el mínimo).`, `The minimum order is 500 g in total. You have ${totalGrams} g (${500 - totalGrams} g short of the minimum).`));
      return;
    }
    if (hasPackingError) {
      alert(t('Por favor ajusta los estuches de 125g y 250g a múltiplos de 2 unidades para poder empacar tu envío.', 'Please adjust the 125 g and 250 g boxes to multiples of 2 so we can pack your order.'));
      return;
    }

    const list = items.map(item => {
      const g = (item.fruit.defaultGramUnit || 125) * item.quantity;
      return `• ${item.fruit.name} (${item.fruit.presentation}) x${item.quantity} [${g}g]: $${(item.fruit.standardPrice * item.quantity).toLocaleString(loc)} COP`;
    }).join('\n');

    const msg = t(
      `*PEDIDO DIRECTO - FRESH PICK ARÁNDANOS*\n\n*Productos (${totalGrams}g totales):*\n${list}\n\n*Subtotal:* $${subtotal.toLocaleString(loc)} COP\n*Envío:* $${SHIPPING_FEE.toLocaleString(loc)} COP\n*TOTAL:* $${total.toLocaleString(loc)} COP\n\nNota: Cumple condición de despacho (mínimo total 500g y múltiplos de 2 para estuches de 125g y 250g).\nHola! Deseo confirmar este pedido de arándanos frescos para despacho a domicilio.`,
      `*DIRECT ORDER - FRESH PICK BLUEBERRIES*\n\n*Products (${totalGrams} g total):*\n${list}\n\n*Subtotal:* COP $${subtotal.toLocaleString(loc)}\n*Shipping:* COP $${SHIPPING_FEE.toLocaleString(loc)}\n*TOTAL:* COP $${total.toLocaleString(loc)}\n\nNote: Meets dispatch rules (500 g minimum in total and multiples of 2 for 125 g and 250 g boxes).\nHello! I would like to confirm this order of fresh blueberries for home delivery.`
    );
    window.open(waLink(msg), '_blank');
  };

  return (
    <ModalDialog label={t('Tu Carrito de Cosecha', 'Your Harvest Cart')} onClose={onClose} className="justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-800" />
            <h3 className="text-lg font-bold text-stone-900 font-display">
              {t('Tu Carrito de Cosecha', 'Your Harvest Cart')}
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label={t('Cerrar carrito', 'Close cart')}
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
                  {t(<><strong>Pedido mín. total: 500g</strong> (Faltan <strong>{500 - totalGrams}g</strong> para completar el mínimo)</>, <><strong>Minimum order: 500 g total</strong> (<strong>{500 - totalGrams} g</strong> short of the minimum)</>)}
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-[#F5ECF9] border border-[#DFCEE6] text-[#2F183C] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7B4382]" />
                <span>
                  {t(<><strong>✓ Pedido mínimo completado</strong> ({totalGrams}g en total)</>, <><strong>✓ Minimum order reached</strong> ({totalGrams} g in total)</>)}
                </span>
              </div>
            )}
            {hasPackingError && (
              <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                <span>{t('Ajusta a múltiplos de 2 unidades para 125g y 250g.', 'Adjust to multiples of 2 units for 125 g and 250 g boxes.')}</span>
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
                <h4 className="font-bold text-stone-800 text-base">{t('Tu canasta está vacía', 'Your basket is empty')}</h4>
                <p className="text-stone-500 text-xs mt-1 max-w-xs">
                  {t('Añade arándanos frescos desde nuestro catálogo o arma tu caja personalizada.', 'Add fresh blueberries from our catalog or build your own custom box.')}
                </p>
              </div>

              <button
                onClick={() => { onClose(); onGoToCustomOrder(); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F183C] text-white text-xs font-bold hover:bg-[#432356] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DDA83A]" />
                <span>{t('Armar Pedido de Arándanos', 'Build Your Blueberry Order')}</span>
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
                      alt={item.fruit.imageAlt || `${item.fruit.name} (${item.fruit.presentation}) - ${t('Arándanos frescos de alta montaña cultivados con agricultura responsable', 'Fresh high-mountain blueberries grown with responsible farming')}`}
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#2F183C] truncate">
                        {item.fruit.name}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {item.fruit.presentation} · ${item.fruit.standardPrice.toLocaleString(loc)}
                      </p>
                      <p className="text-xs font-extrabold text-[#2F183C] mt-0.5">
                        ${(item.fruit.standardPrice * item.quantity).toLocaleString(loc)} COP ({step * item.quantity}g)
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
                        aria-label={t('Disminuir unidades', 'Decrease quantity')}
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
                        aria-label={t('Aumentar unidades', 'Increase quantity')}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.fruit.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label={t('Eliminar producto', 'Remove product')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-stone-600 pt-1 border-t border-stone-200/60">
                    {step === 500 ? (
                      <span className="text-[#7B4382] font-medium">{t('✨ ¡Con 1 solo estuche completas el pedido mínimo total!', '✨ A single box completes the minimum order!')}</span>
                    ) : (
                      <span className="text-amber-800 font-medium">{t('⚠️ Nota de empaque: Solo disponible en múltiplos de 2 unidades.', '⚠️ Packing note: only available in multiples of 2 units.')}</span>
                    )}
                    {isOdd && (
                      <div className="mt-1 flex items-center justify-between gap-2 text-red-700 bg-red-100/80 p-1.5 rounded-md">
                        <span>{t(`(Por favor, ajusta a ${item.quantity < 2 ? 2 : item.quantity + 1} unidades para poder empacar tu envío)`, `(Please adjust to ${item.quantity < 2 ? 2 : item.quantity + 1} units so we can pack your order)`)}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.fruit.id, item.quantity < 2 ? 2 : item.quantity + 1)}
                          className="px-2 py-0.5 bg-red-700 text-white rounded font-bold text-xs cursor-pointer"
                        >
                          {t('Ajustar', 'Adjust')}
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
                <span className="font-semibold text-[#2F183C]">${subtotal.toLocaleString(loc)} COP</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('Envío:', 'Shipping:')}</span>
                <span className="font-semibold text-stone-800">${deliveryFee.toLocaleString(loc)} COP</span>
              </div>
              <p className="text-xs text-stone-400">
                {t('Si pagas en línea se suma la comisión de la pasarela (5%).', 'If you pay online, the payment gateway fee (5%) is added.')}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#2F183C] uppercase">Total:</span>
              <span className="text-xl font-black text-[#2F183C] font-display">
                ${total.toLocaleString(loc)} COP
              </span>
            </div>

            <button
              onClick={() => { track('begin_checkout', { value: total }); onCheckoutOnline(); }}
              disabled={!meetsMinOrder || hasPackingError}
              className="w-full py-3 px-4 rounded-xl bg-[#DDA83A] disabled:bg-stone-300 disabled:cursor-not-allowed text-[#2F183C] font-bold text-xs sm:text-sm hover:brightness-95 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('Continuar y pagar en línea', 'Continue and pay online')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleWhatsAppCheckout}
              disabled={!meetsMinOrder || hasPackingError}
              className="w-full py-3 px-4 rounded-xl bg-[#2F183C] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm hover:bg-[#432356] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#DDA83A]" />
              <span>{t('Completar Pedido por WhatsApp', 'Complete Order on WhatsApp')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </ModalDialog>
  );
};
