import React, { useMemo, useState } from 'react';
import { X, Loader2, AlertCircle, MessageCircle, Phone, MapPin, Lock, CalendarClock, TrendingUp, Users, PauseCircle, Inbox } from 'lucide-react';
import { SubscriptionDoc, SubscriptionStatus, UserRole, ROLE_LABELS } from '../types';
import { SUB_STATUS, SUB_MANAGERS, applySubscriptionAction, nextTuesday, SubscriptionActionKey } from '../lib/subscriptions';
import { whatsappLink } from '../lib/orderFlow';

const money = (n: number) => `$${(n || 0).toLocaleString('es-CO')}`;
const day = (iso?: string) => (iso ? new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const Chip: React.FC<{ status: SubscriptionStatus }> = ({ status }) => (
  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${SUB_STATUS[status].tone}`}>{SUB_STATUS[status].label}</span>
);

const RequestBadge: React.FC<{ sub: SubscriptionDoc }> = ({ sub }) =>
  sub.customerRequest ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
      Cliente pide {sub.customerRequest === 'pausar' ? 'pausar' : 'cancelar'}
    </span>
  ) : null;

const SubModal: React.FC<{ sub: SubscriptionDoc; role: UserRole | null; by: string; onClose: () => void }> = ({ sub, role, by, onClose }) => {
  const canManage = role !== null && SUB_MANAGERS.includes(role);
  const [date, setDate] = useState(sub.nextDelivery || nextTuesday());
  const [notes, setNotes] = useState(sub.notes ?? '');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const run = async (action: SubscriptionActionKey) => {
    if (action === 'cancelar' && !window.confirm('¿Cancelar esta suscripción?')) return;
    setBusy(action); setError('');
    try {
      await applySubscriptionAction(sub, action, by, { date, notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.');
    } finally { setBusy(null); }
  };

  const btn = (key: SubscriptionActionKey, label: string, tone = 'bg-[#2F183C] text-white') => (
    <button
      key={key}
      onClick={() => run(key)}
      disabled={!canManage || busy !== null}
      title={!canManage ? 'Solo administrador, finanzas o asistente pueden cambiarla' : undefined}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-45 disabled:cursor-not-allowed ${tone}`}
    >
      {busy === key ? <Loader2 className="w-4 h-4 animate-spin" /> : !canManage ? <Lock className="w-3.5 h-3.5" /> : null}
      {label}
    </button>
  );

  const waText = `¡Hola, ${sub.customerName.split(' ')[0] || 'cliente'}! 🌿 Te escribimos de Fresh Pick por tu suscripción al ${sub.planTitle}.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#EADBEE] px-5 py-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#2F183C]">{sub.planTitle}</h2>
            <div className="flex flex-wrap gap-1.5 mt-0.5"><Chip status={sub.status} /><RequestBadge sub={sub} /></div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          <section className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="font-bold text-[#2F183C]">{sub.customerName}</p>
              {sub.customerPhone && <p className="flex items-center gap-1.5 text-stone-600"><Phone className="w-3.5 h-3.5" /> {sub.customerPhone}</p>}
              {sub.customerEmail && <p className="text-stone-600">{sub.customerEmail}</p>}
              {sub.shippingAddress
                ? <p className="flex items-start gap-1.5 text-stone-600"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {sub.shippingAddress}, {sub.shippingCity}</p>
                : <p className="text-xs text-amber-700">Sin dirección guardada: confírmala con el cliente.</p>}
            </div>
            <div className="space-y-1 text-stone-700">
              <p>📦 {sub.planWeight}</p>
              <p className="text-xs text-stone-500">{sub.deliveryFrequency}</p>
              <p className="font-black text-[#2F183C]">{money(sub.priceMonth)} <span className="text-xs font-normal text-stone-500">COP / mes</span></p>
              <p className="text-xs text-stone-500">Inicio: {day(sub.startDate)} · Próxima entrega: <span className="font-semibold text-stone-700">{day(sub.nextDelivery)}</span></p>
            </div>
          </section>

          {sub.status !== 'cancelada' && (
            <section className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382]">Gestionar</p>
              {(sub.status === 'solicitada' || sub.status === 'pausada' || sub.status === 'activa') && (
                <label className="flex items-center gap-2 text-xs text-stone-600">
                  <CalendarClock className="w-4 h-4 text-[#7B4382]" />
                  {sub.status === 'activa' ? 'Próxima entrega' : 'Fecha de entrega'}
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm" />
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                {sub.status === 'solicitada' && btn('activar', 'Activar suscripción')}
                {sub.status === 'pausada' && btn('reanudar', 'Reanudar')}
                {sub.status === 'activa' && btn('fecha', 'Cambiar fecha', 'bg-white text-[#2F183C] border border-[#2F183C]')}
                {sub.status === 'activa' && btn('pausar', 'Pausar', 'bg-white text-amber-800 border border-amber-300')}
                {btn('cancelar', 'Cancelar', 'bg-white text-red-700 border border-red-200')}
              </div>
              {error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
            </section>
          )}

          <section className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382]">Notas internas</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} disabled={!canManage} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm disabled:bg-stone-50" placeholder="Acuerdos con el cliente, horario preferido…" />
            {canManage && notes !== (sub.notes ?? '') && (
              <button onClick={() => run('notas')} disabled={busy !== null} className="text-xs font-bold text-[#7B4382] underline">Guardar notas</button>
            )}
          </section>

          {sub.customerPhone && (
            <a href={whatsappLink(sub.customerPhone, waText)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25A244] text-white text-xs font-bold">
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          )}

          {!!sub.history?.length && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382] mb-1.5">Historial</p>
              <ol className="space-y-1 text-xs text-stone-600">
                {[...sub.history].reverse().map((h, i) => (
                  <li key={i}><span className="text-stone-400">{new Date(h.at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span> · <span className="font-semibold">{h.action}</span>{h.note ? ` (${h.note})` : ''} · {h.by}</li>
                ))}
              </ol>
            </section>
          )}
          {role && !canManage && <p className="text-xs text-stone-400">Tu rol ({ROLE_LABELS[role]}) puede ver las suscripciones, no cambiarlas.</p>}
        </div>
      </div>
    </div>
  );
};

export const SubscriptionsBoard: React.FC<{ items: SubscriptionDoc[]; loading: boolean; role: UserRole | null; userEmail: string }> = ({ items, loading, role, userEmail }) => {
  const [filter, setFilter] = useState<SubscriptionStatus | 'todas' | 'pedidos'>('todas');
  const [openId, setOpenId] = useState<string | null>(null);

  const active = items.filter(i => i.status === 'activa');
  const mrr = active.reduce((s, i) => s + (i.priceMonth || 0), 0);
  const requested = items.filter(i => i.status === 'solicitada');
  const paused = items.filter(i => i.status === 'pausada');
  const withRequest = items.filter(i => i.customerRequest && i.status !== 'cancelada');

  const visible = useMemo(() => {
    if (filter === 'todas') return items;
    if (filter === 'pedidos') return withRequest;
    return items.filter(i => i.status === filter);
  }, [items, filter, withRequest]);

  const open = items.find(i => i.id === openId) ?? null;
  const cards = [
    { label: 'Activas', value: String(active.length), icon: Users, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Ingreso mensual recurrente', value: money(mrr), icon: TrendingUp, tone: 'text-[#2F183C] bg-[#F5ECF9] border border-[#DFCEE6]' },
    { label: 'Por activar', value: String(requested.length), icon: Inbox, tone: 'text-sky-700 bg-sky-50' },
    { label: 'Pausadas', value: String(paused.length), icon: PauseCircle, tone: 'text-amber-700 bg-amber-50' },
  ];
  const filters: { id: typeof filter; label: string }[] = [
    { id: 'todas', label: `Todas (${items.length})` },
    { id: 'solicitada', label: `Por activar (${requested.length})` },
    { id: 'activa', label: `Activas (${active.length})` },
    { id: 'pausada', label: `Pausadas (${paused.length})` },
    { id: 'cancelada', label: 'Canceladas' },
    { id: 'pedidos', label: `Piden cambio (${withRequest.length})` },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Suscripciones</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#EADBEE] p-4 shadow-xs">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${c.tone}`}><c.icon className="w-4 h-4" /></div>
            <p className="text-xl font-black text-[#2F183C]">{c.value}</p>
            <p className="text-xs text-stone-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filter === f.id ? 'bg-[#2F183C] text-white border-[#2F183C]' : 'bg-white text-stone-600 border-[#DFCEE6]'}`}>{f.label}</button>
        ))}
      </div>

      {loading && <p className="text-sm text-stone-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</p>}
      {!loading && visible.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#EADBEE] p-8 text-center text-sm text-stone-500">
          {items.length === 0 ? 'Todavía no hay suscripciones. Cuando un cliente elija un plan en su panel, aparecerá aquí.' : 'No hay suscripciones con este filtro.'}
        </div>
      )}

      {visible.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EADBEE] overflow-x-auto shadow-xs">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-[#FAF7F0] text-xs text-stone-500 text-left">
              <tr>{['Cliente', 'Plan', 'Frecuencia', 'Mensual', 'Estado', 'Próxima entrega', 'Solicitud'].map(h => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr key={s.id} onClick={() => setOpenId(s.id)} className="border-t border-stone-100 hover:bg-[#F5ECF9]/40 cursor-pointer">
                  <td className="px-3 py-3">{s.customerName}<br /><span className="text-xs text-stone-500">{s.customerPhone || s.customerEmail}</span></td>
                  <td className="px-3 py-3 font-semibold text-[#2F183C]">{s.planTitle}</td>
                  <td className="px-3 py-3 text-xs text-stone-600">{s.deliveryFrequency}</td>
                  <td className="px-3 py-3 font-bold">{money(s.priceMonth)}</td>
                  <td className="px-3 py-3"><Chip status={s.status} /></td>
                  <td className="px-3 py-3 text-xs">{day(s.nextDelivery)}</td>
                  <td className="px-3 py-3"><RequestBadge sub={s} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && <SubModal key={open.id} sub={open} role={role} by={userEmail} onClose={() => setOpenId(null)} />}
    </div>
  );
};
