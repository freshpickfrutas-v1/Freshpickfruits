import React, { useEffect, useState } from 'react';
import {
  Package, MapPin, CreditCard, Leaf, ArrowLeft, Clock, CheckCircle2,
  Truck, Phone, User, Search, Loader2, AlertCircle
} from 'lucide-react';
import { findOrdersByContact } from '../lib/firestore';
import { FirestoreOrder } from '../types';

const statusLabel: Record<string, { text: string; color: string }> = {
  pendiente: { text: 'Pendiente', color: 'bg-sky-100 text-sky-800' },
  confirmado: { text: 'Confirmado', color: 'bg-amber-100 text-amber-800' },
  cosechando: { text: 'Cosechando', color: 'bg-amber-100 text-amber-800' },
  en_camino: { text: 'En camino', color: 'bg-violet-100 text-violet-800' },
  entregado: { text: 'Entregado', color: 'bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]' },
  cancelado: { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const PROFILE_KEY = 'freshpick_profile_draft';

interface ProfileDraft {
  name: string;
  phone: string;
  address: string;
  city: string;
  timeSlot: string;
}

function loadProfileDraft(): ProfileDraft {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: '', phone: '', address: '', city: 'Bogotá D.C.', timeSlot: 'Mañana 8am–1pm' };
}

export default function UserPanel() {
  const [tab, setTab] = useState<'pedidos' | 'suscripcion' | 'perfil'>('pedidos');

  // Modo pruebas sin login: el cliente se identifica por teléfono o email
  // para consultar SUS pedidos reales en Firestore.
  const [lookup, setLookup] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = lookup.trim();
    if (!value) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const isEmail = value.includes('@');
      const results = await findOrdersByContact(isEmail ? { email: value } : { phone: value });
      setOrders(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron buscar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const [profile, setProfile] = useState<ProfileDraft>(() => loadProfileDraft());
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (profileSaved) {
      const t = setTimeout(() => setProfileSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [profileSaved]);

  const handleSaveProfile = () => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setProfileSaved(true);
      if (profile.phone) setLookup(profile.phone);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0]/90 backdrop-blur-[2px] text-stone-900 font-sans">
      <div className="bg-[#DDA83A] text-[#2F183C] text-xs sm:text-sm font-bold text-center py-2 px-4">
        Panel de cliente · Modo pruebas sin login · Busca tus pedidos por teléfono o email
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
            <span className="hidden sm:inline">{profile.name || 'Cliente'}</span>
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

              <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-[#EADBEE] p-4 flex flex-col sm:flex-row gap-3 shadow-xs">
                <input
                  className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="Tu WhatsApp o correo usado en el pedido"
                  value={lookup}
                  onChange={e => setLookup(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar mis pedidos
                </button>
              </form>

              {error && (
                <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}

              {!searched && !error && (
                <p className="text-sm text-stone-400">Ingresa el mismo teléfono o correo que usaste al hacer tu pedido para ver su estado.</p>
              )}

              {searched && !loading && orders.length === 0 && !error && (
                <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 text-center text-sm text-stone-500">
                  No encontramos pedidos con ese dato. Verifica que sea el mismo teléfono o correo del pedido.
                </div>
              )}

              <div className="space-y-3">
                {orders.map(order => {
                  const st = statusLabel[order.status] || statusLabel.pendiente;
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
                        {order.status === 'en_camino' && (
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
              <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 space-y-4 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">Nombre</span>
                    <input
                      className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">WhatsApp</span>
                    <input
                      className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-semibold text-stone-500">Dirección</span>
                    <input
                      className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
                      value={profile.address}
                      onChange={e => setProfile({ ...profile, address: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">Ciudad</span>
                    <input
                      className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
                      value={profile.city}
                      onChange={e => setProfile({ ...profile, city: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">Franja preferida</span>
                    <select
                      className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
                      value={profile.timeSlot}
                      onChange={e => setProfile({ ...profile, timeSlot: e.target.value })}
                    >
                      <option>Mañana 8am–1pm</option>
                      <option>Tarde 1pm–6pm</option>
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#2F183C] text-white text-sm font-bold"
                  >
                    Guardar
                  </button>
                  {profileSaved && <span className="text-xs font-semibold text-[#7B4382]">Guardado en este navegador ✓</span>}
                </div>
                <p className="text-xs text-stone-400">
                  Modo pruebas: tus datos se guardan solo en este navegador hasta que exista login. Con cuenta real se guardarán en Firestore.
                </p>
              </div>
              <a
                href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20actualizar%20mis%20datos%20de%20entrega"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#7B4382] hover:underline"
              >
                <Phone className="w-4 h-4 text-[#DDA83A]" />
                Actualizar datos por WhatsApp
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
