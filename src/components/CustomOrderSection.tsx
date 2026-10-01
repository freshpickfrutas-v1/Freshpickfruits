import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FruitItem, PackagingOption, AddOnItem, CustomOrder, BillingData, SavedAddress } from '../types';
import { createOrder } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';
import { saveAddresses, hasAddress, newAddressId, MAX_ADDRESSES } from '../lib/addresses';
import { BOGOTA, PlacePick, mapsLink } from '../lib/maps';
import { AddressField } from './AddressField';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus,
  Loader2
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
  initialSelectedFruitId,
  onOrderCompleted
}) => {
  const [fruitGrams, setFruitGrams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    fruits.forEach(f => {
      if (initialSelectedFruitId === f.id) {
        // Inicializar con el mínimo de 500g para el formato seleccionado
        initial[f.id] = 500;
      } else {
        initial[f.id] = 0;
      }
    });
    return initial;
  });

  // Sync when user clicks customize on a specific card from the catalog
  useEffect(() => {
    if (initialSelectedFruitId) {
      const target = fruits.find(f => f.id === initialSelectedFruitId);
      if (target) {
        setFruitGrams(prev => {
          const current = prev[initialSelectedFruitId] || 0;
          if (current === 0) {
            return {
              ...prev,
              [initialSelectedFruitId]: 500
            };
          }
          return prev;
        });
      }
    }
  }, [initialSelectedFruitId, fruits]);

  const { user, profile } = useAuth();
  const savedAddresses: SavedAddress[] = profile?.addresses ?? [];
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const addressPicked = React.useRef(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [wantsNit, setWantsNit] = useState(false);
  const [cedula, setCedula] = useState('');
  const [nit, setNit] = useState('');
  const [nitDv, setNitDv] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxRegime, setTaxRegime] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const deliveryCity = BOGOTA; // deliveries are only made in Bogotá
  const [deliveryComplement, setDeliveryComplement] = useState('');
  const [deliveryPlace, setDeliveryPlace] = useState<PlacePick | null>(null);
  const [billingAddress, setBillingAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const applyAddress = (a: SavedAddress) => {
    setSelectedAddressId(a.id);
    setCustomerName(a.recipientName);
    setCustomerPhone(a.phone);
    setDeliveryAddress(a.address);
    setDeliveryComplement(a.complement ?? '');
    setDeliveryPlace(typeof a.lat === 'number' && typeof a.lng === 'number' ? { address: a.address, lat: a.lat, lng: a.lng, placeId: a.placeId ?? '' } : null);
    setFormErrors(prev => ({ ...prev, customerName: '', customerPhone: '', deliveryAddress: '' }));
  };

  useEffect(() => {
    if (user?.email) setCustomerEmail(prev => prev || user.email!);
    if (addressPicked.current || savedAddresses.length === 0) return;
    addressPicked.current = true;
    applyAddress(savedAddresses.find(a => a.isDefault) ?? savedAddresses[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, savedAddresses.length]);

  const billingPrefilled = React.useRef(false);
  useEffect(() => {
    const b = profile?.billing;
    if (!b || billingPrefilled.current) return;
    billingPrefilled.current = true;
    if (b.type === 'empresa') {
      setWantsNit(true); setNit(b.document); setNitDv(b.dv ?? ''); setBusinessName(b.businessName ?? '');
      setTaxRegime(b.taxRegime ?? ''); setBillingEmail(b.billingEmail ?? '');
    } else {
      setCedula(b.document);
    }
    if (b.address) setBillingAddress(b.address);
  }, [profile?.billing]);

  const isNewAddress = !!user && !!deliveryAddress.trim() && !hasAddress(savedAddresses, deliveryAddress, deliveryCity);

  const [completedOrder, setCompletedOrder] = useState<CustomOrder | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');

  const totalGrams = fruits.reduce((sum, f) => sum + (fruitGrams[f.id] || 0), 0);
  const subtotal = Object.entries(fruitGrams).reduce<number>((sum, [fruitId, grams]) => {
    const fruit = fruits.find(f => f.id === fruitId);
    const g = Number(grams) || 0;
    if (!fruit || g <= 0) return sum;
    const step = fruit.defaultGramUnit || 125;
    const units = Math.round(g / step);
    const unitPrice = fruit.standardPrice || (fruit.pricePerGram * step);
    return sum + (units * unitPrice);
  }, 0);
  // Pedido mínimo: 500g total. Envío base $6.000 COP.
  const meetsMinOrder = totalGrams >= 500;
  const deliveryFee = !meetsMinOrder || totalGrams === 0 ? 0 : 6000;
  const grandTotal = Math.max(0, subtotal + deliveryFee);

  const hasPackingError = fruits.some(f => {
    const step = f.defaultGramUnit || 125;
    const g = fruitGrams[f.id] || 0;
    const units = step > 0 ? Math.round(g / step) : 0;
    return (step === 125 || step === 250) && units > 0 && units % 2 !== 0;
  });

  const handleGramsChange = (fruitId: string, direction: 1 | -1) => {
    setFruitGrams(prev => {
      const current = prev[fruitId] || 0;
      const fruit = fruits.find(f => f.id === fruitId);
      const step = fruit?.defaultGramUnit || 125;
      // Los productos de 125g y 250g saltan automáticamente de 2 en 2 unidades (0, 2, 4, 6...)
      const unitMultiplier = (step === 125 || step === 250) ? 2 : 1;
      const currentUnits = step > 0 ? Math.round(current / step) : 0;
      
      let nextUnits = currentUnits + (direction * unitMultiplier);
      if (unitMultiplier === 2 && nextUnits % 2 !== 0) {
        nextUnits = direction > 0 ? Math.ceil(nextUnits / 2) * 2 : Math.floor(nextUnits / 2) * 2;
      }
      nextUnits = Math.max(0, nextUnits);
      return {
        ...prev,
        [fruitId]: nextUnits * step
      };
    });
  };

  const handleSetUnits = (fruitId: string, units: number) => {
    const fruit = fruits.find(f => f.id === fruitId);
    const step = fruit?.defaultGramUnit || 125;
    setFruitGrams(prev => ({
      ...prev,
      [fruitId]: Math.max(0, units) * step
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const packingErrors: string[] = [];
    fruits.forEach(f => {
      const g = fruitGrams[f.id] || 0;
      const step = f.defaultGramUnit || 125;
      const units = step > 0 ? Math.round(g / step) : 0;
      if ((step === 125 || step === 250) && units > 0 && units % 2 !== 0) {
        packingErrors.push(`${f.name} (llevas ${units} ${units === 1 ? 'estuche' : 'estuches'}, debe ser múltiplo de 2: ej. 2, 4, 6)`);
      }
    });

    if (totalGrams === 0) {
      errors.fruits = 'Selecciona al menos un formato de arándanos (pedido mínimo total: 500g).';
    } else if (totalGrams < 500) {
      errors.fruits = `El pedido mínimo total son 500g. Llevas ${totalGrams}g (faltan ${500 - totalGrams}g para completar el mínimo).`;
    } else if (packingErrors.length > 0) {
      errors.fruits = `Por motivos de empaque y logística: ${packingErrors.join(' · ')}. Por favor, ajusta a múltiplos de 2 para poder empacar tu envío.`;
    }
    if (!customerName.trim()) errors.customerName = 'Ingresa tu nombre.';
    if (!customerPhone.trim() || customerPhone.trim().length < 7) errors.customerPhone = 'Ingresa un WhatsApp válido.';
    if (!deliveryAddress.trim()) errors.deliveryAddress = 'Ingresa la dirección de entrega.';
    if (customerEmail.trim() && !/^\S+@\S+\.\S+$/.test(customerEmail.trim())) errors.customerEmail = 'Revisa el correo.';
    if (wantsNit) {
      if (!/^\d{5,12}$/.test(nit.trim())) errors.nit = 'Ingresa el NIT sin puntos ni dígito de verificación.';
      if (!/^\d$/.test(nitDv.trim())) errors.nitDv = 'Dígito de verificación (1 número).';
      if (!businessName.trim()) errors.businessName = 'Ingresa la razón social.';
      if (!taxRegime.trim()) errors.taxRegime = 'Elige el régimen fiscal.';
      if (!/^\S+@\S+\.\S+$/.test(billingEmail.trim())) errors.billingEmail = 'Ingresa un correo de facturación válido.';
    } else if (cedula.trim() && !/^\d{5,12}$/.test(cedula.trim())) {
      errors.cedula = 'La cédula debe tener solo números.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (viaWhatsApp = false) => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSaveError('');

    const fruitSelections = Object.entries(fruitGrams)
      .filter(([, grams]) => Number(grams) > 0)
      .map(([fruitId, grams]) => {
        const g = Number(grams);
        const fruit = fruits.find(f => f.id === fruitId);
        const step = fruit?.defaultGramUnit || 125;
        const units = Math.round(g / step);
        return { fruitId, grams: g, units };
      });

    const invoiceAddress = billingAddress.trim() || deliveryAddress.trim();
    const billing: BillingData | null = wantsNit
      ? { type: 'empresa', document: nit.trim(), dv: nitDv.trim(), businessName: businessName.trim(), taxRegime: taxRegime.trim(), billingEmail: billingEmail.trim(), address: invoiceAddress }
      : cedula.trim() ? { type: 'persona', document: cedula.trim(), address: invoiceAddress } : null;
    const mapsUrl = mapsLink({ lat: deliveryPlace?.lat, lng: deliveryPlace?.lng, placeId: deliveryPlace?.placeId, address: deliveryAddress });

    let orderId = 'FP-' + Math.floor(10000 + Math.random() * 90000);

    try {
      const saved = await createOrder({
        customerName,
        customerEmail: customerEmail.trim() || (user?.email ?? ''),
        userId: user?.uid,
        billing: billing ?? undefined,
        customerPhone,
        shippingAddress: deliveryAddress.trim(),
        shippingCity: deliveryCity,
        shippingComplement: deliveryComplement.trim(),
        shippingLat: deliveryPlace?.lat,
        shippingLng: deliveryPlace?.lng,
        shippingMapsUrl: mapsUrl,
        deliveryDate,
        deliveryTimeSlot: 'morning',
        notes: '',
        packaging: 'standard',
        items: fruitSelections.map(item => {
          const fruit = fruits.find(f => f.id === item.fruitId);
          const step = fruit?.defaultGramUnit || 125;
          const lineCost = item.units * (fruit?.standardPrice || 0);
          return {
            name: fruit?.name || item.fruitId,
            quantityText: `${item.units} ${item.units === 1 ? 'estuche' : 'estuches'} (${item.grams}g)`,
            price: lineCost,
          };
        }),
        subtotal,
        deliveryFee,
        total: grandTotal,
        paymentMethod: 'nequi_daviplata',
      });
      orderId = saved.orderNumber;
      if (user && saveNewAddress && isNewAddress && savedAddresses.length < MAX_ADDRESSES) {
        try {
          await saveAddresses(user.uid, [
            ...savedAddresses,
            {
              id: newAddressId(), label: savedAddresses.length ? 'Otra' : 'Casa', recipientName: customerName.trim(), phone: customerPhone.trim(),
              address: deliveryAddress.trim(), complement: deliveryComplement.trim(), city: BOGOTA, notes: '', timeSlot: 'Mañana 8am–1pm',
              ...(deliveryPlace ? { lat: deliveryPlace.lat, lng: deliveryPlace.lng, placeId: deliveryPlace.placeId } : {}),
              isDefault: savedAddresses.length === 0, createdAt: new Date().toISOString(),
            },
          ]);
        } catch { /* the order is already saved; the address can be added later from Mi cuenta */ }
      }
    } catch (err) {
      // No bloqueamos el pedido si Firestore falla (ej. reglas no desplegadas todavía);
      // el cliente puede seguir confirmando por WhatsApp con un número local.
      setSaveError(
        err instanceof Error
          ? `El pedido no se pudo guardar en el sistema (${err.message}), pero puedes confirmarlo por WhatsApp igual.`
          : 'El pedido no se pudo guardar en el sistema, pero puedes confirmarlo por WhatsApp igual.'
      );
    }

    const newOrder: CustomOrder = {
      id: orderId,
      packagingId: 'standard',
      fruits: fruitSelections.map(f => ({ fruitId: f.fruitId, grams: f.grams })),
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
      packagingCost: 0,
      addOnsCost: 0,
      discount: 0,
      deliveryFee,
      total: grandTotal,
      createdAt: new Date().toISOString()
    };

    setCompletedOrder(newOrder);
    onOrderCompleted?.(newOrder);
    setIsSubmitting(false);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (viaWhatsApp) {
      const fruitsSummary = fruitSelections
        .map(item => {
          const fruit = fruits.find(f => f.id === item.fruitId);
          const step = fruit?.defaultGramUnit || 125;
          const units = Math.round(item.grams / step);
          const lineCost = units * (fruit?.standardPrice || 0);
          return `• ${fruit?.name || item.fruitId}: ${units} ${units === 1 ? 'estuche' : 'estuches'} (${item.grams}g) - $${lineCost.toLocaleString('es-CO')} COP`;
        })
        .join('%0A');
      const msg =
        `*PEDIDO PERSONALIZADO - FRESH PICK*%0A%0A` +
        `*Orden:* ${orderId}%0A` +
        `*Cliente:* ${customerName}%0A` +
        `*Teléfono:* ${customerPhone}%0A` +
        `*Dirección:* ${deliveryAddress}${deliveryComplement.trim() ? ', ' + deliveryComplement.trim() : ''}, ${deliveryCity}%0A` +
        `*Mapa:* ${encodeURIComponent(mapsUrl)}%0A` +
        `*Fecha de entrega:* ${deliveryDate}%0A%0A` +
        `*Detalle de Arándanos (${totalGrams}g totales):*%0A${fruitsSummary}%0A%0A` +
        `*Subtotal:* $${subtotal.toLocaleString('es-CO')} COP%0A` +
        `*Envío:* $${deliveryFee.toLocaleString('es-CO')} COP%0A` +
        `*TOTAL:* $${grandTotal.toLocaleString('es-CO')} COP%0A%0A` +
        `Confirmo pedido. Realizaré pago por transferencia o Bre-B @9010401617. ¡Gracias!`;
      window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
    }
  };

  if (completedOrder) {
    return (
      <section id="pedidos-personalizados" className="py-12 sm:py-16 bg-stone-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-[#DFCEE6] p-8">
            <CheckCircle2 className="w-12 h-12 text-[#7B4382] mx-auto mb-3" />
            <h3 className="text-2xl font-black text-[#2F183C]">Orden #{completedOrder.id}</h3>
            <p className="text-stone-600 mt-2">Gracias, {completedOrder.customerName}. Tu pedido fue registrado.</p>
            <p className="text-xl font-black text-[#2F183C] mt-4">
              ${completedOrder.total.toLocaleString('es-CO')} COP
            </p>
            {saveError && (
              <p className="mt-3 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-3 py-2 text-left flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
              </p>
            )}
            <a
              href={`https://wa.me/${WA}?text=Hola%20Fresh%20Pick!%20Confirmo%20pedido%20%23${completedOrder.id}%20a%20nombre%20de%20${encodeURIComponent(completedOrder.customerName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2F183C] text-white font-bold hover:bg-[#432356] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#DDA83A]" />
              Confirmar por WhatsApp
            </a>
            <button
              onClick={() => setCompletedOrder(null)}
              className="mt-3 block mx-auto text-sm text-[#7B4382] underline font-medium cursor-pointer"
            >
              Armar otro pedido
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pedidos-personalizados" className="py-12 sm:py-16 bg-[#F7F5F0]/80 backdrop-blur-[2px] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#7B4382]" />
            Pedidos personalizados
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2F183C] tracking-tight font-display">
            Arma tu Pedido de Arándanos en Línea
          </h2>
          <p className="mt-3 text-stone-700">
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
            <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 space-y-4 shadow-sm">
              <div className="border-b border-stone-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-lg text-[#2F183C] flex items-center gap-2 font-display">
                    <span className="text-xl">📦</span>
                    <span>1. Formatos y condiciones de envío</span>
                  </h3>
                  {totalGrams < 500 ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 w-fit">
                      Pedido mín. total: 500g ({totalGrams > 0 ? `faltan ${500 - totalGrams}g` : '0g actual'})
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] inline-flex items-center gap-1 w-fit">
                      ✓ Mínimo alcanzado ({totalGrams}g)
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  El pedido mínimo total es de <strong>500g</strong>. Puedes alcanzar este peso combinando los formatos como desees. Por motivos de logística y seguridad en el empaque, aplican las siguientes reglas:
                </p>

                <div className="mt-3 p-3 bg-[#FAF7F0] border border-[#EADBEE] rounded-xl text-xs space-y-1.5 text-stone-700">
                  <div className="flex items-start gap-2">
                    <span className="text-[#DDA83A] font-bold">•</span>
                    <span><strong>Estuches de 125g:</strong> Se deben pedir obligatoriamente en múltiplos de 2 (ej: 2, 4, 6 unidades).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#DDA83A] font-bold">•</span>
                    <span><strong>Estuches de 250g:</strong> Se deben pedir obligatoriamente en múltiplos de 2 (ej: 2, 4, 6 unidades).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#7B4382] font-bold">•</span>
                    <span><strong>Estuches de 500g:</strong> Se pueden pedir desde 1 unidad en adelante.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {fruits.map(fruit => {
                  const step = fruit.defaultGramUnit || 125;
                  const g = fruitGrams[fruit.id] || 0;
                  const units = step > 0 ? Math.round(g / step) : 0;
                  const unitPrice = fruit.standardPrice || (fruit.pricePerGram * step);
                  const lineTotal = units * unitPrice;
                  const isMultiOfTwo = step === 125 || step === 250;
                  const isOdd = isMultiOfTwo && units > 0 && units % 2 !== 0;

                  return (
                    <div
                      key={fruit.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                        isOdd
                          ? 'bg-red-50/50 border-red-300 shadow-xs'
                          : g > 0
                          ? 'bg-[#F5ECF9]/60 border-[#DFCEE6] shadow-xs'
                          : 'bg-[#FAF7F0] border-[#EADBEE] hover:border-[#DFCEE6]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-[#2F183C]">{fruit.name}</p>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#DFCEE6]/50 text-[#2F183C]">
                            Presentación: {fruit.presentation}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 mt-1">
                          Precio: <strong>${unitPrice.toLocaleString('es-CO')} COP c/u</strong>
                        </p>
                        {step === 500 ? (
                          <p className="text-[11px] font-medium text-[#7B4382] mt-1 flex items-center gap-1">
                            ✨ ¡Con 1 solo estuche completas el pedido mínimo total!
                          </p>
                        ) : (
                          <p className="text-[11px] font-medium text-amber-800 mt-1 flex items-center gap-1">
                            ⚠️ Nota de empaque: Solo disponible en múltiplos de 2 unidades.
                          </p>
                        )}
                        {isOdd && (
                          <div className="mt-2 p-2 rounded-lg bg-red-100/70 border border-red-200 text-xs text-red-800 flex items-center justify-between gap-2">
                            <span>(Por favor, ajusta a {units < 2 ? 2 : units + 1} unidades para poder empacar tu envío)</span>
                            <button
                              type="button"
                              onClick={() => handleSetUnits(fruit.id, units < 2 ? 2 : units + 1)}
                              className="px-2.5 py-1 bg-red-700 text-white rounded-md font-bold text-[11px] hover:bg-red-800 cursor-pointer shrink-0"
                            >
                              Ajustar
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                        {g > 0 && (
                          <div className="text-right mr-1">
                            <span className="text-xs font-bold text-[#2F183C] block">
                              ${lineTotal.toLocaleString('es-CO')} COP
                            </span>
                            <span className="text-[11px] text-stone-500">
                              {units} {units === 1 ? 'estuche' : 'estuches'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-white border border-[#EADBEE] rounded-lg p-1 shadow-xs">
                          <button
                            type="button"
                            disabled={g === 0}
                            onClick={() => handleGramsChange(fruit.id, -1)}
                            className="w-8 h-8 rounded-md border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label={`Quitar estuches de ${fruit.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="min-w-[4.5rem] px-1 text-center">
                            <span className="text-sm font-black text-[#2F183C] block leading-tight">
                              {units} {units === 1 ? 'estuche' : 'estuches'}
                            </span>
                            <span className="text-[10px] text-[#7B4382] font-semibold block leading-tight">
                              {g}g
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGramsChange(fruit.id, 1)}
                            className="w-8 h-8 rounded-md bg-[#2F183C] text-white flex items-center justify-center hover:bg-[#432356] transition-colors cursor-pointer"
                            aria-label={`Agregar estuches de ${fruit.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 space-y-3 shadow-sm">
              <h3 className="font-bold text-lg text-[#2F183C] font-display">2. Datos de entrega</h3>
              {user && savedAddresses.length > 0 && (
                <div className="space-y-2" role="radiogroup" aria-label="Dirección de entrega">
                  <p className="text-xs font-semibold text-stone-500">¿A cuál de tus direcciones lo enviamos?</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {savedAddresses.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        role="radio"
                        aria-checked={selectedAddressId === a.id}
                        onClick={() => applyAddress(a)}
                        className={`text-left rounded-xl border p-3 text-sm transition-colors ${selectedAddressId === a.id ? 'border-[#2F183C] bg-[#F5ECF9] ring-1 ring-[#2F183C]' : 'border-[#EADBEE] bg-white hover:bg-[#FAF7F0]'}`}
                      >
                        <span className="font-bold text-[#2F183C]">{a.label}{a.isDefault ? ' · principal' : ''}</span>
                        <span className="block text-stone-700">{a.address}</span>
                        <span className="block text-xs text-stone-500">{a.city} · {a.recipientName}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedAddressId === ''}
                      onClick={() => { setSelectedAddressId(''); setDeliveryAddress(''); }}
                      className={`text-left rounded-xl border border-dashed p-3 text-sm font-semibold ${selectedAddressId === '' ? 'border-[#2F183C] bg-[#F5ECF9] text-[#2F183C]' : 'border-[#DFCEE6] text-[#7B4382] hover:bg-[#FAF7F0]'}`}
                    >
                      + Enviar a otra dirección
                    </button>
                  </div>
                </div>
              )}
              {!user && (
                <p className="text-xs text-stone-500">
                  ¿Ya tienes cuenta? <a href="/panel" className="font-semibold text-[#7B4382] underline">Ingresa</a> para usar tus direcciones guardadas.
                </p>
              )}
              <input
                className={`w-full border ${formErrors.customerName ? 'border-red-400' : 'border-stone-300'} rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none`}
                placeholder="Nombre completo"
                value={customerName}
                onChange={e => { setCustomerName(e.target.value); setFormErrors(prev => ({ ...prev, customerName: '' })); }}
              />
              {formErrors.customerName && <p className="text-xs text-red-600">{formErrors.customerName}</p>}
              <input
                className={`w-full border ${formErrors.customerPhone ? 'border-red-400' : 'border-stone-300'} rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none`}
                placeholder="WhatsApp (ej. 317 893 1026)"
                value={customerPhone}
                onChange={e => { setCustomerPhone(e.target.value); setFormErrors(prev => ({ ...prev, customerPhone: '' })); }}
              />
              {formErrors.customerPhone && <p className="text-xs text-red-600">{formErrors.customerPhone}</p>}
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                placeholder="Correo (para tu factura y seguimiento)"
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
              {formErrors.customerEmail && <p className="text-xs text-red-600">{formErrors.customerEmail}</p>}
              <p className="text-xs text-stone-500 px-1">📍 Ciudad: <span className="font-semibold text-[#2F183C]">{BOGOTA}</span> · solo entregamos en Bogotá</p>
              <AddressField
                value={deliveryAddress}
                onChange={text => { setDeliveryAddress(text); setFormErrors(prev => ({ ...prev, deliveryAddress: '' })); }}
                place={deliveryPlace}
                onPlace={setDeliveryPlace}
                invalid={!!formErrors.deliveryAddress}
              />
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                placeholder="Apto, torre, casa u oficina (opcional)"
                value={deliveryComplement}
                onChange={e => setDeliveryComplement(e.target.value)}
              />
              {formErrors.deliveryAddress && <p className="text-xs text-red-600">{formErrors.deliveryAddress}</p>}
              {isNewAddress && savedAddresses.length < MAX_ADDRESSES && (
                <label className="flex items-center gap-2 text-xs font-semibold text-[#2F183C] cursor-pointer">
                  <input type="checkbox" checked={saveNewAddress} onChange={e => setSaveNewAddress(e.target.checked)} />
                  Guardar esta dirección en mi cuenta para próximos pedidos
                </label>
              )}
              <div className="rounded-xl bg-[#FAF7F0] border border-[#EADBEE] p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#2F183C] cursor-pointer">
                  <input type="checkbox" checked={wantsNit} onChange={e => setWantsNit(e.target.checked)} />
                  Necesito factura a nombre de una empresa (NIT)
                </label>
                {!wantsNit ? (
                  <>
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder="Cédula para la factura (opcional)"
                    inputMode="numeric"
                    value={cedula}
                    onChange={e => setCedula(e.target.value)}
                  />
                  {formErrors.cedula && <p className="text-xs text-red-600">{formErrors.cedula}</p>}
                  </>
                ) : (
                  <>
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder="Razón social"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                  />
                  {formErrors.businessName && <p className="text-xs text-red-600">{formErrors.businessName}</p>}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder="NIT (sin DV)"
                    inputMode="numeric"
                    value={nit}
                    onChange={e => setNit(e.target.value)}
                  />
                    </div>
                    <div>
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder="DV"
                    inputMode="numeric"
                    maxLength={1}
                    value={nitDv}
                    onChange={e => setNitDv(e.target.value)}
                  />
                    </div>
                  </div>
                  {formErrors.nit && <p className="text-xs text-red-600">{formErrors.nit}</p>}
                  {formErrors.nitDv && <p className="text-xs text-red-600">{formErrors.nitDv}</p>}
                  <select
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm bg-white focus:border-[#7B4382] outline-none"
                    value={taxRegime}
                    onChange={e => setTaxRegime(e.target.value)}
                  >
                    <option value="">Régimen fiscal</option>
                    <option value="Responsable de IVA">Responsable de IVA</option>
                    <option value="No responsable de IVA">No responsable de IVA</option>
                    <option value="Régimen simple de tributación">Régimen simple de tributación</option>
                  </select>
                  {formErrors.taxRegime && <p className="text-xs text-red-600">{formErrors.taxRegime}</p>}
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder="Correo de facturación"
                    type="email"
                    value={billingEmail}
                    onChange={e => setBillingEmail(e.target.value)}
                  />
                  {formErrors.billingEmail && <p className="text-xs text-red-600">{formErrors.billingEmail}</p>}
                  </>
                )}
                <input
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                  placeholder="Dirección de facturación (si es distinta a la de entrega)"
                  value={billingAddress}
                  onChange={e => setBillingAddress(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7B4382]" />
                <input
                  type="date"
                  className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-2xl border border-[#EADBEE] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-lg text-[#2F183C] flex items-center gap-2 font-display">
                  <span className="text-xl">🛒</span>
                  <span>Tu Carrito</span>
                </h3>
                {meetsMinOrder && !hasPackingError ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]">
                    ✓ Válido para envío
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Mín. 500g
                  </span>
                )}
              </div>

              {/* Pedido mín. total indicator */}
              {totalGrams < 500 ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>
                    <strong>Pedido mín. total: 500g</strong> (Faltan <strong>{500 - totalGrams}g</strong> para completar el mínimo)
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#F5ECF9] border border-[#DFCEE6] text-[#2F183C] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7B4382]" />
                  <span>
                    <strong>✓ Pedido mínimo total completado</strong> ({totalGrams}g seleccionados)
                  </span>
                </div>
              )}

              {/* Items according to user specification */}
              <div className="space-y-2.5 text-xs">
                {fruits.map(f => {
                  const step = f.defaultGramUnit || 125;
                  const g = fruitGrams[f.id] || 0;
                  const units = step > 0 ? Math.round(g / step) : 0;
                  const unitPrice = f.standardPrice || (f.pricePerGram * step);
                  const lineCost = units * unitPrice;
                  const isMultiOfTwo = step === 125 || step === 250;
                  const isOdd = isMultiOfTwo && units > 0 && units % 2 !== 0;

                  return (
                    <div
                      key={f.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isOdd
                          ? 'bg-red-50/70 border-red-300'
                          : units > 0
                          ? 'bg-[#FAF7F0] border-[#EADBEE]'
                          : 'bg-white border-stone-100 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-[#2F183C] text-xs">{f.name}</p>
                        <span className="font-bold text-[#2F183C]">${lineCost.toLocaleString('es-CO')} COP</span>
                      </div>
                      <div className="mt-1.5 space-y-0.5 text-[11px] text-stone-600">
                        <p>• Presentación: {f.presentation}</p>
                        <p>• Precio: ${unitPrice.toLocaleString('es-CO')} COP c/u</p>
                        {step === 500 ? (
                          <p className="text-[#7B4382] font-medium">• ✨ ¡Con 1 solo estuche completas el pedido mínimo total!</p>
                        ) : (
                          <p className="text-amber-800 font-medium">• ⚠️ Nota de empaque: Solo disponible en múltiplos de 2 unidades.</p>
                        )}
                        <p className={`font-semibold ${isOdd ? 'text-red-700' : 'text-[#2F183C]'} pt-0.5`}>
                          • Tu selección: {units} {units === 1 ? 'estuche' : 'estuches'} ({g}g) — ${lineCost.toLocaleString('es-CO')} COP
                          {isOdd && (
                            <span className="text-red-700 font-bold block mt-0.5">
                              (Por favor, ajusta a {units < 2 ? 2 : units + 1} unidades para poder empacar tu envío)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Peso total:</span>
                  <strong className="text-[#2F183C]">{totalGrams}g</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#2F183C]">${subtotal.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Envío:</span>
                  <span>{deliveryFee === 0 ? (totalGrams === 0 ? '$0 COP' : 'Calculando...') : `$${deliveryFee.toLocaleString('es-CO')} COP`}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                  <span className="font-bold text-[#2F183C]">Total estimado:</span>
                  <span className="text-2xl font-black text-[#2F183C]">${grandTotal.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              {Object.values(formErrors).some(Boolean) && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" /> Falta completar para guardar tu pedido:</p>
                  <ul className="list-disc pl-6 space-y-0.5">
                    {Object.values(formErrors).filter(Boolean).map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                  <p className="text-red-700/80">Los datos de entrega están en el paso 2, a la izquierda.</p>
                </div>
              )}

              {hasPackingError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Por favor ajusta los estuches de 125g y 250g a múltiplos de 2 unidades para poder empacar tu envío.</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSubmitOrder(true)}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#2F183C] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#432356] transition-colors cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 text-[#DDA83A]" />}
                Pedir por WhatsApp
              </button>
              <button
                type="button"
                onClick={() => handleSubmitOrder(false)}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl border border-[#DFCEE6] text-[#2F183C] font-bold text-sm hover:bg-[#F5ECF9] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar pedido en la web'}
              </button>
              <p className="text-[11px] text-stone-400 text-center">WhatsApp: +57 317 893 1026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
