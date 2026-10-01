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
import { FirestoreOrder } from '../types';

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
  const { user, signOut } = useAuth();
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
          <a href="/admin" className="block w-full text-center text-[11px] text-stone-400 hover:text-stone-600 pt-4">
            Ir al panel admin →
          </a>
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
              <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7B4382]">Vista previa</span>
                    <h2 className="text-xl font-bold mt-1 text-[#2F183C] font-display">Planes de suscripción</h2>
                    <p className="text-sm text-stone-500 mt-1">La gestión de suscripciones recurrentes aún no está conectada a Firestore.</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-[#7B4382]" />
                </div>
                <p className="mt-4 text-xs text-stone-400">Escríbenos por WhatsApp para activar un plan mientras habilitamos la gestión automática.</p>
                <a
                  href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20info%20de%20suscripciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7B4382] hover:underline"
                >
                  <Phone className="w-4 h-4 text-[#DDA83A]" />
                  Preguntar por WhatsApp
                </a>
              </div>
            </div>
          )}

          {tab === 'perfil' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Datos y entrega</h1>
              <AddressBook />
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
