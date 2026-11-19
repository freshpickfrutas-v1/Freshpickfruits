import { track } from '../lib/analytics';
import { dateLocale, useLang, useT } from '../lib/i18n';
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FruitItem, PackagingOption, AddOnItem, CustomOrder, BillingData, SavedAddress } from '../types';
import { createOrder } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { saveAddresses, hasAddress, newAddressId, MAX_ADDRESSES } from '../lib/addresses';
import { BOGOTA, PlacePick, mapsLink } from '../lib/maps';
import { AddressField } from './AddressField';
import { OnlinePayButton } from './OnlinePayButton';
import { ONLINE_GATEWAY, GATEWAY_NAME } from '../lib/gateway';
import {
  PayChoice, SHIPPING_FEE, COMMISSION_RATE, onlineCommission,
  maxUnitsFor, earliestDeliveryDate, formatDeliveryDay,
} from '../lib/pricing';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';

const WA = '573178931026';
const id_in = (o: Record<string, number>, id: string) => Object.prototype.hasOwnProperty.call(o, id);

interface WhatsAppOrder {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  complement: string;
  city: string;
  mapsUrl: string;
  deliveryDate: string;
  lines: string[];
  totalGrams: number;
  subtotal: number;
  deliveryFee: number;
  commission: number;
  total: number;
  billing: BillingData | null;
}

// El pago en línea solo se ofrece si hay una pasarela configurada en el despliegue (Bold o Wompi); sin eso solo hay transferencia o Bre-B por WhatsApp.
const ONLINE_PAYMENTS = ONLINE_GATEWAY !== null;
const COMMISSION_PCT = ONLINE_GATEWAY ? COMMISSION_RATE[ONLINE_GATEWAY] * 100 : 0;
const copEs = (n: number) => `$${n.toLocaleString('es-CO')} COP`;

/** The complete order as one WhatsApp message: customer, delivery, invoice data, products, totals and payment. */
function buildWhatsAppText(o: WhatsAppOrder): string {
  const when = o.deliveryDate
    ? new Date(o.deliveryDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Por coordinar';
  const b = o.billing;
  const invoice = !b
    ? ['Sin datos de factura (el cliente no los ingresó)']
    : b.type === 'empresa'
      ? [
          'Tipo: Empresa (factura con NIT)',
          `Razón social: ${b.businessName ?? ''}`,
          `NIT: ${b.document}${b.dv ? '-' + b.dv : ''}`,
          `Régimen fiscal: ${b.taxRegime ?? ''}`,
          `Correo de facturación: ${b.billingEmail ?? ''}`,
          `Dirección de facturación: ${b.address ?? o.address}`,
        ]
      : [
          'Tipo: Persona natural',
          `Cédula: ${b.document}`,
          `Dirección de facturación: ${b.address ?? o.address}`,
          ...(b.billingEmail ? [`Correo de facturación: ${b.billingEmail}`] : []),
        ];
  return [
    '*PEDIDO - FRESH PICK*',
    `*Orden:* ${o.orderId}`,
    '',
    '*CLIENTE*',
    `Nombre: ${o.name}`,
    `WhatsApp: ${o.phone}`,
    `Correo: ${o.email || 'No indicado'}`,
    '',
    '*ENTREGA*',
    `Dirección: ${o.address}${o.complement ? ', ' + o.complement : ''}`,
    `Ciudad: ${o.city}`,
    `Ubicación en mapa: ${o.mapsUrl}`,
    `Primera fecha de entrega disponible: ${when} (según dirección y ruta del domiciliario)`,
    'Horario: 8:00 a.m. a 3:00 p.m.',
    '',
    '*FACTURACIÓN*',
    ...invoice,
    '',
    `*PRODUCTOS (${o.totalGrams}g en total)*`,
    ...o.lines,
    '',
    `Subtotal: ${copEs(o.subtotal)}`,
    `Envío: ${copEs(o.deliveryFee)}`,
    ...(o.commission > 0 ? [`Comisión pago en línea (${COMMISSION_PCT}%): ${copEs(o.commission)}`] : []),
    `*TOTAL: ${copEs(o.total)}*`,
    '',
    '*FORMA DE PAGO*',
    o.commission > 0
      ? 'Pago en línea (la pasarela me enviará el enlace de pago).'
      : 'Transferencia bancaria o Bre-B @9010401617. Enviaré el comprobante de pago por este chat.',
    '',
    'Confirmo mi pedido. ¡Gracias!',
  ].join('\n');
}

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
  const t = useT();
  const lang = useLang();
  const loc = dateLocale(lang);
  const cop = (n: number) => (lang === 'en' ? `COP $${n.toLocaleString(loc)}` : `$${n.toLocaleString(loc)} COP`);
  const unitWord = (n: number) => (lang === 'en' ? (n === 1 ? 'box' : 'boxes') : (n === 1 ? 'estuche' : 'estuches'));
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
  const cart = useCart();

  // "Pagar en línea" desde el carrito: pasa los estuches al formulario de pedido.
  useEffect(() => {
    if (!cart.pendingCheckout) return;
    setFruitGrams(prev => {
      const next = Object.fromEntries(Object.keys(prev).map(id => [id, 0])) as Record<string, number>;
      cart.items.forEach(i => {
        if (id_in(next, i.fruit.id)) next[i.fruit.id] = (i.fruit.defaultGramUnit || 125) * i.quantity;
      });
      return next;
    });
    cart.consumeCheckout();
  }, [cart.pendingCheckout]);
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
  // El cliente no elige el día: la entrega es martes o miércoles, desde 8 días después, según su dirección y la ruta del domiciliario.
  const deliveryDate = earliestDeliveryDate();
  const [payChoice, setPayChoice] = useState<PayChoice>('transferencia');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptData, setAcceptData] = useState(false);
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
    if (user?.displayName) setCustomerName(prev => prev || user.displayName!);
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

  // Al confirmar, el formulario largo se cambia por la tarjeta del pedido y la página se acorta: se lleva la vista a esa tarjeta.
  useEffect(() => {
    if (!completedOrder) return;
    document.getElementById('pedidos-personalizados')?.scrollIntoView({ block: 'start' });
  }, [completedOrder]);
  const [completedMessage, setCompletedMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedOrderDocId, setSavedOrderDocId] = useState('');

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
  // Pedido mínimo: 500g total. Envío siempre $7.000; el pago en línea suma además la comisión de la pasarela.
  const meetsMinOrder = totalGrams >= 500;
  const online = payChoice === 'tarjeta';
  const deliveryFee = !meetsMinOrder || totalGrams === 0 ? 0 : SHIPPING_FEE;
  const commission = online && deliveryFee > 0 ? onlineCommission(subtotal + deliveryFee, ONLINE_GATEWAY ?? 'wompi') : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + commission);

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
      nextUnits = Math.min(maxUnitsFor(step), Math.max(0, nextUnits));
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
      [fruitId]: Math.min(maxUnitsFor(step), Math.max(0, units)) * step
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
        packingErrors.push(t(`${f.name} (llevas ${units} ${units === 1 ? 'estuche' : 'estuches'}, debe ser múltiplo de 2: ej. 2, 4, 6)`, `${f.name} (you have ${units} ${unitWord(units)}, must be a multiple of 2: e.g. 2, 4, 6)`));
      }
    });

    if (totalGrams === 0) {
      errors.fruits = t('Selecciona al menos un formato de arándanos (pedido mínimo total: 500g).', 'Select at least one blueberry size (minimum total order: 500 g).');
    } else if (totalGrams < 500) {
      errors.fruits = t(`El pedido mínimo total son 500g. Llevas ${totalGrams}g (faltan ${500 - totalGrams}g para completar el mínimo).`, `The minimum total order is 500 g. You have ${totalGrams} g (${500 - totalGrams} g short of the minimum).`);
    } else if (packingErrors.length > 0) {
      errors.fruits = t(`Por motivos de empaque y logística: ${packingErrors.join(' · ')}. Por favor, ajusta a múltiplos de 2 para poder empacar tu envío.`, `For packing and logistics reasons: ${packingErrors.join(' · ')}. Please adjust to multiples of 2 so we can pack your order.`);
    }
    if (!acceptTerms) errors.acceptTerms = t('Debes aceptar las condiciones de entrega y los términos para continuar.', 'You must accept the delivery conditions and the terms to continue.');
    if (!acceptData) errors.acceptData = t('Debes autorizar el tratamiento de tus datos personales para continuar.', 'You must authorize the processing of your personal data to continue.');
    if (!customerName.trim()) errors.customerName = t('Ingresa tu nombre.', 'Enter your name.');
    if (!customerPhone.trim() || customerPhone.trim().length < 7) errors.customerPhone = t('Ingresa un WhatsApp válido.', 'Enter a valid WhatsApp number.');
    if (!deliveryAddress.trim()) errors.deliveryAddress = t('Ingresa la dirección de entrega.', 'Enter the delivery address.');
    if (customerEmail.trim() && !/^\S+@\S+\.\S+$/.test(customerEmail.trim())) errors.customerEmail = t('Revisa el correo.', 'Check the email address.');
    if (wantsNit) {
      if (!/^\d{5,12}$/.test(nit.trim())) errors.nit = t('Ingresa el NIT sin puntos ni dígito de verificación.', 'Enter the NIT (tax ID) without dots or check digit.');
      if (!/^\d$/.test(nitDv.trim())) errors.nitDv = t('Dígito de verificación (1 número).', 'Check digit (1 number).');
      if (!businessName.trim()) errors.businessName = t('Ingresa la razón social.', 'Enter the company name.');
      if (!taxRegime.trim()) errors.taxRegime = t('Elige el régimen fiscal.', 'Choose the tax regime.');
      if (!/^\S+@\S+\.\S+$/.test(billingEmail.trim())) errors.billingEmail = t('Ingresa un correo de facturación válido.', 'Enter a valid billing email.');
    } else if (cedula.trim() && !/^\d{5,12}$/.test(cedula.trim())) {
      errors.cedula = t('La cédula debe tener solo números.', 'The ID number must contain digits only.');
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
            fruitId: item.fruitId,
            units: item.units,
          };
        }),
        subtotal,
        deliveryFee,
        total: grandTotal,
        paymentMethod: online ? 'tarjeta' : 'transferencia',
      });
      orderId = saved.orderNumber;
      setSavedOrderDocId(saved.id);
      // Pedido creado = contacto de venta; la compra real se mide en /gracias, cuando Wompi devuelve al cliente tras pagar.
      track('lead', { id: saved.orderNumber, value: grandTotal });
      try { sessionStorage.setItem('fp-last-order', JSON.stringify({ id: saved.orderNumber, value: grandTotal, online })); } catch { /* sin almacenamiento */ }
      // El servidor fija el total definitivo; si falla, la firma de pago lo vuelve a calcular antes de cobrar.
      fetch('/api/orders/recalcular', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: saved.id }) }).catch(() => {});
      cart.clearCart();
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
          ? t(`El pedido no se pudo guardar en el sistema (${err.message}), pero puedes confirmarlo por WhatsApp igual.`, `The order could not be saved in the system (${err.message}), but you can still confirm it on WhatsApp.`)
          : t('El pedido no se pudo guardar en el sistema, pero puedes confirmarlo por WhatsApp igual.', 'The order could not be saved in the system, but you can still confirm it on WhatsApp.')
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
      paymentMethod: online ? 'card' : 'transfer',
      subtotal,
      packagingCost: 0,
      addOnsCost: 0,
      discount: 0,
      deliveryFee,
      total: grandTotal,
      createdAt: new Date().toISOString()
    };

    const waText = buildWhatsAppText({
      orderId,
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim() || (user?.email ?? ''),
      address: deliveryAddress.trim(),
      complement: deliveryComplement.trim(),
      city: deliveryCity,
      mapsUrl,
      deliveryDate,
      lines: fruitSelections.map(item => {
        const fruit = fruits.find(f => f.id === item.fruitId);
        const step = fruit?.defaultGramUnit || 125;
        const units = Math.round(item.grams / step);
        const lineCost = units * (fruit?.standardPrice || 0);
        return `• ${fruit?.name || item.fruitId}: ${units} ${units === 1 ? 'estuche' : 'estuches'} (${item.grams}g) - ${copEs(lineCost)}`;
      }),
      totalGrams,
      subtotal,
      deliveryFee,
      commission,
      total: grandTotal,
      billing,
    });

    setCompletedMessage(waText);
    setCompletedOrder(newOrder);
    onOrderCompleted?.(newOrder);
    setIsSubmitting(false);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (viaWhatsApp) {
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  if (completedOrder) {
    return (
      <section id="pedidos-personalizados" className="py-12 sm:py-16 bg-stone-50 scroll-mt-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-[#DFCEE6] p-8">
            <CheckCircle2 className="w-12 h-12 text-[#7B4382] mx-auto mb-3" />
            <h3 className="text-2xl font-black text-[#2F183C]">{t('Orden', 'Order')} #{completedOrder.id}</h3>
            <p className="text-stone-600 mt-2">{t(`Gracias, ${completedOrder.customerName}. Tu pedido fue registrado.`, `Thank you, ${completedOrder.customerName}. Your order has been registered.`)}</p>
            <p className="text-xl font-black text-[#2F183C] mt-4">
              {cop(completedOrder.total)}
            </p>
            {saveError && (
              <p className="mt-3 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-3 py-2 text-left flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
              </p>
            )}
            <div className="mt-4 text-left text-xs bg-[#F5ECF9] border border-[#DFCEE6] rounded-xl px-4 py-3 text-[#2F183C] space-y-1">
              <p className="font-bold">{t('¡Gracias por tu compra en Fresh Pick!', 'Thank you for your purchase at Fresh Pick!')}</p>
              <p>{t(<>Despachamos los <strong>martes y miércoles</strong> (8:00 a.m. – 3:00 p.m.). La primera fecha disponible para tu pedido es el <strong className="capitalize">{formatDeliveryDay(completedOrder.deliveryDate, lang)}</strong>, de acuerdo a tu dirección y a la ruta del domiciliario.</>, <>We dispatch on <strong>Tuesdays and Wednesdays</strong> (8:00 a.m. – 3:00 p.m.). The first available date for your order is <strong className="capitalize">{formatDeliveryDay(completedOrder.deliveryDate, lang)}</strong>, depending on your address and the courier's route.</>)}</p>
              <p>{t('Te escribiremos por WhatsApp cuando tu pedido salga a ruta.', 'We will message you on WhatsApp when your order is on its way.')}</p>
            </div>
            {savedOrderDocId && completedOrder.paymentMethod === 'card' && (
              <OnlinePayButton
                orderId={savedOrderDocId}
                customer={{ name: completedOrder.customerName, email: customerEmail.trim() || (user?.email ?? ''), phone: completedOrder.customerPhone }}
              />
            )}
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent(completedMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2F183C] text-white font-bold hover:bg-[#432356] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#DDA83A]" />
              {t('Confirmar por WhatsApp', 'Confirm on WhatsApp')}
            </a>
            <button
              onClick={() => setCompletedOrder(null)}
              className="mt-3 block mx-auto text-sm text-[#7B4382] underline font-medium cursor-pointer"
            >
              {t('Armar otro pedido', 'Build another order')}
            </button>
            <p className="mt-4 text-xs text-stone-500">
              {t('¿Necesitas cambiar o cancelar tu pedido? Escríbenos por', 'Need to change or cancel your order? Message us on')}{' '}
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent(t(`Hola Fresh Pick, quiero modificar o cancelar mi pedido ${completedOrder.id}`, `Hello Fresh Pick, I would like to change or cancel my order ${completedOrder.id}`))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#7B4382] underline"
              >
                WhatsApp
              </a>.
            </p>
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
            {t('Pedidos personalizados', 'Custom orders')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2F183C] tracking-tight font-display">
            {t('Arma tu Pedido de Arándanos en Línea', 'Build Your Blueberry Order Online')}
          </h2>
          <p className="mt-3 text-stone-700">
            {t(`Elige 125g, 250g o 500g. Mínimo 500g. Entregas martes y miércoles (8:00 a.m. – 3:00 p.m.), mínimo 8 días después de hacer el pedido. Pagos por transferencia, Bre-B @9010401617${ONLINE_PAYMENTS ? ' o en línea' : ''}.`, `Choose 125 g, 250 g or 500 g. 500 g minimum. Deliveries on Tuesdays and Wednesdays (8:00 a.m. – 3:00 p.m.), at least 8 days after placing the order. Pay by bank transfer, Bre-B @9010401617${ONLINE_PAYMENTS ? ' or online' : ''}. Delivery in Bogotá only.`)}
          </p>
        </div>

        {Object.values(formErrors).some(Boolean) && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-sm flex gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <ul className="list-disc list-inside">
              {Object.values(formErrors).filter(Boolean).map((e, i) => (
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
                    <span>{t('1. Formatos y condiciones de envío', '1. Sizes and shipping conditions')}</span>
                  </h3>
                  {totalGrams < 500 ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 w-fit">
                      {t('Pedido mín. total: 500g', 'Min. total order: 500 g')} ({totalGrams > 0 ? t(`faltan ${500 - totalGrams}g`, `${500 - totalGrams} g to go`) : t('0g actual', '0 g now')})
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6] inline-flex items-center gap-1 w-fit">
                      {t('✓ Mínimo alcanzado', '✓ Minimum reached')} ({totalGrams}g)
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {t(<>El pedido mínimo total es de <strong>500g</strong>. Puedes alcanzar este peso combinando los formatos como desees. Por motivos de logística y seguridad en el empaque, aplican las siguientes reglas:</>, <>The minimum total order is <strong>500 g</strong>. You can reach it by combining sizes as you like. For logistics and packing safety, the following rules apply:</>)}
                </p>

                <div className="mt-3 p-3 bg-[#FAF7F0] border border-[#EADBEE] rounded-xl text-xs space-y-1.5 text-stone-700">
                  <div className="flex items-start gap-2">
                    <span className="text-[#DDA83A] font-bold">•</span>
                    <span>{t(<><strong>Estuches de 125g:</strong> Se deben pedir obligatoriamente en múltiplos de 2 (ej: 2, 4, 6 unidades).</>, <><strong>125 g boxes:</strong> must be ordered in multiples of 2 (e.g. 2, 4, 6 units).</>)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#DDA83A] font-bold">•</span>
                    <span>{t(<><strong>Estuches de 250g:</strong> Se deben pedir obligatoriamente en múltiplos de 2 (ej: 2, 4, 6 unidades).</>, <><strong>250 g boxes:</strong> must be ordered in multiples of 2 (e.g. 2, 4, 6 units).</>)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#7B4382] font-bold">•</span>
                    <span>{t(<><strong>Estuches de 500g:</strong> Se pueden pedir desde 1 unidad en adelante.</>, <><strong>500 g boxes:</strong> can be ordered from 1 unit.</>)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#7B4382] font-bold">•</span>
                    <span>{t(<><strong>Máximo por pedido:</strong> 80 estuches de 125g, 40 de 250g y 20 de 500g. Para volúmenes mayores escríbenos por WhatsApp.</>, <><strong>Maximum per order:</strong> 80 boxes of 125 g, 40 of 250 g and 20 of 500 g. For larger volumes, see our <a href="/mayoristas" className="underline font-semibold">wholesale section</a> or message us on WhatsApp.</>)}</span>
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
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#DFCEE6]/50 text-[#2F183C]">
                            {t('Presentación', 'Size')}: {fruit.presentation}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 mt-1">
                          {t('Precio', 'Price')}: <strong>{cop(unitPrice)} {t('c/u', 'each')}</strong>
                        </p>
                        {step === 500 ? (
                          <p className="text-xs font-medium text-[#7B4382] mt-1 flex items-center gap-1">
                            {t('✨ ¡Con 1 solo estuche completas el pedido mínimo total!', '✨ A single box completes the minimum order!')}
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-amber-800 mt-1 flex items-center gap-1">
                            {t('⚠️ Nota de empaque: Solo disponible en múltiplos de 2 unidades.', '⚠️ Packing note: only available in multiples of 2 units.')}
                          </p>
                        )}
                        {isOdd && (
                          <div className="mt-2 p-2 rounded-lg bg-red-100/70 border border-red-200 text-xs text-red-800 flex items-center justify-between gap-2">
                            <span>{t(`(Por favor, ajusta a ${units < 2 ? 2 : units + 1} unidades para poder empacar tu envío)`, `(Please adjust to ${units < 2 ? 2 : units + 1} units so we can pack your order)`)}</span>
                            <button
                              type="button"
                              onClick={() => handleSetUnits(fruit.id, units < 2 ? 2 : units + 1)}
                              className="px-2.5 py-1 bg-red-700 text-white rounded-md font-bold text-xs hover:bg-red-800 cursor-pointer shrink-0"
                            >
                              {t('Ajustar', 'Adjust')}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                        {g > 0 && (
                          <div className="text-right mr-1">
                            <span className="text-xs font-bold text-[#2F183C] block">
                              {cop(lineTotal)}
                            </span>
                            <span className="text-xs text-stone-500">
                              {units} {unitWord(units)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-white border border-[#EADBEE] rounded-lg p-1 shadow-xs">
                          <button
                            type="button"
                            disabled={g === 0}
                            onClick={() => handleGramsChange(fruit.id, -1)}
                            className="w-8 h-8 rounded-md border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label={t(`Quitar estuches de ${fruit.name}`, `Remove boxes of ${fruit.name}`)}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="min-w-[4.5rem] px-1 text-center">
                            <span className="text-sm font-black text-[#2F183C] block leading-tight">
                              {units} {unitWord(units)}
                            </span>
                            <span className="text-xs text-[#7B4382] font-semibold block leading-tight">
                              {g}g
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={units >= maxUnitsFor(step)}
                            onClick={() => handleGramsChange(fruit.id, 1)}
                            className="w-8 h-8 rounded-md bg-[#2F183C] text-white flex items-center justify-center hover:bg-[#432356] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={t(`Agregar estuches de ${fruit.name}`, `Add boxes of ${fruit.name}`)}
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
              <h3 className="font-bold text-lg text-[#2F183C] font-display">{t('2. Datos de entrega', '2. Delivery details')}</h3>
              {user && savedAddresses.length > 0 && (
                <div className="space-y-2" role="radiogroup" aria-label={t('Dirección de entrega', 'Delivery address')}>
                  <p className="text-xs font-semibold text-stone-500">{t('¿A cuál de tus direcciones lo enviamos?', 'Which of your addresses should we deliver to?')}</p>
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
                        <span className="font-bold text-[#2F183C]">{a.label}{a.isDefault ? t(' · principal', ' · primary') : ''}</span>
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
                      {t('+ Enviar a otra dirección', '+ Deliver to another address')}
                    </button>
                  </div>
                </div>
              )}
              {!user && (
                <p className="text-xs text-stone-500">
                  {t(<>No necesitas cuenta para pedir. Si ya tienes una, <a href="/panel" className="font-semibold text-[#7B4382] underline">ingresa</a> para usar tus direcciones guardadas y volverás aquí.</>, <>You do not need an account to order. If you already have one, <a href="/panel" className="font-semibold text-[#7B4382] underline">sign in</a> to use your saved addresses and you will come back here.</>)}
                </p>
              )}
              <input
                className={`w-full border ${formErrors.customerName ? 'border-red-400' : 'border-stone-300'} rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none`}
                placeholder={t('Nombre completo', 'Full name')} aria-label={t('Nombre completo', 'Full name')}
                name="name"
                autoComplete="name"
                value={customerName}
                onChange={e => { setCustomerName(e.target.value); setFormErrors(prev => ({ ...prev, customerName: '' })); }}
              />
              {formErrors.customerName && <p className="text-xs text-red-600">{formErrors.customerName}</p>}
              <input
                className={`w-full border ${formErrors.customerPhone ? 'border-red-400' : 'border-stone-300'} rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none`}
                placeholder={t('WhatsApp (ej. 317 893 1026)', 'WhatsApp (e.g. +57 317 893 1026)')} aria-label={t('WhatsApp (ej. 317 893 1026)', 'WhatsApp (e.g. +57 317 893 1026)')}
                name="tel"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={customerPhone}
                onChange={e => { setCustomerPhone(e.target.value); setFormErrors(prev => ({ ...prev, customerPhone: '' })); }}
              />
              {formErrors.customerPhone && <p className="text-xs text-red-600">{formErrors.customerPhone}</p>}
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                placeholder={t('Correo (para tu factura y seguimiento)', 'Email (for your invoice and tracking)')} aria-label={t('Correo (para tu factura y seguimiento)', 'Email (for your invoice and tracking)')}
                type="email"
                name="email"
                autoComplete="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
              {formErrors.customerEmail && <p className="text-xs text-red-600">{formErrors.customerEmail}</p>}
              <p className="text-xs text-stone-500 px-1">{t('📍 Ciudad:', '📍 City:')} <span className="font-semibold text-[#2F183C]">{BOGOTA}</span> {t('· solo entregamos en Bogotá', '· we only deliver in Bogotá')}</p>
              <AddressField
                value={deliveryAddress}
                onChange={text => { setDeliveryAddress(text); setFormErrors(prev => ({ ...prev, deliveryAddress: '' })); }}
                place={deliveryPlace}
                onPlace={setDeliveryPlace}
                invalid={!!formErrors.deliveryAddress}
              />
              <input
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                placeholder={t('Apto, torre, casa u oficina (opcional)', 'Apartment, tower, house or office (optional)')} aria-label={t('Apto, torre, casa u oficina (opcional)', 'Apartment, tower, house or office (optional)')}
                name="address-line2"
                autoComplete="address-line2"
                value={deliveryComplement}
                onChange={e => setDeliveryComplement(e.target.value)}
              />
              {formErrors.deliveryAddress && <p className="text-xs text-red-600">{formErrors.deliveryAddress}</p>}
              {isNewAddress && savedAddresses.length < MAX_ADDRESSES && (
                <label className="flex items-center gap-2 text-xs font-semibold text-[#2F183C] cursor-pointer">
                  <input type="checkbox" checked={saveNewAddress} onChange={e => setSaveNewAddress(e.target.checked)} />
                  {t('Guardar esta dirección en mi cuenta para próximos pedidos', 'Save this address to my account for future orders')}
                </label>
              )}
              <div className="rounded-xl bg-[#FAF7F0] border border-[#EADBEE] p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#2F183C] cursor-pointer">
                  <input type="checkbox" checked={wantsNit} onChange={e => setWantsNit(e.target.checked)} />
                  {t('Necesito factura a nombre de una empresa (NIT)', 'I need an invoice in a company name (NIT)')}
                </label>
                {!wantsNit ? (
                  <>
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder={t('Cédula para la factura (opcional)', 'ID number for the invoice (optional)')} aria-label={t('Cédula para la factura (opcional)', 'ID number for the invoice (optional)')}
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
                    placeholder={t('Razón social', 'Company name')} aria-label={t('Razón social', 'Company name')}
                    name="organization"
                    autoComplete="organization"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                  />
                  {formErrors.businessName && <p className="text-xs text-red-600">{formErrors.businessName}</p>}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder={t('NIT (sin DV)', 'NIT / tax ID (no check digit)')} aria-label={t('NIT (sin DV)', 'NIT / tax ID (no check digit)')}
                    inputMode="numeric"
                    value={nit}
                    onChange={e => setNit(e.target.value)}
                  />
                    </div>
                    <div>
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder="DV" aria-label="DV"
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
                    <option value="">{t('Régimen fiscal', 'Tax regime')}</option>
                    <option value="Responsable de IVA">{t('Responsable de IVA', 'VAT-responsible')}</option>
                    <option value="No responsable de IVA">{t('No responsable de IVA', 'Not VAT-responsible')}</option>
                    <option value="Régimen simple de tributación">{t('Régimen simple de tributación', 'Simple taxation regime')}</option>
                  </select>
                  {formErrors.taxRegime && <p className="text-xs text-red-600">{formErrors.taxRegime}</p>}
                  <input
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                    placeholder={t('Correo de facturación', 'Billing email')} aria-label={t('Correo de facturación', 'Billing email')}
                    type="email"
                    name="billing-email"
                    autoComplete="email"
                    value={billingEmail}
                    onChange={e => setBillingEmail(e.target.value)}
                  />
                  {formErrors.billingEmail && <p className="text-xs text-red-600">{formErrors.billingEmail}</p>}
                  </>
                )}
                <input
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none"
                  placeholder={t('Dirección de facturación (si es distinta a la de entrega)', 'Billing address (if different from delivery)')} aria-label={t('Dirección de facturación (si es distinta a la de entrega)', 'Billing address (if different from delivery)')}
                  name="billing-address"
                  autoComplete="billing street-address"
                  value={billingAddress}
                  onChange={e => setBillingAddress(e.target.value)}
                />
              </div>
              <p className="rounded-xl bg-[#FAF7F0] border border-[#EADBEE] p-3 text-xs text-stone-700 leading-relaxed">
                {t(<>Despachamos solo los <strong>martes y miércoles</strong> (8:00 a.m. – 3:00 p.m.). La primera fecha disponible es 8 días después de hacer el pedido, de acuerdo a la dirección que usted nos haya dado y la ruta del domiciliario.</>, <>We dispatch only on <strong>Tuesdays and Wednesdays</strong> (8:00 a.m. – 3:00 p.m.). The first available date is 8 days after placing the order, depending on the address you gave us and the courier's route.</>)}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-2xl border border-[#EADBEE] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-lg text-[#2F183C] flex items-center gap-2 font-display">
                  <span className="text-xl">🛒</span>
                  <span>{t('Tu Carrito', 'Your Cart')}</span>
                </h3>
                {meetsMinOrder && !hasPackingError ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]">
                    {t('✓ Válido para envío', '✓ Ready to ship')}
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {t('Mín. 500g', 'Min. 500 g')}
                  </span>
                )}
              </div>

              {/* Pedido mín. total indicator */}
              {totalGrams < 500 ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>
                    {t(<><strong>Pedido mín. total: 500g</strong> (Faltan <strong>{500 - totalGrams}g</strong> para completar el mínimo)</>, <><strong>Minimum total order: 500 g</strong> (<strong>{500 - totalGrams} g</strong> short of the minimum)</>)}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#F5ECF9] border border-[#DFCEE6] text-[#2F183C] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7B4382]" />
                  <span>
                    {t(<><strong>✓ Pedido mínimo total completado</strong> ({totalGrams}g seleccionados)</>, <><strong>✓ Minimum total order reached</strong> ({totalGrams} g selected)</>)}
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
                        <span className="font-bold text-[#2F183C]">{cop(lineCost)}</span>
                      </div>
                      <div className="mt-1.5 space-y-0.5 text-xs text-stone-600">
                        <p>• {t('Presentación', 'Size')}: {f.presentation}</p>
                        <p>• {t('Precio', 'Price')}: {cop(unitPrice)} {t('c/u', 'each')}</p>
                        {step === 500 ? (
                          <p className="text-[#7B4382] font-medium">• {t('✨ ¡Con 1 solo estuche completas el pedido mínimo total!', '✨ A single box completes the minimum order!')}</p>
                        ) : (
                          <p className="text-amber-800 font-medium">• {t('⚠️ Nota de empaque: Solo disponible en múltiplos de 2 unidades.', '⚠️ Packing note: only available in multiples of 2 units.')}</p>
                        )}
                        <p className={`font-semibold ${isOdd ? 'text-red-700' : 'text-[#2F183C]'} pt-0.5`}>
                          • {t('Tu selección', 'Your selection')}: {units} {unitWord(units)} ({g}g) — {cop(lineCost)}
                          {isOdd && (
                            <span className="text-red-700 font-bold block mt-0.5">
                              {t(`(Por favor, ajusta a ${units < 2 ? 2 : units + 1} unidades para poder empacar tu envío)`, `(Please adjust to ${units < 2 ? 2 : units + 1} units so we can pack your order)`)}
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
                  <span>{t('Peso total:', 'Total weight:')}</span>
                  <strong className="text-[#2F183C]">{totalGrams}g</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#2F183C]">{cop(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{t('Envío:', 'Shipping:')}</span>
                  <span>{deliveryFee === 0 ? (totalGrams === 0 ? cop(0) : t('Calculando...', 'Calculating...')) : cop(deliveryFee)}</span>
                </div>
                {commission > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>{t('Comisión pago en línea', 'Online payment fee')} ({COMMISSION_PCT}%):</span>
                    <span>{cop(commission)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                  <span className="font-bold text-[#2F183C]">{t('Total estimado:', 'Estimated total:')}</span>
                  <span className="text-2xl font-black text-[#2F183C]">{cop(grandTotal)}</span>
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-bold text-[#2F183C] mb-1">{t('Forma de pago', 'Payment method')}</legend>
                <label className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs cursor-pointer ${!online ? 'border-[#2F183C] bg-[#F5ECF9]' : 'border-[#EADBEE]'}`}>
                  <input type="radio" name="pago" className="mt-0.5" checked={!online} onChange={() => setPayChoice('transferencia')} />
                  <span>{t(<><strong>Transferencia o Bre-B</strong> · sin comisión. Confirmas por WhatsApp.</>, <><strong>Bank transfer or Bre-B</strong> · no fee. You confirm on WhatsApp.</>)}</span>
                </label>
                {ONLINE_PAYMENTS && (
                  <label className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs cursor-pointer ${online ? 'border-[#2F183C] bg-[#F5ECF9]' : 'border-[#EADBEE]'}`}>
                    <input type="radio" name="pago" className="mt-0.5" checked={online} onChange={() => setPayChoice('tarjeta')} />
                    <span>{t(<><strong>Pago en línea (tarjeta, PSE, Nequi)</strong> · más comisión de la pasarela del {COMMISSION_PCT}% ({ONLINE_GATEWAY ? GATEWAY_NAME[ONLINE_GATEWAY] : ''}).</>, <><strong>Online payment (card, PSE, Nequi)</strong> · plus a {COMMISSION_PCT}% payment gateway fee ({ONLINE_GATEWAY ? GATEWAY_NAME[ONLINE_GATEWAY] : ''}).</>)}</span>
                  </label>
                )}
              </fieldset>

              <div className="space-y-2 text-xs text-stone-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5" checked={acceptTerms} onChange={e => { setAcceptTerms(e.target.checked); setFormErrors(prev => ({ ...prev, acceptTerms: '' })); }} />
                  <span>
                    {t('He leído y acepto las condiciones de entrega (martes y miércoles, mínimo 8 días después del pedido, solo Bogotá) y los', 'I have read and accept the delivery conditions (Tuesdays and Wednesdays, at least 8 days after the order, Bogotá only) and the')}{' '}
                    <a href="/terminos" target="_blank" rel="noopener" className="font-semibold text-[#7B4382] underline">{t('Términos y Condiciones', 'Terms & Conditions')}</a>.
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5" checked={acceptData} onChange={e => { setAcceptData(e.target.checked); setFormErrors(prev => ({ ...prev, acceptData: '' })); }} />
                  <span>
                    {t('Autorizo de manera previa, expresa e informada a ANDEAN FRUIT COMPANY SAS (Fresh Pick) para tratar mis datos personales según la', 'I give my prior, express and informed authorization to ANDEAN FRUIT COMPANY SAS (Fresh Pick) to process my personal data under the')}{' '}
                    <a href="/privacidad" target="_blank" rel="noopener" className="font-semibold text-[#7B4382] underline">{t('Política de Tratamiento de Datos', 'Data Processing Policy')}</a>.
                  </span>
                </label>
              </div>

              {Object.values(formErrors).some(Boolean) && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" /> {t('Falta completar para confirmar tu pedido:', 'Please complete the following to confirm your order:')}</p>
                  <ul className="list-disc pl-6 space-y-0.5">
                    {Object.values(formErrors).filter(Boolean).map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                  <p className="text-red-700/80">{t('Los datos de entrega están en el paso 2, a la izquierda.', 'The delivery details are in step 2, on the left.')}</p>
                </div>
              )}

              {hasPackingError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{t('Por favor ajusta los estuches de 125g y 250g a múltiplos de 2 unidades para poder empacar tu envío.', 'Please adjust the 125 g and 250 g boxes to multiples of 2 so we can pack your order.')}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSubmitOrder(true)}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#2F183C] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#432356] transition-colors cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 text-[#DDA83A]" />}
                {t('Pedir por WhatsApp', 'Order on WhatsApp')}
              </button>
              <button
                type="button"
                onClick={() => handleSubmitOrder(false)}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl border border-[#DFCEE6] text-[#2F183C] font-bold text-sm hover:bg-[#F5ECF9] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('Guardando...', 'Saving...') : online ? t('Continuar al pago en línea', 'Continue to online payment') : t('Confirmar pedido', 'Confirm order')}
              </button>
              <p className="text-xs text-stone-400 text-center">WhatsApp: +57 317 893 1026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
