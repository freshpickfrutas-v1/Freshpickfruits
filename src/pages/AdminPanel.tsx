import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingBag, ArrowLeft, Leaf,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Box
} from 'lucide-react';
import { FRUITS_DATA } from '../data/mockData';

const MOCK_ADMIN_ORDERS = [
  { id: 'FP-10482', customer: 'María G.', phone: '317***1026', total: 42000, status: 'preparando', date: 'Hoy 09:12' },
  { id: 'FP-10481', customer: 'Carlos R.', phone: '310***4412', total: 15000, status: 'nuevo', date: 'Hoy 08:45' },
  { id: 'FP-10470', customer: 'Ana P.', phone: '300***9981', total: 68000, status: 'despachado', date: 'Ayer' },
  { id: 'FP-10455', customer: 'Luis M.', phone: '320***1122', total: 28000, status: 'entregado', date: '08 sep' },
];

const statusStyle: Record<string, string> = {
  nuevo: 'bg-sky-100 text-sky-800',
  preparando: 'bg-amber-100 text-amber-800',
  despachado: 'bg-violet-100 text-violet-800',
  entregado: 'bg-emerald-100 text-emerald-800',
};

export default function AdminPanel() {
  const [tab, setTab] = useState<'resumen' | 'pedidos' | 'productos' | 'clientes'>('resumen');

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans">
      <div className="bg-stone-900 text-amber-300 text-xs sm:text-sm font-semibold text-center py-2 px-4">
        Panel admin · Vista previa sin autenticación · Login de roles próximamente
      </div>

      <header className="bg-stone-950 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Tienda
            </a>
            <span className="text-stone-600">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1B4D3E] flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Admin Fresh Pick</p>
                <p className="text-[10px] text-stone-400">Operaciones</p>
              </div>
            </div>
          </div>
          <a href="/panel" className="text-xs text-stone-400 hover:text-white">
            Panel usuario →
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-2 space-y-1">
          {([
            { id: 'resumen' as const, label: 'Resumen', icon: LayoutDashboard },
            { id: 'pedidos' as const, label: 'Pedidos', icon: ShoppingBag },
            { id: 'productos' as const, label: 'Productos', icon: Box },
            { id: 'clientes' as const, label: 'Clientes', icon: Users },
          ]).map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === item.id
                  ? 'bg-[#1B4D3E] text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-10 space-y-6">
          {tab === 'resumen' && (
            <>
              <h1 className="text-2xl font-black tracking-tight">Resumen del día</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Pedidos hoy', value: '12', icon: ShoppingBag, tone: 'text-sky-700 bg-sky-50' },
                  { label: 'Por despachar', value: '5', icon: Clock, tone: 'text-amber-700 bg-amber-50' },
                  { label: 'Ingresos hoy', value: '$486k', icon: TrendingUp, tone: 'text-emerald-700 bg-emerald-50' },
                  { label: 'Clientes activos', value: '84', icon: Users, tone: 'text-violet-700 bg-violet-50' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-2xl border border-stone-200 p-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.tone}`}>
                      <card.icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-black">{card.value}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <h2 className="font-bold mb-3">Pedidos recientes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-stone-500 border-b border-stone-100">
                        <th className="pb-2 font-semibold">Orden</th>
                        <th className="pb-2 font-semibold">Cliente</th>
                        <th className="pb-2 font-semibold">Total</th>
                        <th className="pb-2 font-semibold">Estado</th>
                        <th className="pb-2 font-semibold">Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ADMIN_ORDERS.slice(0, 3).map(o => (
                        <tr key={o.id} className="border-b border-stone-50">
                          <td className="py-2.5 font-semibold">{o.id}</td>
                          <td className="py-2.5">{o.customer}</td>
                          <td className="py-2.5">${o.total.toLocaleString('es-CO')}</td>
                          <td className="py-2.5">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusStyle[o.status]}`}>{o.status}</span>
                          </td>
                          <td className="py-2.5 text-stone-500">{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === 'pedidos' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight">Pedidos</h1>
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50">
                      <tr className="text-left text-xs text-stone-500">
                        <th className="px-4 py-3 font-semibold">Orden</th>
                        <th className="px-4 py-3 font-semibold">Cliente</th>
                        <th className="px-4 py-3 font-semibold">Teléfono</th>
                        <th className="px-4 py-3 font-semibold">Total</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ADMIN_ORDERS.map(o => (
                        <tr key={o.id} className="border-t border-stone-100 hover:bg-stone-50/80">
                          <td className="px-4 py-3 font-semibold">{o.id}</td>
                          <td className="px-4 py-3">{o.customer}</td>
                          <td className="px-4 py-3 text-stone-500">{o.phone}</td>
                          <td className="px-4 py-3 font-semibold">${o.total.toLocaleString('es-CO')}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusStyle[o.status]}`}>{o.status}</span>
                          </td>
                          <td className="px-4 py-3 text-stone-500">{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Datos de demostración. Con login se conectarán a Firebase/Firestore.
              </p>
            </div>
          )}

          {tab === 'productos' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight">Productos</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FRUITS_DATA.map(f => (
                  <div key={f.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4">
                    <img src={f.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-stone-100" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{f.name}</p>
                      <p className="text-xs text-stone-500">{f.presentation}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-black text-[#1B4D3E]">${f.standardPrice.toLocaleString('es-CO')}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${f.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {f.inStock ? 'Stock' : 'Agotado'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'clientes' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight">Clientes</h1>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
                {[
                  { name: 'María G.', orders: 8, city: 'Bogotá', plan: 'Familiar' },
                  { name: 'Carlos R.', orders: 3, city: 'Chía', plan: '—' },
                  { name: 'Ana P.', orders: 12, city: 'Bogotá', plan: 'Premium' },
                  { name: 'Luis M.', orders: 2, city: 'Cajicá', plan: '—' },
                ].map(c => (
                  <div key={c.name} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-stone-500">{c.city} · {c.orders} pedidos</p>
                    </div>
                    <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-lg">{c.plan}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
