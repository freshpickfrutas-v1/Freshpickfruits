import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingBag, ArrowLeft, Leaf,
  TrendingUp, Clock, AlertCircle, Box, Pencil, Trash2, Plus, X, Loader2, LogOut, UserCog, Repeat, Newspaper, ClipboardCheck
} from 'lucide-react';
import {
  subscribeProducts, addProduct, updateProduct, deleteProduct,
  subscribeAllOrders, subscribeUsers, setUserRole, ProductDoc,
} from '../lib/firestore';
import { FirestoreOrder, OrderStatus, ROLE_LABELS, STAFF_ROLES, SubscriptionDoc, UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthGate } from '../components/AuthGate';
import { usePageMeta } from '../lib/seo';
import { OrdersBoard } from '../components/OrdersBoard';
import { stageOf, normalizeStatus } from '../lib/orderFlow';
import { importCatalog } from '../lib/catalog';
import { SubscriptionsBoard } from '../components/SubscriptionsBoard';
import { subscribeAllSubscriptions } from '../lib/subscriptions';
import { FRUITS_DATA } from '../data/mockData';
import { useFullArticleIndex, useFullRecipeIndex } from '../data/content';
import { FEATURED_VIDEOS } from '../data/featuredVideos';
import { ContentKind, hideContent, restoreContent, isHidden, useHiddenContent, allCustomVideos, addCustomVideo, youtubeIdFrom } from '../lib/hiddenContent';

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

type AdminTab = 'resumen' | 'pedidos' | 'suscripciones' | 'productos' | 'aprobaciones' | 'contenido' | 'clientes' | 'equipo';

/** Which team roles can open each tab. Phase 2 refines this per workflow step. */
const TAB_ROLES: Record<AdminTab, UserRole[]> = {
  resumen: ['admin'],
  pedidos: ['admin', 'finanzas', 'poscosecha', 'contabilidad', 'asistente', 'domiciliario'],
  suscripciones: ['admin', 'finanzas', 'asistente', 'contabilidad'],
  productos: ['admin'],
  aprobaciones: ['admin'],
  contenido: ['admin'],
  clientes: ['admin', 'contabilidad'],
  equipo: ['admin'],
};

function SubscriptionsTab({ role, email }: { role: UserRole | null; email: string }) {
  const [items, setItems] = useState<SubscriptionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => subscribeAllSubscriptions(
    list => { setItems(list); setLoading(false); },
    err => { setError('No se pudieron cargar las suscripciones: ' + err.message); setLoading(false); }
  ), []);

  return (
    <>
      {error && (
        <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      <SubscriptionsBoard items={items} loading={loading} role={role} userEmail={email} />
    </>
  );
}

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

function ContentTab() {
  useHiddenContent();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<ContentKind>('noticia');

  const articles = useFullArticleIndex() ?? [];
  const recipes = useFullRecipeIndex() ?? [];
  const custom = allCustomVideos();
  const videos = [
    ...custom.map(v => ({ slug: v.id, title: v.title, date: `${v.seccion === 'noticias' ? 'Noticias' : 'Recetas'} · agregado por enlace` })),
    ...FEATURED_VIDEOS.noticias.map(v => ({ slug: v.id, title: v.title, date: `Noticias · ${v.channel}` })),
    ...FEATURED_VIDEOS.recetas.map(v => ({ slug: v.id, title: v.title, date: `Recetas · ${v.channel}` })),
  ];
  const [link, setLink] = useState('');
  const [linkSection, setLinkSection] = useState<'noticias' | 'recetas'>('noticias');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkMsg, setLinkMsg] = useState('');

  const addByLink = async () => {
    const id = youtubeIdFrom(link);
    if (!id) { setLinkMsg('Ese enlace no parece de YouTube. Pega la dirección del video (youtube.com/watch?v=… o youtu.be/…).'); return; }
    setBusy('nuevo-video');
    setLinkMsg('');
    try {
      // El título y el canal salen de YouTube (oEmbed); si no responde, se usa el que escribas.
      let title = linkTitle.trim();
      let channel = 'YouTube';
      try {
        const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`);
        if (r.ok) { const j = await r.json(); title = title || String(j.title ?? ''); channel = String(j.author_name ?? channel); }
      } catch { /* sin oEmbed: se queda con lo escrito */ }
      if (!title) { setLinkMsg('No pude leer el título del video. Escríbelo en el campo de título y vuelve a intentar.'); return; }
      await addCustomVideo({ id, seccion: linkSection, title, channel });
      setLink(''); setLinkTitle('');
      setLinkMsg(`Listo: "${title}" ya aparece en ${linkSection === 'noticias' ? 'Noticias' : 'Recetas'}.`);
    } catch (err) {
      setLinkMsg(err instanceof Error ? `No se pudo guardar: ${err.message}` : 'No se pudo guardar el video.');
    } finally {
      setBusy('');
    }
  };
  const items = view === 'noticia'
    ? articles.map(a => ({ slug: a.slug, title: a.title, date: a.date }))
    : view === 'receta'
      ? recipes.map(r => ({ slug: r.slug, title: r.title, date: r.date ?? '' }))
      : videos;
  const sortedItems = view === 'video' ? items : [...items].sort((a, b) => b.date.localeCompare(a.date));

  const toggle = async (slug: string, title: string, hide: boolean) => {
    if (hide && !window.confirm(`¿Eliminar "${title}" del sitio? Dejará de verse para los clientes; podrás restaurarlo desde aquí.`)) return;
    setBusy(slug);
    setError('');
    try {
      if (hide) await hideContent(view, slug, title);
      else await restoreContent(view, slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['noticia', 'receta', 'video'] as ContentKind[]).map(k => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer ${view === k ? 'bg-[#2F183C] text-white border-[#2F183C]' : 'bg-white text-[#2F183C] border-[#DFCEE6]'}`}
          >
            {k === 'noticia' ? `Noticias (${articles.length})` : k === 'receta' ? `Recetas (${recipes.length})` : `Videos (${videos.length})`}
          </button>
        ))}
      </div>
      {view === 'video' && (
        <div className="bg-white rounded-2xl border border-[#EADBEE] p-4 space-y-3">
          <p className="text-sm font-bold text-[#2F183C]">Agregar un video con su enlace de YouTube</p>
          <div className="grid sm:grid-cols-[1fr_auto] gap-2">
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7B4382]"
            />
            <select
              value={linkSection}
              onChange={e => setLinkSection(e.target.value as 'noticias' | 'recetas')}
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="noticias">Va en Noticias</option>
              <option value="recetas">Va en Recetas</option>
            </select>
          </div>
          <input
            value={linkTitle}
            onChange={e => setLinkTitle(e.target.value)}
            placeholder="Título (opcional: se toma del video)"
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7B4382]"
          />
          <button
            type="button"
            onClick={addByLink}
            disabled={!link.trim() || busy === 'nuevo-video'}
            className="px-4 py-2 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-50 cursor-pointer"
          >
            {busy === 'nuevo-video' ? 'Agregando…' : 'Agregar video'}
          </button>
          {linkMsg && <p className="text-xs text-stone-600">{linkMsg}</p>}
          <p className="text-xs text-stone-500">Revisa que el video sea de arándanos y de un canal confiable antes de agregarlo: aquí no pasa por el filtro automático.</p>
        </div>
      )}
      <p className="text-xs text-stone-500">
        La biblioteca solo crece: la automatización nunca borra nada. "Eliminar" quita el contenido del sitio y se puede restaurar cuando quieras.
      </p>
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
      <div className="bg-white rounded-2xl border border-[#EADBEE] divide-y divide-[#F0E6F3]">
        {sortedItems.map(item => {
          const off = isHidden(view, item.slug);
          return (
            <div key={item.slug} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${off ? 'text-stone-400 line-through' : 'text-[#2F183C]'}`}>
                  {view === 'video'
                    ? <a href={`https://www.youtube.com/watch?v=${item.slug}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#DFCEE6] hover:text-[#7B4382]" title="Abrir el video en YouTube para revisarlo">{item.title}</a>
                    : item.title}
                </p>
                <p className="text-xs text-stone-500">
                  {item.date}{off ? ' · eliminado del sitio' : ''}
                  {view !== 'video' && !off && (
                    <> · <a href={`/${view === 'noticia' ? 'noticias' : 'recetas'}/${item.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#7B4382] underline">Ver en el sitio</a></>
                  )}
                </p>
              </div>
              <button
                disabled={busy === item.slug}
                onClick={() => toggle(item.slug, item.title, !off)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 ${off ? 'border border-[#DFCEE6] text-[#2F183C]' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {busy === item.slug ? '...' : off ? 'Restaurar' : 'Eliminar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ReviewPreview {
  title?: string; excerpt?: string; category?: string; channel?: string; videoId?: string; seccion?: string;
  blocks?: { type: string; text?: string; items?: string[] }[];
  ingredients?: unknown[]; steps?: unknown[]; tips?: unknown[];
  fuentes?: { titulo: string; url: string; medio: string }[];
}
interface ReviewItem {
  number: number; tipo: 'noticia' | 'receta' | 'video'; title: string; estado: 'pendiente' | 'aprobado' | 'rechazado';
  subidoEn: string; aprobadoEn: string | null; cerradoEn: string | null; url: string; preview?: ReviewPreview | null;
}

const fmtDate = (iso: string | null) => iso
  ? new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';
const TIPO_LABEL = { noticia: 'Noticia', receta: 'Receta', video: 'Video' } as const;
const asText = (v: unknown) => (typeof v === 'string' ? v : v && typeof v === 'object' ? Object.values(v as Record<string, unknown>).filter(x => typeof x === 'string').join(' · ') : String(v));

/** Borradores de noticias, recetas y videos: se revisan, se aprueban (se publican) o se rechazan desde aquí. */
function ReviewTab() {
  const { user } = useAuth();
  const [data, setData] = useState<{ pendientes: ReviewItem[]; historial: ReviewItem[] } | null>(null);
  const [state, setState] = useState<'cargando' | 'ok' | 'no_configurado' | 'error'>('cargando');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const call = async (init?: RequestInit) => {
    const token = await user?.getIdToken();
    const res = await fetch('/api/admin/revision', { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}) } });
    const json = await res.json().catch(() => ({}));
    if (json.error === 'no_configurado') { setState('no_configurado'); return null; }
    if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
    return json;
  };

  const load = async () => {
    setState('cargando');
    setError('');
    try {
      const json = await call();
      if (json) { setData(json); setState('ok'); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar.');
      setState('error');
    }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const resolve = async (item: ReviewItem, accion: 'aprobar' | 'rechazar') => {
    const pregunta = accion === 'aprobar'
      ? `¿Aprobar y publicar "${item.title}"? Saldrá en el sitio en unos minutos.`
      : `¿Rechazar "${item.title}"? No se publicará.`;
    if (!window.confirm(pregunta)) return;
    setBusy(item.number);
    setError('');
    try {
      await call({ method: 'POST', body: JSON.stringify({ accion, number: item.number }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar.');
    } finally {
      setBusy(null);
    }
  };

  if (state === 'no_configurado') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900 space-y-2">
        <p className="font-bold">Falta conectar las aprobaciones con GitHub.</p>
        <p>Crea un token de GitHub (fine-grained) para este repositorio con permisos de lectura y escritura en <strong>Contents</strong> y <strong>Pull requests</strong>, y guárdalo en Vercel con el nombre <code>GITHUB_TOKEN_REVISION</code> (Production, Sensitive). Luego haz Redeploy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Todo lo que genera el sistema (noticias, recetas y videos) espera aquí. Se registra cuándo se subió para aprobación y cuándo se aprobó y publicó.</p>
        <button onClick={() => void load()} className="shrink-0 px-3 py-1.5 rounded-lg border border-[#DFCEE6] text-xs font-bold text-[#2F183C] cursor-pointer">Actualizar</button>
      </div>
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
      {state === 'cargando' && <p className="text-sm text-stone-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cargando borradores…</p>}

      {data && (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#7B4382]">Por aprobar ({data.pendientes.length})</h2>
            {data.pendientes.length === 0 && <p className="bg-white rounded-2xl border border-[#EADBEE] p-5 text-sm text-stone-500">No hay nada pendiente.</p>}
            {data.pendientes.map(item => (
              <div key={item.number} className="bg-white rounded-2xl border border-[#EADBEE] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-[#7B4382]">{TIPO_LABEL[item.tipo]}</p>
                    <p className="font-bold text-[#2F183C]">{item.title}</p>
                    <p className="text-xs text-stone-500">Subido para aprobación: {fmtDate(item.subidoEn)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button onClick={() => setOpen(open === item.number ? null : item.number)} className="px-3 py-1.5 rounded-lg border border-[#DFCEE6] text-xs font-bold text-[#2F183C] cursor-pointer">
                      {open === item.number ? 'Ocultar' : 'Revisar'}
                    </button>
                    <button disabled={busy === item.number} onClick={() => void resolve(item, 'aprobar')} className="px-3 py-1.5 rounded-lg bg-[#2F183C] text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
                      {busy === item.number ? '…' : 'Aprobar y publicar'}
                    </button>
                    <button disabled={busy === item.number} onClick={() => void resolve(item, 'rechazar')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">Rechazar</button>
                  </div>
                </div>

                {open === item.number && (
                  <div className="border-t border-[#F0E6F3] pt-3 space-y-3 text-sm text-stone-700">
                    {!item.preview && <p className="text-stone-500">No se pudo cargar la vista previa. <a className="underline text-[#7B4382]" href={item.url} target="_blank" rel="noopener noreferrer">Ábrelo en GitHub</a>.</p>}
                    {item.preview?.videoId && (
                      <div className="space-y-1">
                        <div className="aspect-video max-w-md rounded-xl overflow-hidden bg-stone-100">
                          <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${item.preview.videoId}`} title={item.title} allowFullScreen />
                        </div>
                        <p className="text-xs">Canal: {item.preview.channel} · Va en {item.preview.seccion === 'recetas' ? 'Recetas' : 'Noticias'} · <a className="underline text-[#7B4382]" href={`https://www.youtube.com/watch?v=${item.preview.videoId}`} target="_blank" rel="noopener noreferrer">Abrir en YouTube</a></p>
                      </div>
                    )}
                    {item.preview?.excerpt && <p className="italic">{item.preview.excerpt}</p>}
                    {item.preview?.blocks?.map((b, i) => b.type === 'h2' || b.type === 'h3'
                      ? <p key={i} className="font-bold text-[#2F183C]">{b.text}</p>
                      : b.items ? <ul key={i} className="list-disc pl-5">{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>
                      : <p key={i}>{b.text}</p>)}
                    {item.preview?.ingredients && <div><p className="font-bold text-[#2F183C]">Ingredientes</p><ul className="list-disc pl-5">{item.preview.ingredients.map((t, i) => <li key={i}>{asText(t)}</li>)}</ul></div>}
                    {item.preview?.steps && <div><p className="font-bold text-[#2F183C]">Preparación</p><ol className="list-decimal pl-5">{item.preview.steps.map((t, i) => <li key={i}>{asText(t)}</li>)}</ol></div>}
                    {item.preview?.fuentes && item.preview.fuentes.length > 0 && (
                      <div><p className="font-bold text-[#2F183C]">Fuentes</p><ul className="list-disc pl-5">{item.preview.fuentes.map((f, i) => <li key={i}><a className="underline text-[#7B4382]" href={f.url} target="_blank" rel="noopener noreferrer">{f.titulo}</a> · {f.medio}</li>)}</ul></div>
                    )}
                    <p className="text-xs"><a className="underline text-[#7B4382]" href={item.url} target="_blank" rel="noopener noreferrer">Ver el borrador completo en GitHub (con la vista previa del sitio)</a></p>
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#7B4382]">Historial</h2>
            <div className="bg-white rounded-2xl border border-[#EADBEE] overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F5ECF9] text-[#2F183C]">
                  <tr>
                    <th className="text-left px-3 py-2">Tipo</th>
                    <th className="text-left px-3 py-2">Título</th>
                    <th className="text-left px-3 py-2">Subido para aprobación</th>
                    <th className="text-left px-3 py-2">Aprobado y publicado</th>
                    <th className="text-left px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6F3]">
                  {data.historial.map(h => (
                    <tr key={h.number}>
                      <td className="px-3 py-2">{TIPO_LABEL[h.tipo]}</td>
                      <td className="px-3 py-2 font-semibold text-[#2F183C]">{h.title}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(h.subidoEn)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{h.estado === 'aprobado' ? fmtDate(h.aprobadoEn) : '—'}</td>
                      <td className="px-3 py-2">{h.estado === 'aprobado' ? 'Publicado' : `Rechazado ${fmtDate(h.cerradoEn)}`}</td>
                    </tr>
                  ))}
                  {data.historial.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-stone-400">Aún no hay historial.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
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
                <p className="text-xs text-[#DFCEE6]">Operaciones</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#DFCEE6]">
            <span className="hidden sm:inline truncate max-w-[14rem]">{user?.email}</span>
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
            { id: 'suscripciones' as const, label: 'Suscripciones', icon: Repeat },
            { id: 'productos' as const, label: 'Productos', icon: Box },
            { id: 'aprobaciones' as const, label: 'Aprobaciones', icon: ClipboardCheck },
            { id: 'contenido' as const, label: 'Noticias y recetas', icon: Newspaper },
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

          {tab === 'aprobaciones' && <ReviewTab />}

          {tab === 'contenido' && <ContentTab />}

          {tab === 'suscripciones' && <SubscriptionsTab role={role} email={user?.email ?? ''} />}

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
                              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${stageOf(o).tone}`}>{stageOf(o).short}</span>
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
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${f.inStock ? 'bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]' : 'bg-red-100 text-red-800'}`}>
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
  usePageMeta({ title: 'Panel del equipo | Fresh Pick', description: 'Administración de Fresh Pick.', path: '/admin', noindex: true });
  return (
    <AuthGate staffOnly title="Panel del equipo Fresh Pick">
      <AdminPanelInner />
    </AuthGate>
  );
}
