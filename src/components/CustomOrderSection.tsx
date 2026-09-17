import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { FruitItem, PackagingOption, AddOnItem, CustomOrder } from '../types';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus
} from 'lucide-react';

const WA = '573178931026';

interface CustomOrderSectionProps {
  fruits: FruitItem[];
  packagingOptions: PackagingOption[];
  addOns: AddOnItem[];
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
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>(packagingOptions[0]?.id || 'pack-eco-kraft');
  const [fruitGrams, setFruitGrams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    fruits.forEach(f => {
      if (initialSelectedFruitId === f.id) initial[f.id] = 500;
      else if (f.id === 'arandanos-premium') initial[f.id] = 500;
      else initial[f.id] = 0;
    });
    return initial;
  });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Bogotá D.C.');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [completedOrder, setCompletedOrder] = useState<CustomOrder | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedPackaging = packagingOptions.find(p => p.id === selectedPackagingId) || packagingOptions[0];
  const totalGrams = fruits.reduce((sum, f) => sum + (fruitGrams[f.id] || 0), 0);
  const fruitsCost = Object.entries(fruitGrams).reduce<number>((sum, [fruitId, grams]) => {
    const fruit = fruits.find(f => f.id === fruitId);
    const g = Number(grams) || 0;
    if (!fruit || g <= 0) return sum;
    return sum + fruit.pricePerGram * g;
  }, 0);
  const packagingCost = selectedPackaging ? selectedPackaging.extraPrice : 0;
  const subtotal = fruitsCost + packagingCost;
  // Pedido mínimo: 500g. Envío base $6.000 COP (no aplica envío gratis actualmente).
  const meetsMinOrder = totalGrams >= 500;
  const deliveryFee = !meetsMinOrder || totalGrams === 0 ? 0 : 6000;
  const grandTotal = Math.max(0, subtotal + deliveryFee);

  const handleGramsChange = (fruitId: string, delta: number) => {
    setFruitGrams(prev => ({
      ...prev,
      [fruitId]: Math.max(0, (prev[fruitId] || 0) + delta)
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (totalGrams === 0) errors.fruits = 'Selecciona al menos un formato de arándanos.';
    else if (totalGrams < 500) errors.fruits = 'El pedido mínimo es de 500g. Por favor ajusta la cantidad.';
    if (!customerName.trim()) errors.customerName = 'Ingresa tu nombre.';
    if (!customerPhone.trim() || customerPhone.trim().length < 7) errors.customerPhone = 'Ingresa un WhatsApp válido.';
    if (!deliveryAddress.trim()) errors.deliveryAddress = 'Ingresa la dirección de entrega.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (viaWhatsApp = false) => {
    if (!validateForm()) return;
    const orderId = 'FP-' + Math.floor(10000 + Math.random() * 90000);
    const fruitSelections = Object.entries(fruitGrams)
      .filter(([, grams]) => Number(grams) > 0)
      .map(([fruitId, grams]) => ({ fruitId, grams: Number(grams) }));

    const newOrder: CustomOrder = {
      id: orderId,
      packagingId: selectedPackagingId,
      fruits: fruitSelections,
      addOns: [],
      ripeness: 'firm_for_week',
      customerName,
      customerPhone,
      customerEmail: '',
      deliveryCity,
      deliveryAddress,
      deliveryDate,
      deliveryTimeSlot: 'morning',
      frequency: 'one_time',
      notes: '',
      paymentMethod: 'nequi_daviplata',
      subtotal,
      packagingCost,
      addOnsCost: 0,
      discount: 0,
      deliveryFee,
      total: grandTotal,
      createdAt: new Date().toISOString()
    };

    setCompletedOrder(newOrder);
    onOrderCompleted?.(newOrder);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (viaWhatsApp) {
      const fruitsSummary = fruitSelections
        .map(item => {
          const fruit = fruits.find(f => f.id === item.fruitId);
          return `• ${fruit?.name || item.fruitId}: ${item.grams}g`;
        })
        .join('%0A');
      const msg =
        `*PEDIDO PERSONALIZADO - FRESH PICK*%0A%0A` +
        `*Orden:* ${orderId}%0A` +
        `*Cliente:* ${customerName}%0A` +
        `*Teléfono:* ${customerPhone}%0A` +
        `*Dirección:* ${deliveryCity}, ${deliveryAddress}%0A` +
        `*Fecha de entrega:* ${deliveryDate}%0A%0A` +
        `*Arándanos:*%0A${fruitsSummary}%0A%0A` +
        `*Empaque:* ${selectedPackaging?.name}%0A` +
        `*Subtotal:* $${subtotal.toLocaleString('es-CO')} COP%0A` +
        `*Envío:* $${deliveryFee.toLocaleString('es-CO')} COP%0A` +
        `*TOTAL:* $${grandTotal.toLocaleString('es-CO')} COP%0A%0A` +
        `Confirmo pedido. Realizaré pago por transferencia o Bre-B @9010401617. ¡Gracias!`;
      window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
    }
  };

  if (completedOrder) {
    return (
      <section id="pedidos-personalizados" className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-200 p-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-stone-900">Orden #{completedOrder.id}</h3>
            <p className="text-stone-600 mt-2">Gracias, {completedOrder.customerName}. Tu pedido fue registrado.</p>
            <p className="text-xl font-black text-emerald-800 mt-4">
              ${completedOrder.total.toLocaleString('es-CO')} COP
            </p>
            <a
              href={`https://wa.me/${WA}?text=Hola%20Fresh%20Pick!%20Confirmo%20pedido%20%23${completedOrder.id}%20a%20nombre%20de%20${encodeURIComponent(completedOrder.customerName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B4D3E] text-white font-bold"
            >
              <MessageCircle className="w-4 h-4" />
              Confirmar por WhatsApp
            </a>
            <button
              onClick={() => setCompletedOrder(null)}
              className="mt-3 block mx-auto text-sm text-stone-500 underline"
            >
              Armar otro pedido
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pedidos-personalizados" className="py-16 sm:py-24 bg-gradient-to-b from-[#f8fafc] via-emerald-50/20 to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Pedidos personalizados
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Arma tu Pedido de Arándanos en Línea
          </h2>
          <p className="mt-3 text-stone-600">
            Elige 125g, 250g o 500g. Mínimo 500g. Entregas martes y miércoles (8:00 a.m. – 3:00 p.m.). Pagos por transferencia o Bre-B @9010401617.
          </p>
        </div>

        {Object.keys(formErrors).length > 0 && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-sm flex gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <ul className="list-disc list-inside">
              {Object.values(formErrors).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
              <h3 className="font-bold text-lg text-stone-900">1. Formatos y gramos</h3>
              {fruits.map(fruit => {
                const g = fruitGrams[fruit.id] || 0;
                return (
                  <div key={fruit.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-stone-900 truncate">{fruit.name}</p>
                      <p className="text-xs text-stone-500">{fruit.presentation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleGramsChange(fruit.id, -100)} className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-16 text-center">{g}g</span>
                      <button type="button" onClick={() => handleGramsChange(fruit.id, 100)} className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
              <h3 className="font-bold text-lg text-stone-900">2. Empaque</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packagingOptions.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPackagingId(p.id)}
                    className={`text-left p-3 rounded-xl border text-sm ${
                      selectedPackagingId === p.id
                        ? 'border-emerald-600 bg-emerald-50 font-semibold'
                        : 'border-stone-200'
                    }`}
                  >
                    {p.name}
                    {p.extraPrice > 0 && (
                      <span className="block text-xs text-stone-500">+${p.extraPrice.toLocaleString('es-CO')}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
              <h3 className="font-bold text-lg text-stone-900">3. Datos de entrega</h3>
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                placeholder="Nombre completo"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                placeholder="WhatsApp (ej. 317 893 1026)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                placeholder="Ciudad"
                value={deliveryCity}
                onChange={e => setDeliveryCity(e.target.value)}
              />
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                placeholder="Dirección completa"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-500" />
                <input
                  type="date"
                  className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-lg">Resumen</h3>
              <p className="text-sm text-stone-600">Peso total: <strong>{totalGrams}g</strong></p>
              <p className="text-sm text-stone-600">Subtotal: ${subtotal.toLocaleString('es-CO')} COP</p>
              <p className="text-sm text-stone-600">Envío: {deliveryFee === 0 ? 'Gratis' : `$${deliveryFee.toLocaleString('es-CO')}`}</p>
              <p className="text-2xl font-black text-[#1B4D3E]">${grandTotal.toLocaleString('es-CO')} COP</p>
              <button
                type="button"
                onClick={() => handleSubmitOrder(true)}
                className="w-full py-3 rounded-xl bg-[#1B4D3E] text-white font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Pedir por WhatsApp
              </button>
              <button
                type="button"
                onClick={() => handleSubmitOrder(false)}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm"
              >
                Guardar pedido en la web
              </button>
              <p className="text-[11px] text-stone-400 text-center">WhatsApp: +57 317 893 1026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
