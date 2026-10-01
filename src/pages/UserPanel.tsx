import React, { useEffect, useState } from 'react';
import {
  Package, MapPin, CreditCard, Leaf, ArrowLeft, Clock, CheckCircle2,
  Truck, Phone, User, Loader2, AlertCircle, LogOut
} from 'lucide-react';
import { findMyOrders } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';
import { normalizeStatus } from '../lib/orderFlow';
import { AuthGate } from '../components/AuthGate';
import { AddressBook } from '../components/AddressBook';
import { BillingProfile } from '../components/BillingProfile';
import { FirestoreOrder, SubscriptionDoc, SubscriptionPlan } from '../types';
import { requestChange, requestSubscription, subscribeMySubscriptions, SUB_STATUS } from '../lib/subscriptions';
import { SUBSCRIPTION_PLANS } from '../data/mockData';

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
  const { user, profile, isStaff, signOut } = useAuth();

  const [mySubs, setMySubs] = useState<SubscriptionDoc[]>([]);
  const [subError, setSubError] = useState('');
  const [subBusy, setSubBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeMySubscriptions(user.uid, setMySubs, err => setSubError('No se pudieron cargar tus suscripciones: ' + err.message));
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
      setSubError(err instanceof Error ? 'No se pudo registrar tu solicitud: ' + err.message : 'No se pudo registrar tu solicitud.');
    } finally { setSubBusy(null); }
  };

  const askChange = async (id: string, request: 'pausar' | 'cancelar' | '') => {
    setSubBusy(id); setSubError('');
    try { await requestChange(id, request); }
    catch (err) { setSubError(err instanceof Error ? err.message : 'No se pudo enviar tu solicitud.'); }
    finally { setSubBusy(null); }
  };

  const subscribeLink = (plan: SubscriptionPlan) => {
    const addr = profile?.addresses?.find(x => x.isDefault) ?? profile?.addresses?.[0];
    const lines = [
      `Hola Fresh Pick! Deseo suscribirme al *${plan.title}* (${plan.weight} por $${plan.priceMonth.toLocaleString('es-CO')} COP/mes).`,
      `Nombre: ${user?.displayName || addr?.recipientName || ''}`,
      `Correo: ${user?.email ?? ''}`,
      addr ? `Dirección de entrega: ${addr.address}, ${addr.city}` : '',
      'Por favor indíquenme cómo activar mi suscripción de arándanos.',
    ].filter(Boolean);
    return `https://wa.me/573178931026?text=${encodeURIComponent(lines.join('\n'))}`;
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
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudieron cargar tus pedidos.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F7F5F0]/90 backdrop-blur-[2px] text-stone-900 font-sans">
      <div className="bg-[#DDA83A] text-[#2F183C] text-xs sm:text-sm font-bold text-center py-2 px-4">
        Panel de cliente · Tus pedidos y datos de entrega
      </div>

      <header className="bg-white border-b border-[#EADBEE] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-[#7B4382]">
              <ArrowLeft className="w-4 h-4" />
              Tienda
            </a>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F183C] text-[#DDA83A] flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-[#2F183C]">Mi cuenta</p>
                <p className="text-[10px] text-stone-500">Fresh Pick</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user?.displayName || user?.email || 'Cliente'}</span>
            <button onClick={() => signOut()} className="inline-flex items-center gap-1 ml-2 font-semibold text-[#7B4382] hover:text-[#2F183C]">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-2">
          {([
            { id: 'pedidos' as const, label: 'Mis pedidos', icon: Package },
            { id: 'suscripcion' as const, label: 'Suscripción', icon: CreditCard },
            { id: 'perfil' as const, label: 'Datos y entrega', icon: MapPin },
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
            <a href="/admin" className="block w-full text-center text-[11px] text-stone-400 hover:text-stone-600 pt-4">
              Ir al panel admin →
            </a>
          )}
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {tab === 'pedidos' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Mis pedidos</h1>

              <p className="text-sm text-stone-500">
                Pedidos de <span className="font-semibold text-[#2F183C]">{user?.email}</span>
                {loading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin text-[#7B4382]" />}
              </p>

              {error && (
                <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}

              {!loading && orders.length === 0 && !error && (
                <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 text-center text-sm text-stone-500">
                  Aún no tienes pedidos con esta cuenta. Si pediste antes como invitado, usa el mismo correo con el que entraste.
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
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('es-CO')}
                        </p>
                        <p className="text-sm text-stone-700 mt-1">
                          {order.items?.map(i => i.name).join(', ') || 'Pedido personalizado'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-[#2F183C]">${(order.total || 0).toLocaleString('es-CO')}</p>
                        {normalizeStatus(order.status) === 'en_ruta' && (
                          <p className="text-[11px] text-amber-700 flex items-center justify-end gap-1 mt-1">
                            <Truck className="w-3 h-3" /> Despacho hoy
                          </p>
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
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Mi suscripción</h1>
              <p className="text-sm text-stone-600">
                Elige un plan: registramos tu solicitud y abrimos WhatsApp para activarlo contigo, con tu dirección principal. Entregas los martes y miércoles de 8:00 a.m. a 3:00 p.m. Sin contratos de permanencia.
              </p>

              {subError && (
                <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {subError}
                </p>
              )}

              {mySubs.some(m => m.status !== 'cancelada') && (
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#7B4382]">Tus suscripciones</h2>
                  {mySubs.filter(m => m.status !== 'cancelada').map(m => (
                    <div key={m.id} className="bg-white rounded-2xl border border-[#EADBEE] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#2F183C]">{m.planTitle} <span className={`ml-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${SUB_STATUS[m.status].tone}`}>{SUB_STATUS[m.status].label}</span></p>
                        <p className="text-xs text-stone-500">{m.deliveryFrequency} · ${m.priceMonth.toLocaleString('es-CO')} COP / mes</p>
                        {m.status === 'solicitada' && <p className="text-xs text-stone-600">Recibimos tu solicitud. Te contactamos por WhatsApp para activarla.</p>}
                        {m.status === 'activa' && m.nextDelivery && <p className="text-xs text-stone-600">Próxima entrega: {new Date(m.nextDelivery + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
                        {m.customerRequest && <p className="text-xs font-semibold text-amber-700">Solicitaste {m.customerRequest === 'pausar' ? 'pausar' : 'cancelar'} este plan. Lo confirmamos contigo.</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.customerRequest ? (
                          <button onClick={() => askChange(m.id, '')} disabled={subBusy === m.id} className="text-xs font-bold text-stone-600 underline">Retirar solicitud</button>
                        ) : (m.status === 'activa' || m.status === 'pausada') && (
                          <>
                            {m.status === 'activa' && <button onClick={() => askChange(m.id, 'pausar')} disabled={subBusy === m.id} className="px-3 py-2 rounded-xl border border-amber-300 text-amber-800 text-xs font-bold">Pedir pausa</button>}
                            <button onClick={() => { if (window.confirm('¿Quieres cancelar este plan?')) askChange(m.id, 'cancelar'); }} disabled={subBusy === m.id} className="px-3 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-bold">Pedir cancelación</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-sm font-bold uppercase tracking-wider text-[#7B4382] pt-1">Planes disponibles</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-5 flex flex-col justify-between gap-4 ${plan.isPopular ? 'bg-[#2F183C] text-white ring-2 ring-[#DDA83A] shadow-lg' : 'bg-white border border-[#EADBEE] shadow-xs'}`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-3 left-5 px-3 py-0.5 rounded-full bg-[#DDA83A] text-[#2F183C] text-[10px] font-black uppercase tracking-wider">El más popular</span>
                    )}
                    <div className="space-y-3">
                      <div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${plan.isPopular ? 'text-[#DDA83A]' : 'text-[#7B4382]'}`}>{plan.idealFor}</span>
                        <h2 className={`text-lg font-bold font-display mt-0.5 ${plan.isPopular ? '!text-white' : ''}`}>{plan.title}</h2>
                        <p className={`text-xs mt-1 leading-relaxed ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-600'}`}>{plan.subtitle}</p>
                      </div>
                      <div className={`py-2 px-3 rounded-xl text-xs font-semibold ${plan.isPopular ? 'bg-[#432356] text-[#DDA83A] border border-[#7B4382]' : 'bg-[#FAF7F0] text-[#2F183C] border border-[#EADBEE]'}`}>
                        📦 {plan.weight}
                        <span className="block font-normal opacity-80">{plan.deliveryFrequency}</span>
                      </div>
                      <p className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-display">${plan.priceMonth.toLocaleString('es-CO')}</span>
                        <span className={`text-xs ${plan.isPopular ? 'text-[#DFCEE6]' : 'text-stone-500'}`}>COP / mes</span>
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
                        {SUB_STATUS[currentSub(plan.id)!.status].label === 'Solicitada' ? 'Solicitud enviada ✓' : 'Ya tienes este plan'}
                      </p>
                    ) : (
                      <button
                        onClick={() => choosePlan(plan)}
                        disabled={subBusy === plan.id}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-60 ${plan.isPopular ? 'bg-[#DDA83A] text-[#2F183C]' : 'bg-[#2F183C] text-white'}`}
                      >
                        {subBusy === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />} Quiero este plan
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-stone-500">
                ¿Tienes dudas o ya tienes un plan activo?{' '}
                <a href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20info%20de%20suscripciones" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#7B4382] hover:underline">
                  Escríbenos por WhatsApp
                </a>
                .
              </p>
            </div>
          )}

          {tab === 'perfil' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Datos y entrega</h1>
              <AddressBook />
              <BillingProfile />
              <a
                href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20actualizar%20mis%20datos%20de%20entrega"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#7B4382] hover:underline"
              >
                <Phone className="w-4 h-4 text-[#DDA83A]" />
                ¿Necesitas ayuda con tus datos? Escríbenos por WhatsApp
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function UserPanel() {
  return (
    <AuthGate title="Mi cuenta Fresh Pick">
      <UserPanelInner />
    </AuthGate>
  );
}
