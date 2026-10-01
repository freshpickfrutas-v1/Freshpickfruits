import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingBag, ArrowLeft, Leaf,
  TrendingUp, Clock, AlertCircle, Box, Pencil, Trash2, Plus, X, Loader2, LogOut, UserCog
} from 'lucide-react';
import {
  subscribeProducts, addProduct, updateProduct, deleteProduct,
  subscribeAllOrders, subscribeUsers, setUserRole, ProductDoc,
} from '../lib/firestore';
import { FirestoreOrder, OrderStatus, ROLE_LABELS, STAFF_ROLES, UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthGate } from '../components/AuthGate';
import { OrdersBoard } from '../components/OrdersBoard';
import { stageOf, normalizeStatus } from '../lib/orderFlow';
import { importCatalog } from '../lib/catalog';
import { FRUITS_DATA } from '../data/mockData';

function isToday(iso: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isToday(iso)) return `Hoy ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

const emptyProduct: Omit<ProductDoc, 'id'> = {
  name: '',
  scientificName: 'Vaccinium corymbosum',
  variety: 'Alta Montaña · Cosecha Manual',
  category: 'frescos',
  tagline: '',
  description: '',
  pricePerGram: 0,
  defaultGramUnit: 250,
  standardPrice: 0,
  presentation: '',
  imageUrl: '/assets/blueberries.jpg',
  brix: '13.0° – 15.0° Brix',
  altitude: 'Más de 2.800 m.s.n.m.',
  benefits: [],
  shelfLife: '14 - 18 días en refrigeración',
  inStock: true,
  popular: false,
};

function ProductFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial: ProductDoc | null;
  onClose: () => void;
  onSave: (data: Omit<ProductDoc, 'id'>) => Promise<void>;
}) {
  const [form, setForm] = useState<Omit<ProductDoc, 'id'>>(initial ? { ...initial } : { ...emptyProduct });
  const [benefitsText, setBenefitsText] = useState((initial?.benefits || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim() || !form.presentation.trim() || form.standardPrice <= 0) {
      setError('Nombre, presentación y precio son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        pricePerGram: form.defaultGramUnit > 0 ? Math.round(form.standardPrice / form.defaultGramUnit) : 0,
        benefits: benefitsText.split(',').map(b => b.trim()).filter(Boolean),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#2F183C]">{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-3 py-2">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold text-stone-500">Nombre</span>
            <input
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-stone-500">Presentación</span>
            <input
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              placeholder="Estuche 250g"
              value={form.presentation}
              onChange={e => setForm({ ...form, presentation: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-stone-500">Categoría</span>
            <select
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as ProductDoc['category'] })}
            >
              <option value="frescos">Frescos</option>
              <option value="jumbo">Jumbo</option>
              <option value="familiar">Familiar</option>
              <option value="congelados">Congelados</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-stone-500">Precio (COP)</span>
            <input
              type="number"
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              value={form.standardPrice || ''}
              onChange={e => setForm({ ...form, standardPrice: Number(e.target.value) })}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-stone-500">Gramaje (g)</span>
            <input
              type="number"
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              value={form.defaultGramUnit || ''}
              onChange={e => setForm({ ...form, defaultGramUnit: Number(e.target.value) })}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold text-stone-500">Tagline (frase corta)</span>
            <input
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold text-stone-500">Descripción</span>
            <textarea
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold text-stone-500">Beneficios (separados por coma)</span>
            <input
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              value={benefitsText}
              onChange={e => setBenefitsText(e.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold text-stone-500">URL de imagen</span>
            <input
              className="mt-1 w-full border border-stone-300 rounded-xl px-3 py-2"
              value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={e => setForm({ ...form, inStock: e.target.checked })}
            />
            <span className="font-semibold text-stone-700">En stock</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#2F183C] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

type AdminTab = 'resumen' | 'pedidos' | 'productos' | 'clientes' | 'equipo';

/** Which team roles can open each tab. Phase 2 refines this per workflow step. */
const TAB_ROLES: Record<AdminTab, UserRole[]> = {
  resumen: ['admin'],
  pedidos: ['admin', 'finanzas', 'poscosecha', 'contabilidad', 'asistente', 'domiciliario'],
  productos: ['admin'],
  clientes: ['admin', 'contabilidad'],
  equipo: ['admin'],
};

function TeamTab({ currentUid }: { currentUid: string }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => subscribeUsers(setUsers, err => setError('No se pudo cargar el equipo: ' + err.message)), []);

  const change = async (u: UserProfile, role: UserRole) => {
    setSaving(u.uid);
    setError('');
    try {
      await setUserRole(u.uid, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el rol.');
    } finally {
      setSaving(null);
    }
  };

  const sorted = [...users].sort((a, b) => Number(STAFF_ROLES.includes(b.role as never)) - Number(STAFF_ROLES.includes(a.role as never)) || a.email.localeCompare(b.email));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Equipo y roles</h1>
      <p className="text-sm text-stone-600">
        Quien deba entrar al panel inicia sesión una vez con Google desde <span className="font-semibold">/admin</span>; luego aparece aquí como Cliente y puedes asignarle su rol.
      </p>
      {error && (
        <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      <div className="bg-white rounded-2xl border border-[#EADBEE] overflow-x-auto shadow-xs">
        <table className="w-full text-sm">
          <thead className="bg-[#F5ECF9] text-[#2F183C] text-xs uppercase tracking-wider">
            <tr><th className="text-left px-4 py-3">Persona</th><th className="text-left px-4 py-3">Correo</th><th className="text-left px-4 py-3">Rol</th></tr>
          </thead>
          <tbody>
            {sorted.map(u => (
              <tr key={u.uid} className="border-t border-[#EADBEE]">
                <td className="px-4 py-3 font-semibold text-[#2F183C]">{u.displayName || '—'}</td>
                <td className="px-4 py-3 text-stone-600">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={saving === u.uid || u.uid === currentUid}
                    onChange={e => change(u, e.target.value as UserRole)}
                    className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm bg-white disabled:opacity-60"
                    title={u.uid === currentUid ? 'No puedes cambiar tu propio rol' : undefined}
                  >
                    {([...STAFF_ROLES, 'customer'] as UserRole[]).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-stone-400">Aún no hay personas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPanelInner() {
  const { user, role, signOut } = useAuth();
  const allowedTabs = (Object.keys(TAB_ROLES) as AdminTab[]).filter(t => role && TAB_ROLES[t].includes(role));
  const [tab, setTab] = useState<AdminTab>(allowedTabs[0] ?? 'pedidos');
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductDoc | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    setError('');
    try {
      await importCatalog();
    } catch (err) {
      setError(err instanceof Error ? 'No se pudo importar el catálogo: ' + err.message : 'No se pudo importar el catálogo.');
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    const unsubProducts = subscribeProducts(
      items => { setProducts(items); setLoadingProducts(false); },
      err => { setError('No se pudieron cargar los productos: ' + err.message); setLoadingProducts(false); }
    );
    const unsubOrders = subscribeAllOrders(
      items => { setOrders(items); setLoadingOrders(false); },
      err => { setError('No se pudieron cargar los pedidos: ' + err.message); setLoadingOrders(false); }
    );
    return () => { unsubProducts(); unsubOrders(); };
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; city: string; orders: number; total: number }>();
    orders.forEach(o => {
      const key = o.customerPhone || o.customerEmail || o.customerName;
      if (!key) return;
      const existing = map.get(key) || { name: o.customerName, phone: o.customerPhone, city: o.shippingCity, orders: 0, total: 0 };
      existing.orders += 1;
      existing.total += o.total || 0;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [orders]);

  const todayOrders = orders.filter(o => isToday(o.createdAt));
  const pendingOrders = orders.filter(o => !['entregado', 'cerrado', 'cancelado'].includes(normalizeStatus(o.status)));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const handleSaveProduct = async (data: Omit<ProductDoc, 'id'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}" del catálogo?`)) return;
    try {
      await deleteProduct(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el producto.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/92 backdrop-blur-[2px] text-stone-900 font-sans">
      <div className="bg-[#2F183C] text-[#DDA83A] text-xs sm:text-sm font-semibold text-center py-2 px-4 border-b border-[#432356]">
        Panel del equipo · {role ? ROLE_LABELS[role] : ''} · Conectado a Firestore en vivo
      </div>

      <header className="bg-[#1E0E27] text-white sticky top-0 z-30 border-b border-[#432356]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#DDA83A]">
              <ArrowLeft className="w-4 h-4" />
              Tienda
            </a>
            <span className="text-stone-600">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F183C] text-[#DDA83A] border border-[#7B4382] flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Admin Fresh Pick</p>
                <p className="text-[10px] text-[#DFCEE6]">Operaciones</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#DFCEE6]">
            <span className="hidden sm:inline truncate max-w-[14rem]">{user?.email}</span>
            <a href="/panel" className="hover:text-[#DDA83A]">Panel usuario →</a>
            <button onClick={() => signOut()} className="inline-flex items-center gap-1 font-semibold text-[#DDA83A] hover:text-white">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-2 space-y-1">
          {([
            { id: 'resumen' as const, label: 'Resumen', icon: LayoutDashboard },
            { id: 'pedidos' as const, label: 'Pedidos', icon: ShoppingBag },
            { id: 'productos' as const, label: 'Productos', icon: Box },
            { id: 'clientes' as const, label: 'Clientes', icon: Users },
            { id: 'equipo' as const, label: 'Equipo', icon: UserCog },
          ]).filter(item => allowedTabs.includes(item.id)).map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === item.id
                  ? 'bg-[#2F183C] text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-[#EADBEE] hover:bg-[#F5ECF9]'
              }`}
            >
              <item.icon className={`w-4 h-4 ${tab === item.id ? 'text-[#DDA83A]' : 'text-stone-500'}`} />
              {item.label}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-10 space-y-6">
          {tab === 'equipo' && user && <TeamTab currentUid={user.uid} />}

          {tab === 'resumen' && (
            <>
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Resumen del día</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Pedidos hoy', value: String(todayOrders.length), icon: ShoppingBag, tone: 'text-sky-700 bg-sky-50' },
                  { label: 'En curso', value: String(pendingOrders.length), icon: Clock, tone: 'text-amber-700 bg-amber-50' },
                  { label: 'Ingresos hoy', value: `$${todayRevenue.toLocaleString('es-CO')}`, icon: TrendingUp, tone: 'text-[#2F183C] bg-[#F5ECF9] border border-[#DFCEE6]' },
                  { label: 'Clientes', value: String(customers.length), icon: Users, tone: 'text-violet-700 bg-violet-50' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-2xl border border-[#EADBEE] p-4 shadow-xs">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.tone}`}>
                      <card.icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-black text-[#2F183C]">{card.value}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-[#EADBEE] p-5 shadow-xs">
                <h2 className="font-bold mb-3 text-[#2F183C] font-display">Pedidos recientes</h2>
                {loadingOrders ? (
                  <p className="text-sm text-stone-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</p>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-stone-400">Todavía no hay pedidos.</p>
                ) : (
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
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} className="border-b border-stone-50">
                            <td className="py-2.5 font-semibold text-[#2F183C]">{o.orderNumber}</td>
                            <td className="py-2.5">{o.customerName}</td>
                            <td className="py-2.5 font-bold text-[#2F183C]">${(o.total || 0).toLocaleString('es-CO')}</td>
                            <td className="py-2.5">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${stageOf(o).tone}`}>{stageOf(o).short}</span>
                            </td>
                            <td className="py-2.5 text-stone-500">{formatTime(o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'pedidos' && (
            <OrdersBoard orders={orders} loading={loadingOrders} role={role} userEmail={user?.email ?? ''} />
          )}

          {tab === 'productos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Productos</h1>
                <button
                  onClick={() => setShowNewProduct(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F183C] text-white text-sm font-bold"
                >
                  <Plus className="w-4 h-4" /> Nuevo producto
                </button>
              </div>
              {loadingProducts ? (
                <p className="text-sm text-stone-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</p>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#EADBEE] p-8 text-center space-y-3">
                  <p className="text-sm text-stone-600">
                    Aquí gestionas los productos que ve el público. Tu tienda hoy muestra {FRUITS_DATA.length} productos del catálogo original; impórtalos para poder editar precios, fotos, textos y disponibilidad.
                  </p>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60"
                  >
                    {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Importar los {FRUITS_DATA.length} productos publicados
                  </button>
                  <p className="text-xs text-stone-400">La tienda no cambia al importar: se verá igual hasta que edites algún producto.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(f => (
                    <div key={f.id} className="bg-white rounded-2xl border border-[#EADBEE] p-4 flex gap-4 shadow-xs">
                      <img src={f.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-[#EADBEE]" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate text-[#2F183C]">{f.name}</p>
                        <p className="text-xs text-stone-500">{f.presentation}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-black text-[#2F183C]">${f.standardPrice.toLocaleString('es-CO')}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${f.inStock ? 'bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]' : 'bg-red-100 text-red-800'}`}>
                            {f.inStock ? 'Stock' : 'Agotado'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => setEditingProduct(f)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7B4382] hover:underline"
                          >
                            <Pencil className="w-3 h-3" /> Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(f.id, f.name)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                          >
                            <Trash2 className="w-3 h-3" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'clientes' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Clientes</h1>
              {customers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#EADBEE] p-6 text-center text-sm text-stone-500">
                  Todavía no hay clientes. Aparecerán aquí en cuanto se registre el primer pedido.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#EADBEE] p-5 space-y-3">
                  {customers.map(c => (
                    <div key={c.phone + c.name} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <div>
                        <p className="font-semibold text-sm text-[#2F183C]">{c.name}</p>
                        <p className="text-xs text-stone-500">{c.city} · {c.phone} · {c.orders} pedido{c.orders !== 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-xs font-bold text-[#2F183C] bg-[#F5ECF9] border border-[#DFCEE6] px-2 py-1 rounded-lg">
                        ${c.total.toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-stone-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Lista generada a partir de los pedidos registrados (sin login todavía no hay cuentas propias).
              </p>
            </div>
          )}
        </main>
      </div>

      {(editingProduct || showNewProduct) && (
        <ProductFormModal
          initial={editingProduct}
          onClose={() => { setEditingProduct(null); setShowNewProduct(false); }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

export default function AdminPanel() {
  return (
    <AuthGate staffOnly title="Panel del equipo Fresh Pick">
      <AdminPanelInner />
    </AuthGate>
  );
}
