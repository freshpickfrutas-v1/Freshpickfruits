import React, { useEffect, useState } from 'react';
import {
  Package, MapPin, CreditCard, Leaf, ArrowLeft, Clock, CheckCircle2,
  Truck, Phone, User, Loader2, AlertCircle, LogOut
} from 'lucide-react';
import { findMyOrders } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';
import { normalizeStatus } from '../lib/orderFlow';
import { AuthGate } from '../components/AuthGate';
import { navigate } from '../lib/router';
import { usePageMeta } from '../lib/seo';
import { AddressBook } from '../components/AddressBook';
import { BillingProfile } from '../components/BillingProfile';
import { FirestoreOrder, SubscriptionDoc, SubscriptionPlan } from '../types';
import { requestChange, requestSubscription, subscribeMySubscriptions, SUB_STATUS } from '../lib/subscriptions';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { OnlinePayButton } from '../components/OnlinePayButton';
import { SUBSCRIPTION_PLANS as PLANS_ES } from '../data/mockData';
import { PLANS_EN, localizeList } from '../data/mockData.en';
import { dateLocale, useLang, useT } from '../lib/i18n';
import { waLink } from '../lib/contact';

const STATUS_EN: Record<string, string> = {
  pendiente: 'Received', pago_verificado: 'Payment confirmed', en_proceso: 'Preparing your order', empacado: 'Packed',
  en_ruta: 'On its way', entregado: 'Delivered', cerrado: 'Delivered', cancelado: 'Cancelled'
};
const SUB_STATUS_EN: Record<string, string> = { solicitada: 'Requested', activa: 'Active', pausada: 'Paused', cancelada: 'Cancelled' };

const statusLabel: Record<string, { text: string; color: string }> = {
  pendiente: { text: 'Recibido', color: 'bg-sky-100 text-sky-800' },
  pago_verificado: { text: 'Pago confirmado', color: 'bg-emerald-100 text-emerald-800' },
  en_proceso: { text: 'Preparando tu pedido', color: 'bg-amber-100 text-amber-800' },
  empacado: { text: 'Empacado', color: 'bg-amber-100 text-amber-800' },
  en_ruta: { text: 'En camino', color: 'bg-violet-100 text-violet-800' },
  entregado: { text: 'Entregado', color: 'bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]' },
  cerrado: { text: 'Entregado', color: 'bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]' },
  cancelado: { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

function UserPanelInner() {
  const t = useT();
  const lang = useLang();
  const loc = dateLocale(lang);
  const plans = localizeList(PLANS_ES, PLANS_EN, lang);
  const statusText = (key: string, fallback: string) => (lang === 'en' ? STATUS_EN[key] ?? fallback : fallback);
  const subLabel = (status: string, fallback: string) => (lang === 'en' ? SUB_STATUS_EN[status] ?? fallback : fallback);
  const { user, profile, isStaff, signOut } = useAuth();

  const [mySubs, setMySubs] = useState<SubscriptionDoc[]>([]);
  const [subError, setSubError] = useState('');
  const [subBusy, setSubBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeMySubscriptions(user.uid, setMySubs, err => setSubError(t('No se pudieron cargar tus suscripciones: ', 'We could not load your subscriptions: ') + err.message));
  }, [user]);

  const currentSub = (planId: string) => mySubs.find(m => m.planId === planId && m.status !== 'cancelada');

  /** Opens WhatsApp right away (so the browser allows it) and records the request for the team. */
  const choosePlan = async (plan: SubscriptionPlan) => {
    if (!user) return;
    window.open(subscribeLink(plan), '_blank', 'noopener,noreferrer');
    setSubBusy(plan.id); setSubError('');
    try {
      const addr = profile?.addresses?.find(x => x.isDefault) ?? profile?.addresses?.[0];
      await requestSubscription({ uid: user.uid, email: user.email, name: user.displayName ?? '' }, plan, addr);
    } catch (err) {
      setSubError(err instanceof Error ? t('No se pudo registrar tu solicitud: ', 'We could not register your request: ') + err.message : t('No se pudo registrar tu solicitud.', 'We could not register your request.'));
    } finally { setSubBusy(null); }
  };

  const askChange = async (id: string, request: 'pausar' | 'cancelar' | '') => {
    setSubBusy(id); setSubError('');
    try { await requestChange(id, request); }
    catch (err) { setSubError(err instanceof Error ? err.message : t('No se pudo enviar tu solicitud.', 'We could not send your request.')); }
    finally { setSubBusy(null); }
  };

  const subscribeLink = (plan: SubscriptionPlan) => {
    const addr = profile?.addresses?.find(x => x.isDefault) ?? profile?.addresses?.[0];
    const lines = [
      t(`Hola Fresh Pick! Deseo suscribirme al *${plan.title}* (${plan.weight} por $${plan.priceMonth.toLocaleString('es-CO')} COP/mes).`, `Hello Fresh Pick! I would like to subscribe to the *${plan.title}* (${plan.weight} for COP $${plan.priceMonth.toLocaleString('en-US')}/month).`),
      `${t('Nombre', 'Name')}: ${user?.displayName || addr?.recipientName || ''}`,
      `${t('Correo', 'Email')}: ${user?.email ?? ''}`,
      addr ? `${t('Dirección de entrega', 'Delivery address')}: ${addr.address}, ${addr.city}` : '',
      t('Por favor indíquenme cómo activar mi suscripción de arándanos.', 'Please tell me how to activate my blueberry subscription.'),
    ].filter(Boolean);
    return waLink(lines.join('\n'));
  };
  const [tab, setTab] = useState<'pedidos' | 'suscripcion' | 'perfil'>('pedidos');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    findMyOrders({ uid: user.uid, email: user.email })
      .then(results => { if (!cancelled) setOrders(results); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : t('No se pudieron cargar tus pedidos.', 'We could not load your orders.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F7F5F0]/90 backdrop-blur-[2px] text-stone-900 font-sans">
      <div className="bg-[#DDA83A] text-[#2F183C] text-xs sm:text-sm font-bold text-center py-2 px-4">
        {t('Panel de cliente · Tus pedidos y datos de entrega', 'Customer panel · Your orders and delivery details')}
      </div>

      <header className="bg-white border-b border-[#EADBEE] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-[#7B4382]">
              <ArrowLeft className="w-4 h-4" />
              {t('Tienda', 'Store')}
            </a>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F183C] text-[#DDA83A] flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-[#2F183C]">{t('Mi cuenta', 'My account')}</p>
                <p className="text-xs text-stone-500">Fresh Pick</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user?.displayName || user?.email || t('Cliente', 'Customer')}</span>
            <button onClick={() => signOut()} className="inline-flex items-center gap-1 ml-2 font-semibold text-[#7B4382] hover:text-[#2F183C]">
              <LogOut className="w-3.5 h-3.5" /> {t('Salir', 'Sign out')}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-2">
          {([
            { id: 'pedidos' as const, label: t('Mis pedidos', 'My orders'), icon: Package },
            { id: 'suscripcion' as const, label: t('Suscripción', 'Subscription'), icon: CreditCard },
            { id: 'perfil' as const, label: t('Datos y entrega', 'Details and delivery'), icon: MapPin },
          ]).map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                tab === item.id
                  ? 'bg-[#2F183C] text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-[#EADBEE] hover:bg-[#F5ECF9]'
              }`}
            >
              <item.icon className={`w-4 h-4 ${tab === item.id ? 'text-[#DDA83A]' : 'text-stone-500'}`} />
              {item.label}
            </button>
          ))}
          {isStaff && (
            <a href="/admin" className="block w-full text-center text-xs text-stone-400 hover:text-stone-600 pt-4">
              {t('Ir al panel admin →', 'Go to the admin panel →')}
            </a>
          )}
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {tab === 'pedidos' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">{t('Mis pedidos', 'My orders')}</h1>

              <p className="text-sm text-stone-500">
                {t('Pedidos de', 'Orders for')} <span className="font-semibold text-[#2F183C]">{user?.email}</span>
                {loading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin text-[#7B4382]" />}
              </p>

              {error && (
                <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}

              {!loading && orders.length === 0 && !error && (
                <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 text-center text-sm text-stone-500">
                  {t('Aún no tienes pedidos con esta cuenta. Si pediste antes como invitado, usa el mismo correo con el que entraste.', 'You have no orders with this account yet. If you ordered before as a guest, use the same email you signed in with.')}
                </div>
              )}

              <div className="space-y-3">
                {orders.map(order => {
                  const st = statusLabel[normalizeStatus(order.status)] || statusLabel.pendiente;
                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-[#EADBEE] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#2F183C]">{order.orderNumber}</span>
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${st.color}`}>{statusText(normalizeStatus(order.status), st.text)}</span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString(loc)}
                        </p>
                        <p className="text-sm text-stone-700 mt-1">
                          {order.items?.map(i => i.name).join(', ') || t('Pedido personalizado', 'Custom order')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-[#2F183C]">${(order.total || 0).toLocaleString(loc)}</p>
                        {normalizeStatus(order.status) === 'en_ruta' && (
                          <p className="text-xs text-amber-700 flex items-center justify-end gap-1 mt-1">
                            <Truck className="w-3 h-3" /> {t('Despacho hoy', 'Dispatched today')}
                          </p>
                        )}
                        {!['en_ruta', 'entregado', 'cerrado', 'cancelado'].includes(normalizeStatus(order.status)) && (
                          <a
                            href={waLink(t(`Hola Fresh Pick, quiero modificar o cancelar mi pedido ${order.orderNumber}`, `Hello Fresh Pick, I would like to change or cancel my order ${order.orderNumber}`))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#7B4382] underline"
                          >
                            <Phone className="w-3 h-3" /> {t('Modificar o cancelar por WhatsApp', 'Change or cancel on WhatsApp')}
                          </a>
                        )}
                        {normalizeStatus(order.status) === 'pendiente' && order.paymentStatus !== 'verificado' && (
                          <div className="mt-2 flex flex-col items-end gap-2">
                            <p className="text-xs font-semibold text-amber-700">{t('Pago pendiente', 'Payment pending')}</p>
                            {order.paymentMethod === 'tarjeta' && (
                              <OnlinePayButton
                                orderId={order.id}
                                customer={{ name: order.customerName, email: order.customerEmail, phone: order.customerPhone }}
                              />
                            )}
                            <a
                              href={waLink(t(`Hola Fresh Pick, quiero pagar mi pedido ${order.orderNumber} por $${(order.total || 0).toLocaleString('es-CO')} COP`, `Hello Fresh Pick, I would like to pay my order ${order.orderNumber} for COP $${(order.total || 0).toLocaleString('en-US')}`))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-[#7B4382] underline"
                            >
                              {t('Pagar por WhatsApp (transferencia o Bre-B)', 'Pay on WhatsApp (bank transfer or Bre-B)')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'suscripcion' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">{t('Mi suscripción', 'My subscription')}</h1>
              <p className="text-sm text-stone-600">
                {t('Elige un plan: registramos tu solicitud y abrimos WhatsApp para activarlo contigo, con tu dirección principal. Entregas los martes y miércoles de 8:00 a.m. a 3:00 p.m. Sin contratos de permanencia.', 'Choose a plan: we register your request and open WhatsApp to activate it with you, using your primary address. Deliveries on Tuesdays and Wednesdays from 8:00 a.m. to 3:00 p.m. No long-term contracts.')}
              </p>

              {subError && (
                <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {subError}
                </p>
              )}

              {mySubs.some(m => m.status !== 'cancelada') && (
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#7B4382]">{t('Tus suscripciones', 'Your subscriptions')}</h2>
                  {mySubs.filter(m => m.status !== 'cancelada').map(m => (
                    <div key={m.id} className="bg-white rounded-2xl border border-[#EADBEE] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#2F183C]">{m.planTitle} <span className={`ml-1 text-xs font-bold uppercase px-2 py-0.5 rounded-full ${SUB_STATUS[m.status].tone}`}>{subLabel(m.status, SUB_STATUS[m.status].label)}</span></p>
                        <p className="text-xs text-stone-500">{m.deliveryFrequency} · ${m.priceMonth.toLocaleString(loc)} {t('COP / mes', 'COP / month')}</p>
                        {m.status === 'solicitada' && <p className="text-xs text-stone-600">{t('Recibimos tu solicitud. Te contactamos por WhatsApp para activarla.', 'We received your request. We will contact you on WhatsApp to activate it.')}</p>}
                        {m.status === 'activa' && m.nextDelivery && <p className="text-xs text-stone-600">{t('Próxima entrega', 'Next delivery')}: {new Date(m.nextDelivery + 'T12:00:00').toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
                        {m.customerRequest && <p className="text-xs font-semibold text-amber-700">{t(`Solicitaste ${m.customerRequest === 'pausar' ? 'pausar' : 'cancelar'} este plan. Lo confirmamos contigo.`, `You requested to ${m.customerRequest === 'pausar' ? 'pause' : 'cancel'} this plan. We will confirm it with you.`)}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.customerRequest ? (
                          <button onClick={() => askChange(m.id, '')} disabled={subBusy === m.id} className="text-xs font-bold text-stone-600 underline">{t('Retirar solicitud', 'Withdraw request')}</button>
                        ) : (m.status === 'activa' || m.status === 'pausada') && (
                          <>
                            {m.status === 'activa' && <button onClick={() => askChange(m.id, 'pausar')} disabled={subBusy === m.id} className="px-3 py-2 rounded-xl border border-amber-300 text-amber-800 text-xs font-bold">{t('Pedir pausa', 'Request pause')}</button>}
                            <button onClick={() => { if (window.confirm(t('¿Quieres cancelar este plan?', 'Do you want to cancel this plan?'))) askChange(m.id, 'cancelar'); }} disabled={subBusy === m.id} className="px-3 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-bold">{t('Pedir cancelación', 'Request cancellation')}</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-sm font-bold uppercase tracking-wider text-[#7B4382] pt-1">{t('Planes disponibles', 'Available plans')}</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-5 flex flex-col justify-between gap-4 ${plan.isPopular ? 'bg-[#2F183C] text-white ring-2 ring-[#DDA83A] shadow-lg' : 'bg-white border border-[#EADBEE] shadow-xs'}`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-3 left-5 px-3 py-0.5 rounded-full bg-[#DDA83A] text-[#2F183C] text-xs font-black uppercase tracking-wider">{t('El más popular', 'Most popular')}</span>
                    )}
                    <div className="space-y-3">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${plan.isPopular ? 'text-[#DDA83A]' : 'text-[#7B4382]'}`}>{plan.idealFor}</span>
                        <h2 className={`text-lg font-bold font-display mt-0.5 ${plan.isPopular ? '!text-white' : ''}`}>{plan.title}</h2>
                        <p className={`text-xs mt-1 leading-relaxed ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-600'}`}>{plan.subtitle}</p>
                      </div>
                      <div className={`py-2 px-3 rounded-xl text-xs font-semibold ${plan.isPopular ? 'bg-[#432356] text-[#DDA83A] border border-[#7B4382]' : 'bg-[#FAF7F0] text-[#2F183C] border border-[#EADBEE]'}`}>
                        📦 {plan.weight}
                        <span className="block font-normal opacity-80">{plan.deliveryFrequency}</span>
                      </div>
                      <p className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-display">${plan.priceMonth.toLocaleString(loc)}</span>
                        <span className={`text-xs ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-500'}`}>{t('COP / mes', 'COP / month')}</span>
                      </p>
                      <ul className="space-y-1.5">
                        {plan.features.map(f => (
                          <li key={f} className={`flex items-start gap-2 text-xs ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-700'}`}>
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.isPopular ? 'text-[#DDA83A]' : 'text-[#7B4382]'}`} /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {currentSub(plan.id) ? (
                      <p className={`text-center text-sm font-bold py-3 rounded-xl ${plan.isPopular ? 'bg-[#432356] text-[#DDA83A]' : 'bg-[#F5ECF9] text-[#2F183C]'}`}>
                        {SUB_STATUS[currentSub(plan.id)!.status].label === 'Solicitada' ? t('Solicitud enviada ✓', 'Request sent ✓') : t('Ya tienes este plan', 'You already have this plan')}
                      </p>
                    ) : (
                      <button
                        onClick={() => choosePlan(plan)}
                        disabled={subBusy === plan.id}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-60 ${plan.isPopular ? 'bg-[#DDA83A] text-[#2F183C]' : 'bg-[#2F183C] text-white'}`}
                      >
                        {subBusy === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />} {t('Quiero este plan', 'I want this plan')}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-stone-500">
                {t('¿Tienes dudas o ya tienes un plan activo?', 'Have questions or already on an active plan?')}{' '}
                <a href={waLink(t('Hola Fresh Pick, quiero info de suscripciones', 'Hello Fresh Pick, I would like information about subscriptions'))} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#7B4382] hover:underline">
                  {t('Escríbenos por WhatsApp', 'Message us on WhatsApp')}
                </a>
                .
              </p>
            </div>
          )}

          {tab === 'perfil' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">{t('Datos y entrega', 'Details and delivery')}</h1>
              <AddressBook />
              <BillingProfile />
              <a
                href={waLink(t('Hola Fresh Pick, quiero actualizar mis datos de entrega', 'Hello Fresh Pick, I would like to update my delivery details'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#7B4382] hover:underline"
              >
                <Phone className="w-4 h-4 text-[#DDA83A]" />
                {t('¿Necesitas ayuda con tus datos? Escríbenos por WhatsApp', 'Need help with your details? Message us on WhatsApp')}
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StaffRedirect({ children }: { children: React.ReactNode }) {
  const { isStaff, loading } = useAuth();
  useEffect(() => { if (!loading && isStaff) navigate('/admin'); }, [loading, isStaff]);
  return isStaff ? null : <>{children}</>;
}

export default function UserPanel() {
  const t = useT();
  usePageMeta({ title: t('Mi cuenta | Fresh Pick', 'My account | Fresh Pick'), description: t('Tus pedidos y datos en Fresh Pick.', 'Your orders and details at Fresh Pick.'), path: '/panel', noindex: true });
  return (
    <AuthGate title={t('Mi cuenta Fresh Pick', 'My Fresh Pick account')}>
      <StaffRedirect><UserPanelInner /></StaffRedirect>
    </AuthGate>
  );
}
