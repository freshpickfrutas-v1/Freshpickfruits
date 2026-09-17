import React, { useState } from 'react';
import {
  Package, MapPin, CreditCard, Leaf, ArrowLeft, Clock, CheckCircle2,
  Truck, Phone, User
} from 'lucide-react';

const MOCK_ORDERS = [
  { id: 'FP-10482', date: '2026-09-08', total: 42000, status: 'en_camino', items: 'Biloxi 500g + Jumbo 250g' },
  { id: 'FP-10391', date: '2026-09-01', total: 28000, status: 'entregado', items: 'Caja Familiar 1kg' },
  { id: 'FP-10255', date: '2026-08-20', total: 15000, status: 'entregado', items: 'Jumbo Selección 500g' },
];

const statusLabel: Record<string, { text: string; color: string }> = {
  en_camino: { text: 'En camino', color: 'bg-amber-100 text-amber-800' },
  entregado: { text: 'Entregado', color: 'bg-emerald-100 text-emerald-800' },
  pendiente: { text: 'Pendiente', color: 'bg-stone-100 text-stone-700' },
};

export default function UserPanel() {
  const [tab, setTab] = useState<'pedidos' | 'suscripcion' | 'perfil'>('pedidos');

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 font-sans">
      <div className="bg-amber-500 text-amber-950 text-xs sm:text-sm font-semibold text-center py-2 px-4">
        Vista previa del panel de usuario · Login y cuentas reales próximamente
      </div>

      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-[#1B4D3E]">
              <ArrowLeft className="w-4 h-4" />
              Tienda
            </a>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1B4D3E] text-white flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Mi cuenta</p>
                <p className="text-[10px] text-stone-500">Fresh Pick</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Cliente demo</span>
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
                  ? 'bg-[#1B4D3E] text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
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
              <h1 className="text-2xl font-black tracking-tight">Mis pedidos</h1>
              <div className="space-y-3">
                {MOCK_ORDERS.map(order => {
                  const st = statusLabel[order.status] || statusLabel.pendiente;
                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-stone-900">{order.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {order.date}
                        </p>
                        <p className="text-sm text-stone-700 mt-1">{order.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-[#1B4D3E]">${order.total.toLocaleString('es-CO')}</p>
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
              <h1 className="text-2xl font-black tracking-tight">Mi suscripción</h1>
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Plan activo (demo)</span>
                    <h2 className="text-xl font-bold mt-1">Plan Familiar</h2>
                    <p className="text-sm text-stone-500 mt-1">1 kg semanal · Entrega martes</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-stone-50">
                    <p className="text-xs text-stone-500">Próxima entrega</p>
                    <p className="font-semibold">16 sep 2026</p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50">
                    <p className="text-xs text-stone-500">Valor mensual</p>
                    <p className="font-semibold">$68.000 COP</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-stone-400">La gestión real de suscripciones se activará con el login.</p>
              </div>
            </div>
          )}

          {tab === 'perfil' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight">Datos y entrega</h1>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">Nombre</span>
                    <input className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2" defaultValue="Cliente Demo" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">WhatsApp</span>
                    <input className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2" defaultValue="317 893 1026" />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-semibold text-stone-500">Dirección</span>
                    <input className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2" defaultValue="Calle 100 #15-20, Bogotá" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">Ciudad</span>
                    <input className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2" defaultValue="Bogotá D.C." />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold text-stone-500">Franja preferida</span>
                    <select className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2">
                      <option>Mañana 8am–1pm</option>
                      <option>Tarde 1pm–6pm</option>
                    </select>
                  </label>
                </div>
                <button type="button" className="px-5 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-sm font-bold opacity-60 cursor-not-allowed" disabled>
                  Guardar (requiere login)
                </button>
              </div>
              <a
                href="https://wa.me/573178931026?text=Hola%20Fresh%20Pick,%20quiero%20actualizar%20mis%20datos%20de%20entrega"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4D3E] hover:underline"
              >
                <Phone className="w-4 h-4" />
                Actualizar datos por WhatsApp
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
