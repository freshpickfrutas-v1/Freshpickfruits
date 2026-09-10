import React, { useState, useEffect } from 'react';
import { Fruit, PackagingOption, AddOn, CustomOrder } from '../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Package,
  BadgeCheck,
  Gift,
  Plus,
  Minus,
  CheckCircle,
  CircleAlert,
  Send,
  Truck,
  RotateCcw,
  CreditCard,
  Calendar,
  MessageCircle
} from 'lucide-react';

interface CustomOrderSectionProps {
  fruits: Fruit[];
  packagingOptions: PackagingOption[];
  addOns: AddOn[];
  initialSelectedFruitId?: string | null;
  onOrderCompleted?: (order: CustomOrder) => void;
}

export const CustomOrderSection: React.FC<CustomOrderSectionProps> = ({
  fruits,
  packagingOptions,
  addOns,
  initialSelectedFruitId,
  onOrderCompleted
}) => {
  const [selectedPackaging, setSelectedPackaging] = useState<string>(
    packagingOptions[0]?.id || 'pack-eco-kraft'
  );

  const [fruitGrams, setFruitGrams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    fruits.forEach(f => {
      if (initialSelectedFruitId === f.id || f.id === 'arandanos-premium') {
        initial[f.id] = 500;
      } else if (f.id === 'fresas-albion') {
        initial[f.id] = 250;
      } else {
        initial[f.id] = 0;
      }
    });
    return initial;
  });

  // If initialSelectedFruitId changes from outside
  useEffect(() => {
    if (initialSelectedFruitId) {
      setFruitGrams(prev => ({
        ...prev,
        [initialSelectedFruitId]: (prev[initialSelectedFruitId] || 0) > 0 ? prev[initialSelectedFruitId] : 500
      }));
    }
  }, [initialSelectedFruitId]);

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [ripeness, setRipeness] = useState<string>('firm_for_week');
  const [isGift, setIsGift] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('one_time');

  // Customer & Delivery Info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [deliveryCity, setDeliveryCity] = useState<string>('Bogotá D.C.');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split('T')[0];
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('morning');
  const [paymentMethod, setPaymentMethod] = useState<string>('nequi_daviplata');

  // Order submission state
  const [confirmedOrder, setConfirmedOrder] = useState<CustomOrder | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const adjustGrams = (fruitId: string, delta: number) => {
    setFruitGrams(prev => {
      const current = prev[fruitId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [fruitId]: next };
    });
  };

  const setExactGrams = (fruitId: string, grams: number) => {
    setFruitGrams(prev => ({ ...prev, [fruitId]: grams }));
  };

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const currentPackaging =
    packagingOptions.find(p => p.id === selectedPackaging) || packagingOptions[0];

  const totalGrams = fruits.reduce((sum, f) => sum + (fruitGrams[f.id] || 0), 0);

  const fruitsCost = Object.entries(fruitGrams).reduce((sum, [fruitId, grams]) => {
    const fruit = fruits.find(f => f.id === fruitId);
    const g = Number(grams) || 0;
    if (!fruit || g <= 0) return sum;
    return sum + fruit.pricePerGram * g;
  }, 0);

  const packagingCost = currentPackaging ? currentPackaging.extraPrice : 0;

  const addOnsCost = selectedAddOns.reduce((sum, addonId) => {
    const addon = addOns.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const subtotal = fruitsCost + packagingCost + addOnsCost;
  const discountRate = frequency === 'weekly' ? 0.1 : frequency === 'biweekly' ? 0.05 : 0;
  const discount = Math.round(subtotal * discountRate);
  const isFreeDelivery = subtotal - discount >= 60000;
  const deliveryFee = totalGrams === 0 || isFreeDelivery ? 0 : 7000;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (totalGrams === 0) {
      newErrors.fruits = 'Por favor selecciona al menos una variedad de fruta con gramaje.';
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Ingresa tu nombre completo.';
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      newErrors.customerPhone = 'Ingresa un número de WhatsApp / teléfono válido.';
    }
    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Ingresa la dirección completa de entrega.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = (sendWhatsAppDirect = false) => {
    if (!validate()) {
      const errEl = document.getElementById('custom-order-errors');
      if (errEl) {
        errEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const orderId = 'FP-' + Math.floor(10000 + Math.random() * 90000);
    const selectedFruitItems = Object.entries(fruitGrams)
      .filter(([_, grams]) => Number(grams) > 0)
      .map(([fruitId, grams]) => ({ fruitId, grams: Number(grams) }));

    const order: CustomOrder = {
      id: orderId,
      packagingId: selectedPackaging,
      fruits: selectedFruitItems,
      addOns: selectedAddOns,
      ripeness,
      giftMessage: isGift ? giftMessage : undefined,
      recipientName: isGift ? recipientName : undefined,
      customerName,
      customerPhone,
      customerEmail,
      deliveryCity,
      deliveryAddress,
      deliveryDate,
      deliveryTimeSlot,
      frequency,
      notes: specialNotes,
      paymentMethod,
      subtotal,
      packagingCost,
      addOnsCost,
      discount,
      deliveryFee,
      total,
      createdAt: new Date().toISOString()
    };

    setConfirmedOrder(order);
    if (onOrderCompleted) {
      onOrderCompleted(order);
    }

    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    if (sendWhatsAppDirect) {
      const fruitText = selectedFruitItems
        .map(item => {
          const f = fruits.find(fr => fr.id === item.fruitId);
          return `• ${f?.name || item.fruitId}: ${item.grams}g ($${((f?.pricePerGram || 0) * Number(item.grams)).toLocaleString('es-CO')} COP)`;
        })
        .join('%0A');

      const addOnText =
        selectedAddOns.length > 0
          ? '%0A*Complementos:*%0A' +
            selectedAddOns
              .map(aId => {
                const a = addOns.find(ad => ad.id === aId);
                return `• ${a?.name} ($${a?.price.toLocaleString('es-CO')})`;
              })
              .join('%0A')
          : '';

      const waMessage = `*NUEVO PEDIDO PERSONALIZADO - FRESH PICK FRUTAS*%0A%0A*Orden:* ${orderId}%0A*Cliente:* ${customerName}%0A*Teléfono:* ${customerPhone}%0A*Ciudad / Dirección:* ${deliveryCity}, ${deliveryAddress}%0A*Fecha de Entrega:* ${deliveryDate} (${deliveryTimeSlot === 'morning' ? 'Mañana 8am-1pm' : 'Tarde 1pm-6pm'})%0A*Frecuencia:* ${frequency === 'weekly' ? 'Semanal' : frequency === 'biweekly' ? 'Quincenal' : 'Única vez'}%0A%0A*Frutas Seleccionadas:*%0A${fruitText}${addOnText}%0A%0A*Empaque:* ${currentPackaging.name}%0A*Maduración deseada:* ${ripeness === 'ready_now' ? 'Listo para comer ya' : ripeness === 'firm_for_week' ? 'Firme para toda la semana' : 'Maduración alta para batidos'}%0A${isGift && giftMessage ? `*Dedicatoria Regalo:* "${giftMessage}" (Para: ${recipientName})%0A` : ''}${specialNotes ? `*Notas adicionales:* ${specialNotes}%0A` : ''}*Método de pago:* ${paymentMethod}%0A%0A*TOTAL A PAGAR:* $${total.toLocaleString('es-CO')} COP%0A%0APor favor confírmenme el despacho. ¡Gracias!`;

      window.open(`https://wa.me/573216920138?text=${waMessage}`, '_blank');
    }
  };

  const resetForm = () => {
    setConfirmedOrder(null);
    setFruitGrams(() => {
      const resetMap: Record<string, number> = {};
      fruits.forEach(f => {
        resetMap[f.id] = f.id === 'arandanos-premium' ? 500 : 0;
      });
      return resetMap;
    });
    setSelectedAddOns([]);
    setIsGift(false);
    setGiftMessage('');
  };

  return (
    <section
      id="pedidos-personalizados"
      className="py-16 sm:py-24 bg-gradient-to-b from-[#f8fafc] via-blue-50/20 to-stone-50 border-y border-blue-950/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Exclusivo Fresh Pick Frutas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight font-display">
            Arma tu Pedido Personalizado en Línea
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600">
            Elige los gramos exactos de cada fruta, la presentación artesanal o ecológica, el punto de maduración ideal y dedicatoria personalizada si es para regalar.
          </p>
        </div>

        {/* Confirmation Screen */}
        {confirmedOrder ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-blue-200 p-6 sm:p-10 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
              ¡Pedido Generado con Éxito!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-1">
              Orden #{confirmedOrder.id}
            </h3>
            <p className="text-stone-600 text-sm mt-2 max-w-md mx-auto">
              Muchas gracias, <strong className="text-stone-900">{confirmedOrder.customerName}</strong>. Hemos registrado tu pedido personalizado. Nuestro equipo de campo lo cosechará al amanecer.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs sm:text-sm space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                <span className="text-stone-500">Fecha programada:</span>
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {confirmedOrder.deliveryDate} ({confirmedOrder.deliveryTimeSlot === 'morning' ? 'Mañana' : 'Tarde'})
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                <span className="text-stone-500">Dirección de entrega:</span>
                <span className="font-semibold text-stone-800 text-right max-w-[60%] truncate">
                  {confirmedOrder.deliveryAddress}, {confirmedOrder.deliveryCity}
                </span>
              </div>
              <div className="space-y-1.5 py-1">
                <span className="font-bold text-stone-900 block text-xs uppercase tracking-wider text-blue-800">
                  Frutas en tu caja ({totalGrams}g totales):
                </span>
                {confirmedOrder.fruits.map(fItem => {
                  const fr = fruits.find(f => f.id === fItem.fruitId);
                  return (
                    <div key={fItem.fruitId} className="flex justify-between text-stone-700">
                      <span>• {fr?.name || fItem.fruitId}</span>
                      <span className="font-semibold">{fItem.grams} gramos</span>
                    </div>
                  );
                })}
              </div>

              {confirmedOrder.giftMessage && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-xs">Tarjeta de Regalo:</span>
                  <p className="italic text-xs mt-0.5">"{confirmedOrder.giftMessage}"</p>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-bold text-stone-900">Total a pagar:</span>
                <span className="text-xl font-black text-blue-800 font-display">
                  ${confirmedOrder.total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/573216920138?text=Hola%20Fresh%20Pick%20Frutas!%20Acabo%20de%20hacer%20el%20pedido%20personalizado%20%23${confirmedOrder.id}%20a%20nombre%20de%20${encodeURIComponent(confirmedOrder.customerName)}.%20Quisiera%20confirmarlo.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmar por WhatsApp</span>
              </a>
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Armar otro pedido</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Steps Column */}
            <div className="lg:col-span-7 space-y-8">
              {/* Error messages box */}
              {Object.keys(errors).length > 0 && (
                <div
                  id="custom-order-errors"
                  className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-xs sm:text-sm flex items-start gap-3 animate-in shake duration-300"
                >
                  <CircleAlert className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Por favor verifica los siguientes campos:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 1: Fruits & Grams */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-blue-800 text-white text-xs font-black flex items-center justify-center font-display">
                      1
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 font-display">
                        Elige tus Frutas y Gramajes
                      </h3>
                      <p className="text-xs text-stone-500">
                        Selecciona la cantidad en gramos de cada fruto recién cosechado.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 font-medium block">
                      Peso total de fruta
                    </span>
                    <span className="text-sm font-black text-blue-800 font-display">
                      {(totalGrams / 1000).toFixed(2)} kg{' '}
                      <span className="text-xs font-normal text-stone-500">({totalGrams}g)</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {fruits.map(fruit => {
                    const grams = fruitGrams[fruit.id] || 0;
                    const fruitSubtotal = fruit.pricePerGram * grams;

                    return (
                      <div
                        key={fruit.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                          grams > 0
                            ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                            : 'bg-stone-50/60 border-stone-200/80 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={fruit.imageUrl}
                              alt={fruit.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-stone-900">{fruit.name}</h4>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 font-semibold">
                                  {fruit.brix}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500">
                                ${fruit.pricePerGram} COP/g · ${(fruit.pricePerGram * 250).toLocaleString('es-CO')} por 250g
                              </p>
                              {grams > 0 && (
                                <span className="text-xs font-bold text-blue-800">
                                  Subtotal fruta: ${fruitSubtotal.toLocaleString('es-CO')} COP
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/50">
                            {/* Preset Buttons */}
                            <div className="flex items-center gap-1 text-xs">
                              {[0, 250, 500, 1000].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setExactGrams(fruit.id, val)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                                    grams === val
                                      ? 'bg-blue-700 text-white'
                                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                                  }`}
                                >
                                  {val === 0 ? '0' : val >= 1000 ? `${val / 1000}kg` : `${val}g`}
                                </button>
                              ))}
                            </div>

                            {/* Stepper */}
                            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg p-1 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => adjustGrams(fruit.id, -100)}
                                disabled={grams <= 0}
                                className="w-7 h-7 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                aria-label={`Disminuir gramos de ${fruit.name}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-14 text-center text-xs font-bold text-stone-900">
                                {grams}g
                              </span>
                              <button
                                type="button"
                                onClick={() => adjustGrams(fruit.id, 100)}
                                className="w-7 h-7 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                                aria-label={`Aumentar gramos de ${fruit.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Packaging Selection */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <span className="w-7 h-7 rounded-full bg-blue-800 text-white text-xs font-black flex items-center justify-center font-display">
                    2
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 font-display">
                      Presentación y Tipo de Empaque
                    </h3>
                    <p className="text-xs text-stone-500">
                      Diseñadas para mantener la frescura óptima o sorprender con un detalle elegante.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {packagingOptions.map(pkg => {
                    const isSelected = selectedPackaging === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackaging(pkg.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <Package
                                className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-stone-500'}`}
                              />
                              <h4 className="text-sm font-bold text-stone-900">{pkg.name}</h4>
                            </div>
                            {isSelected && <BadgeCheck className="w-5 h-5 text-blue-600" />}
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">{pkg.description}</p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-stone-500 italic">{pkg.bestFor}</span>
                          <span className="font-bold text-blue-900">
                            {pkg.extraPrice === 0
                              ? 'Incluido'
                              : `+$${pkg.extraPrice.toLocaleString('es-CO')}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Add-ons */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <span className="w-7 h-7 rounded-full bg-blue-800 text-white text-xs font-black flex items-center justify-center font-display">
                    3
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 font-display">
                      Complementos Artesanales de la Finca (Opcional)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Miel de nuestras colmenas, granolas horneadas y mermeladas puras.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {addOns.map(addon => {
                    const isAdded = selectedAddOns.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isAdded
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-stone-100">
                          <img
                            src={addon.imageUrl}
                            alt={addon.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-stone-900 leading-snug">
                            {addon.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                            {addon.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-xs font-black text-blue-800 font-display">
                            ${addon.price.toLocaleString('es-CO')}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              isAdded ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {isAdded ? '✓ Agregado' : '+ Añadir'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Ripeness & Gift Options */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-7 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <span className="w-7 h-7 rounded-full bg-blue-800 text-white text-xs font-black flex items-center justify-center font-display">
                    4
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 font-display">
                      Maduración y Personalización de Regalo
                    </h3>
                    <p className="text-xs text-stone-500">
                      Adaptamos la recolección según tu plan de consumo.
                    </p>
                  </div>
                </div>

                {/* Ripeness Level */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Nivel de Maduración Deseado al Despacho:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'firm_for_week',
                        label: 'Firme para la Semana',
                        desc: 'Ideal para guardar en nevera y comer día a día.'
                      },
                      {
                        id: 'ready_now',
                        label: 'Listo para Consumir Hoy',
                        desc: 'En su punto exacto de dulzor y textura jugosa.'
                      },
                      {
                        id: 'ripe_for_smoothies',
                        label: 'Maduro para Batidos / Repostería',
                        desc: 'Máximo azúcar natural y facilidad de macerado.'
                      }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRipeness(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          ripeness === opt.id
                            ? 'border-blue-700 bg-blue-50 text-blue-950 font-semibold'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[11px] text-stone-500 mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gift Option */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={e => setIsGift(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-700" />
                      <span>
                        ¿Es para regalar? Incluir tarjeta con dedicatoria escrita a mano (Sin costo adicional)
                      </span>
                    </span>
                  </label>

                  {isGift && (
                    <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Nombre de la persona que recibe:
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={e => setRecipientName(e.target.value)}
                          placeholder="Ej. Mamá, Carlos Gómez, Laura..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Mensaje que escribiremos en la tarjeta de regalo:
                        </label>
                        <textarea
                          rows={2}
                          value={giftMessage}
                          onChange={e => setGiftMessage(e.target.value)}
                          placeholder="¡Feliz cumpleaños! Disfruta estas frutas frescas recién cosechadas para ti..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-blue-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Instrucciones Especiales de Manipulación o Cosecha:
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    placeholder="Ej. Dejar en portería torre 3, o prefiero los arándanos de calibre más grande posible..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Step 5: Delivery & Customer Info */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <span className="w-7 h-7 rounded-full bg-blue-800 text-white text-xs font-black flex items-center justify-center font-display">
                    5
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 font-display">
                      Datos de Entrega y Programación
                    </h3>
                    <p className="text-xs text-stone-500">
                      Coordinamos el despacho directo a tu puerta en vehículo climatizado.
                    </p>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Frecuencia del Pedido:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'one_time', label: 'Pedido Único', discount: 'Precio regular' },
                      { id: 'weekly', label: 'Semanal Recurrente', discount: '10% de Descuento' },
                      { id: 'biweekly', label: 'Quincenal Recurrente', discount: '5% de Descuento' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFrequency(opt.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          frequency === opt.id
                            ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[10px] text-blue-700 font-semibold">{opt.discount}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp / Celular *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 321 692 0138"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Ciudad / Municipio *
                    </label>
                    <select
                      value={deliveryCity}
                      onChange={e => setDeliveryCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-blue-600 bg-white"
                    >
                      <option value="Bogotá D.C.">Bogotá D.C. (Todas las zonas)</option>
                      <option value="Chía">Chía, Cundinamarca</option>
                      <option value="Cajicá">Cajicá, Cundinamarca</option>
                      <option value="Cota">Cota, Cundinamarca</option>
                      <option value="Zipaquirá">Zipaquirá, Cundinamarca</option>
                      <option value="Sopó">Sopó, Cundinamarca</option>
                      <option value="Medellín">Medellín (Envío refrigerado)</option>
                      <option value="Otra Ciudad">Otra Ciudad Principal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Dirección y Barrio / Apto *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="Ej. Calle 127 # 15-30, Apto 502"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Fecha de Entrega Deseada *
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Franja Horaria
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryTimeSlot('morning')}
                        className={`flex-1 py-2 text-xs rounded-lg border font-semibold ${
                          deliveryTimeSlot === 'morning'
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        Mañana (8am - 1pm)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryTimeSlot('afternoon')}
                        className={`flex-1 py-2 text-xs rounded-lg border font-semibold ${
                          deliveryTimeSlot === 'afternoon'
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        Tarde (1pm - 6pm)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="pt-3 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Método de Pago Preferido:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'nequi_daviplata', label: 'Nequi / Daviplata' },
                      { id: 'transfer', label: 'Bancolombia / PSE' },
                      { id: 'card', label: 'Tarjeta Crédito/Débito' },
                      { id: 'cash_on_delivery', label: 'Contraentrega' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2 rounded-lg border text-center text-xs transition-colors cursor-pointer ${
                          paymentMethod === m.id
                            ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold'
                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Summary Box */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
              <div className="bg-white rounded-3xl border-2 border-blue-800/20 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-900 text-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-blue-300 font-bold">
                      Resumen del Pedido
                    </span>
                    <span className="bg-blue-800 text-blue-100 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      Cosecha Viva
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-display mt-1">Tu Caja Personalizada</h3>
                  <p className="text-xs text-blue-200 mt-0.5">Empaque: {currentPackaging.name}</p>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                  {/* Grams Progress */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-medium text-stone-600 mb-1">
                      <span>Fruta agregada:</span>
                      <span className="font-bold text-blue-900">
                        {totalGrams}g ({(totalGrams / 1000).toFixed(2)} kg)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, (totalGrams / 2000) * 100)}%` }}
                      />
                    </div>
                    {totalGrams === 0 && (
                      <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                        <CircleAlert className="w-3 h-3" />
                        <span>Aún no has sumado frutas a tu orden.</span>
                      </p>
                    )}
                  </div>

                  {/* Itemized List */}
                  <div className="space-y-2 py-2 border-y border-stone-100 max-h-48 overflow-y-auto">
                    {fruits.map(fruit => {
                      const grams = fruitGrams[fruit.id] || 0;
                      if (grams === 0) return null;
                      const fTotal = fruit.pricePerGram * grams;
                      return (
                        <div
                          key={fruit.id}
                          className="flex justify-between items-center text-stone-700"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span className="font-medium">{fruit.name}</span>
                            <span className="text-stone-400 text-xs">({grams}g)</span>
                          </div>
                          <span className="font-semibold text-stone-900">
                            ${fTotal.toLocaleString('es-CO')}
                          </span>
                        </div>
                      );
                    })}

                    {packagingCost > 0 && (
                      <div className="flex justify-between items-center text-stone-700 pt-1">
                        <span className="text-stone-600">Empaque ({currentPackaging.name}):</span>
                        <span className="font-semibold text-stone-900">
                          ${packagingCost.toLocaleString('es-CO')}
                        </span>
                      </div>
                    )}

                    {selectedAddOns.map(addonId => {
                      const addon = addOns.find(a => a.id === addonId);
                      if (!addon) return null;
                      return (
                        <div
                          key={addonId}
                          className="flex justify-between items-center text-stone-700"
                        >
                          <span className="text-stone-600">+ {addon.name}:</span>
                          <span className="font-semibold text-stone-900">
                            ${addon.price.toLocaleString('es-CO')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-stone-800">
                        ${subtotal.toLocaleString('es-CO')} COP
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-blue-700 font-medium">
                        <span>
                          Descuento frecuencia ({frequency === 'weekly' ? '10%' : '5%'}):
                        </span>
                        <span>-${discount.toLocaleString('es-CO')} COP</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span>Envío a domicilio:</span>
                      {isFreeDelivery ? (
                        <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          ¡GRATIS!
                        </span>
                      ) : (
                        <span className="font-semibold text-stone-800">
                          ${deliveryFee.toLocaleString('es-CO')} COP
                        </span>
                      )}
                    </div>

                    {!isFreeDelivery && totalGrams > 0 && (
                      <p className="text-[11px] text-stone-400">
                        Agrega ${(60000 - (subtotal - discount)).toLocaleString('es-CO')} más para envío gratis.
                      </p>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs text-stone-500 block uppercase font-bold tracking-wider">
                        Total a pagar
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Impuestos y empaque incluidos
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-blue-950 font-display">
                      ${total.toLocaleString('es-CO')}{' '}
                      <span className="text-xs font-normal text-stone-500">COP</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSubmitOrder(false)}
                      disabled={totalGrams === 0}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-800 text-white font-bold text-sm hover:bg-blue-900 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-900/15 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar Pedido Personalizado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmitOrder(true)}
                      disabled={totalGrams === 0}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>Pedir Directamente por WhatsApp</span>
                    </button>
                  </div>

                  {/* Guarantee Tags */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-center gap-4 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-700" />
                      Cosecha 24h
                    </span>
                    <span className="flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
                      Garantía 100% frescura
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info Card */}
              <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <CreditCard className="w-4 h-4 text-blue-700" />
                  <span>Métodos de Pago Transparentes</span>
                </div>
                <p>
                  Recibimos transferencias inmediatas por Nequi, Daviplata o PSE una vez confirmada la recolección, o en efectivo/datafono a la entrega.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
