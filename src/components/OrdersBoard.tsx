import React, { useMemo, useState } from 'react';
import {
  LayoutGrid, Table2, X, Plus, Loader2, AlertCircle, FileText, MessageCircle,
  CheckCircle2, Clock, Phone, MapPin, Trash2, Lock, ExternalLink
} from 'lucide-react';
import { FirestoreOrder, FirestoreOrderItem, BillingData, ROLE_LABELS, UserRole } from '../types';
import { applyOrderAction, createOrder, OrderActionKey } from '../lib/firestore';
import { mapsLink } from '../lib/maps';
import {
  STAGES, CANCELLED, stageOf, normalizeStatus, actionsFor, canDo, isMine,
  billingLabel, invoiceLabel, messageFor, whatsappLink, FlowAction
} from '../lib/orderFlow';

const money = (n: number) => `$${(n || 0).toLocaleString('es-CO')}`;
const when = (iso: string) => (iso ? new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const itemsText = (o: FirestoreOrder) => o.items?.map(i => `${i.quantityText} ${i.name}`).join(', ') || 'Pedido personalizado';

const Badge: React.FC<{ tone: string; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tone}`}>{children}</span>
);

const PaymentBadge: React.FC<{ order: FirestoreOrder }> = ({ order }) =>
  order.paymentStatus === 'verificado'
    ? <Badge tone="bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Pago verificado</Badge>
    : <Badge tone="bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pago pendiente</Badge>;

const InvoiceBadge: React.FC<{ order: FirestoreOrder }> = ({ order }) =>
  order.invoiceStatus === 'emitida'
    ? <Badge tone="bg-emerald-100 text-emerald-800"><FileText className="w-3 h-3" /> {invoiceLabel(order)}</Badge>
    : <Badge tone="bg-stone-100 text-stone-600"><FileText className="w-3 h-3" /> {invoiceLabel(order)}</Badge>;

type Origin = 'cuenta' | 'invitado' | 'manual';

/** Where the order came from: a signed-in customer, a guest on the web, or a manual order taken by the team. */
const originOf = (o: FirestoreOrder): Origin => (o.paymentMethod === 'manual' ? 'manual' : o.userId ? 'cuenta' : 'invitado');

const ORIGIN_LABEL: Record<Origin, { text: string; tone: string }> = {
  cuenta: { text: 'Web · con cuenta', tone: 'bg-[#F5ECF9] text-[#2F183C] border border-[#DFCEE6]' },
  invitado: { text: 'Web · invitado', tone: 'bg-orange-50 text-orange-800 border border-orange-200' },
  manual: { text: 'Manual (WhatsApp/correo)', tone: 'bg-sky-50 text-sky-800 border border-sky-200' },
};

const OriginBadge: React.FC<{ order: FirestoreOrder }> = ({ order }) => {
  const o = ORIGIN_LABEL[originOf(order)];
  return <Badge tone={o.tone}>{o.text}</Badge>;
};

// ---------- Order card (Kanban) ----------
const OrderCard: React.FC<{ order: FirestoreOrder; mine: boolean; onOpen: () => void }> = ({ order, mine, onOpen }) => (
  <button
    onClick={onOpen}
    className={`w-full text-left bg-white rounded-xl border p-3 shadow-xs hover:shadow-md transition-shadow space-y-1.5 ${mine ? 'border-[#DDA83A] ring-2 ring-[#DDA83A]/40' : 'border-[#EADBEE]'}`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="font-bold text-sm text-[#2F183C]">{order.orderNumber}</span>
      <span className="text-sm font-black text-[#2F183C]">{money(order.total)}</span>
    </div>
    <p className="text-xs font-semibold text-stone-800 truncate">{order.customerName}</p>
    <p className="text-[11px] text-stone-500 truncate">{order.customerPhone}</p>
    <p className="text-[11px] text-stone-600 line-clamp-2">{itemsText(order)}</p>
    <div className="flex flex-wrap gap-1 pt-1">
      <PaymentBadge order={order} />
      <InvoiceBadge order={order} />
      <OriginBadge order={order} />
    </div>
    {mine && <p className="text-[10px] font-bold text-[#C59328]">● Te toca a ti</p>}
  </button>
);

// ---------- Detail modal ----------
const OrderModal: React.FC<{
  order: FirestoreOrder; role: UserRole | null; by: string; onClose: () => void;
}> = ({ order, role, by, onClose }) => {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [invNumber, setInvNumber] = useState(order.invoiceNumber ?? '');
  const [invUrl, setInvUrl] = useState(order.invoiceUrl ?? '');
  const [showInvoice, setShowInvoice] = useState(false);

  const stage = stageOf(order);
  const actions = actionsFor(order);
  const msg = messageFor(order);

  const run = async (a: FlowAction) => {
    if (a.key === 'registrar_factura' && !showInvoice) { setShowInvoice(true); return; }
    if (a.key === 'cancelar' && !window.confirm('¿Cancelar este pedido?')) return;
    setBusy(a.key); setError('');
    try {
      await applyOrderAction(order, a.key as OrderActionKey, by, { number: invNumber, url: invUrl });
      setShowInvoice(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.');
    } finally { setBusy(null); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#EADBEE] px-5 py-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#2F183C]">{order.orderNumber}</h2>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${stage.tone}`}>
              {stage.step ? `${stage.step}. ` : ''}{stage.label}
            </span>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          <section className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="font-bold text-[#2F183C]">{order.customerName}</p>
              <p className="flex items-center gap-1.5 text-stone-600"><Phone className="w-3.5 h-3.5" /> {order.customerPhone}</p>
              {order.customerEmail && <p className="text-stone-600">{order.customerEmail}</p>}
              <p className="flex items-start gap-1.5 text-stone-600"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {order.shippingAddress}{order.shippingComplement ? ` · ${order.shippingComplement}` : ''}, {order.shippingCity}</p>
              <a
                href={order.shippingMapsUrl || mapsLink({ lat: order.shippingLat, lng: order.shippingLng, address: order.shippingAddress })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#7B4382] underline"
              >
                Abrir en Google Maps (domiciliario) <ExternalLink className="w-3 h-3" />
              </a>
              {order.deliveryDate && <p className="text-stone-600">Entrega: {order.deliveryDate}</p>}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382]">Facturación</p>
              <p className="text-stone-800 font-semibold">{billingLabel(order)}</p>
              {order.billing?.address && <p className="text-xs text-stone-600">Dirección de facturación: {order.billing.address}</p>}
              {order.billing?.type === 'empresa' && (
                <p className="text-xs text-stone-600">
                  {order.billing.businessName} · {order.billing.taxRegime || 'Régimen sin indicar'}<br />
                  {order.billing.billingEmail}
                </p>
              )}
              <div className="flex flex-wrap gap-1"><PaymentBadge order={order} /><InvoiceBadge order={order} /><OriginBadge order={order} /></div>
              {order.invoiceUrl && <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#7B4382] underline">Ver factura</a>}
            </div>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382] mb-1.5">Productos</p>
            <ul className="divide-y divide-stone-100 border border-stone-100 rounded-xl">
              {order.items?.map((i, idx) => (
                <li key={idx} className="px-3 py-2 flex justify-between gap-3">
                  <span>{i.name} · <span className="text-stone-500">{i.quantityText}</span></span>
                  <span className="font-semibold">{money(i.price)}</span>
                </li>
              ))}
              <li className="px-3 py-2 flex justify-between font-black text-[#2F183C]"><span>Total</span><span>{money(order.total)}</span></li>
            </ul>
            {order.notes && <p className="text-xs text-stone-500 mt-2">Notas: {order.notes}</p>}
          </section>

          {actions.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382]">Siguiente paso · responsable: {stage.ownerLabel}</p>
              {showInvoice && canDo(role, { key: '', label: '', roles: ['contabilidad'] }) && (
                <div className="grid sm:grid-cols-2 gap-2 bg-[#FAF7F0] border border-[#EADBEE] rounded-xl p-3">
                  <input value={invNumber} onChange={e => setInvNumber(e.target.value)} placeholder="N° de factura (World Office)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
                  <input value={invUrl} onChange={e => setInvUrl(e.target.value)} placeholder="Enlace al PDF (opcional)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {actions.map(a => {
                  const allowed = canDo(role, a);
                  const disabled = !allowed || !!a.blocked || busy !== null;
                  const danger = a.key === 'cancelar';
                  return (
                    <button
                      key={a.key}
                      onClick={() => run(a)}
                      disabled={disabled}
                      title={!allowed ? `Solo ${a.roles.map(r => ROLE_LABELS[r]).join(' / ')} o administrador` : a.blocked}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-45 disabled:cursor-not-allowed ${danger ? 'bg-white text-red-700 border border-red-200' : 'bg-[#2F183C] text-white'}`}
                    >
                      {busy === a.key ? <Loader2 className="w-4 h-4 animate-spin" /> : (!allowed || a.blocked) ? <Lock className="w-3.5 h-3.5" /> : null}
                      {showInvoice && a.key === 'registrar_factura' ? 'Guardar factura' : a.label}
                    </button>
                  );
                })}
              </div>
              {actions.some(a => a.blocked) && <p className="text-xs text-amber-700">{actions.find(a => a.blocked)?.blocked}</p>}
              {error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
            </section>
          )}

          {msg && (
            <section className="bg-[#F5ECF9] border border-[#DFCEE6] rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382]">Mensaje al cliente · {msg.title}</p>
              <p className="text-xs text-stone-700 whitespace-pre-line">{msg.text}</p>
              <a href={whatsappLink(order.customerPhone, msg.text)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25A244] text-white text-xs font-bold">
                <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
              </a>
            </section>
          )}

          {!!order.history?.length && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382] mb-1.5">Historial</p>
              <ol className="space-y-1 text-xs text-stone-600">
                {[...order.history].reverse().map((h, i) => (
                  <li key={i}>
                    <span className="text-stone-400">{when(h.at)}</span> · <span className="font-semibold">{h.status === 'factura' ? `Factura ${h.note ?? ''}` : (STAGES.find(s => s.id === h.status)?.short ?? h.status)}</span> · {h.by}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Manual order (WhatsApp / e-mail) ----------
const NewOrderModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', city: 'Bogotá D.C.', notes: '' });
  const [lines, setLines] = useState<FirestoreOrderItem[]>([{ name: '', quantityText: '', price: 0 }]);
  const [empresa, setEmpresa] = useState(false);
  const [b, setB] = useState<BillingData>({ type: 'persona', document: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const total = lines.reduce((s, l) => s + (Number(l.price) || 0), 0);

  const save = async () => {
    const clean = lines.filter(l => l.name.trim());
    if (!f.name.trim() || f.phone.trim().length < 7 || !f.address.trim()) return setError('Completa nombre, WhatsApp y dirección.');
    if (!clean.length) return setError('Agrega al menos un producto.');
    if (!b.document.trim()) return setError(empresa ? 'Falta el NIT.' : 'Falta la cédula.');
    if (empresa && (!b.businessName?.trim() || !b.billingEmail?.trim())) return setError('Para factura con NIT: razón social y correo de facturación.');
    setBusy(true); setError('');
    try {
      await createOrder({
        customerName: f.name.trim(), customerPhone: f.phone.trim(), customerEmail: f.email.trim(),
        shippingAddress: f.address.trim(), shippingCity: f.city.trim(), notes: f.notes.trim(),
        items: clean.map(l => ({ ...l, price: Number(l.price) || 0 })),
        subtotal: total, deliveryFee: 0, total, paymentMethod: 'manual',
        billing: { ...b, type: empresa ? 'empresa' : 'persona' },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el pedido.');
      setBusy(false);
    }
  };

  const inp = 'border border-stone-300 rounded-lg px-3 py-2 text-sm w-full';
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#2F183C]">Nuevo pedido manual</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-stone-500">Para pedidos que llegan por WhatsApp o correo.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="Nombre completo" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <input className={inp} placeholder="WhatsApp" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
          <input className={inp} placeholder="Correo (opcional)" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
          <input className={inp} placeholder="Ciudad" value={f.city} onChange={e => setF({ ...f, city: e.target.value })} />
        </div>
        <input className={inp} placeholder="Dirección completa" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7B4382]">Productos</p>
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input className={`${inp} col-span-5`} placeholder="Producto" value={l.name} onChange={e => setLines(lines.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
              <input className={`${inp} col-span-4`} placeholder="Ej. 2 estuches 250g" value={l.quantityText} onChange={e => setLines(lines.map((x, j) => j === i ? { ...x, quantityText: e.target.value } : x))} />
              <input className={`${inp} col-span-2`} type="number" min={0} placeholder="$" value={l.price || ''} onChange={e => setLines(lines.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} />
              <button onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length === 1} aria-label="Quitar" className="col-span-1 text-stone-400 hover:text-red-600 disabled:opacity-30"><Trash2 className="w-4 h-4 mx-auto" /></button>
            </div>
          ))}
          <button onClick={() => setLines([...lines, { name: '', quantityText: '', price: 0 }])} className="text-xs font-bold text-[#7B4382] inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Agregar producto</button>
          <p className="text-right font-black text-[#2F183C]">Total {money(total)}</p>
        </div>

        <div className="space-y-2 bg-[#FAF7F0] border border-[#EADBEE] rounded-xl p-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#2F183C]">
            <input type="checkbox" checked={empresa} onChange={e => setEmpresa(e.target.checked)} /> Factura con NIT (empresa)
          </label>
          {!empresa ? (
            <input className={inp} placeholder="Cédula" value={b.document} onChange={e => setB({ ...b, document: e.target.value })} />
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="Razón social" value={b.businessName ?? ''} onChange={e => setB({ ...b, businessName: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <input className={`${inp} col-span-2`} placeholder="NIT" value={b.document} onChange={e => setB({ ...b, document: e.target.value })} />
                <input className={inp} placeholder="DV" maxLength={1} value={b.dv ?? ''} onChange={e => setB({ ...b, dv: e.target.value })} />
              </div>
              <input className={inp} placeholder="Régimen fiscal" value={b.taxRegime ?? ''} onChange={e => setB({ ...b, taxRegime: e.target.value })} />
              <input className={inp} placeholder="Correo de facturación" value={b.billingEmail ?? ''} onChange={e => setB({ ...b, billingEmail: e.target.value })} />
            </div>
          )}
        </div>

        {error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
        <button onClick={save} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2F183C] text-white font-bold disabled:opacity-60">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Crear pedido
        </button>
      </div>
    </div>
  );
};

// ---------- Board ----------
export const OrdersBoard: React.FC<{
  orders: FirestoreOrder[]; loading: boolean; role: UserRole | null; userEmail: string;
}> = ({ orders, loading, role, userEmail }) => {
  const [view, setView] = useState<'kanban' | 'tabla'>('kanban');
  const [onlyMine, setOnlyMine] = useState(false);
  const [origin, setOrigin] = useState<'todos' | Origin>('todos');
  const [showCancelled, setShowCancelled] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const open = orders.find(o => o.id === openId) ?? null;
  const visible = useMemo(
    () => orders.filter(o => (onlyMine ? isMine(o, role) : true) && (origin === 'todos' || originOf(o) === origin)),
    [orders, onlyMine, role, origin]
  );
  const countBy = (k: Origin) => orders.filter(o => originOf(o) === k).length;
  const cancelled = visible.filter(o => normalizeStatus(o.status) === 'cancelado');
  const canCreate = role === 'admin' || role === 'asistente';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight text-[#2F183C] font-display">Flujo de pedidos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#EADBEE] overflow-hidden bg-white">
            <button onClick={() => setView('kanban')} className={`px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 ${view === 'kanban' ? 'bg-[#2F183C] text-white' : 'text-stone-600'}`}><LayoutGrid className="w-4 h-4" /> Tablero</button>
            <button onClick={() => setView('tabla')} className={`px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 ${view === 'tabla' ? 'bg-[#2F183C] text-white' : 'text-stone-600'}`}><Table2 className="w-4 h-4" /> Tabla</button>
          </div>
          <select
            value={origin}
            onChange={e => setOrigin(e.target.value as 'todos' | Origin)}
            aria-label="Filtrar por origen del pedido"
            className="px-3 py-2 rounded-xl text-xs font-bold border border-[#EADBEE] bg-white text-stone-600"
          >
            <option value="todos">Todos los orígenes ({orders.length})</option>
            <option value="cuenta">Web · con cuenta ({countBy('cuenta')})</option>
            <option value="invitado">Web · invitado ({countBy('invitado')})</option>
            <option value="manual">Manual ({countBy('manual')})</option>
          </select>
          <button onClick={() => setOnlyMine(!onlyMine)} className={`px-3 py-2 rounded-xl text-xs font-bold border ${onlyMine ? 'bg-[#DDA83A] text-[#2F183C] border-[#DDA83A]' : 'bg-white text-stone-600 border-[#EADBEE]'}`}>
            Solo lo mío{role ? ` (${ROLE_LABELS[role]})` : ''}
          </button>
          {canCreate && (
            <button onClick={() => setShowNew(true)} className="px-3 py-2 rounded-xl text-xs font-bold bg-[#2F183C] text-white inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> Pedido manual</button>
          )}
        </div>
      </div>

      {loading && <p className="text-sm text-stone-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cargando pedidos…</p>}
      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#EADBEE] p-8 text-center text-sm text-stone-500">Todavía no hay pedidos registrados.</div>
      )}

      {view === 'kanban' && orders.length > 0 && (
        <div className="overflow-x-auto pb-3 -mx-1 px-1">
          <div className="flex gap-3 min-w-max">
            {STAGES.map(stage => {
              const col = visible.filter(o => stageOf(o).id === stage.id);
              return (
                <div key={stage.id} className="w-64 shrink-0 bg-[#F5ECF9]/70 border border-[#DFCEE6] rounded-2xl p-2.5 space-y-2">
                  <div className="px-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#2F183C]">{stage.step}. {stage.short}</span>
                      <span className="text-[11px] font-bold bg-white rounded-full px-2 py-0.5 border border-[#DFCEE6]">{col.length}</span>
                    </div>
                    <p className="text-[10px] text-stone-500">{stage.ownerLabel}</p>
                  </div>
                  <div className="space-y-2 max-h-[65vh] overflow-y-auto">
                    {col.map(o => <OrderCard key={o.id} order={o} mine={isMine(o, role)} onOpen={() => setOpenId(o.id)} />)}
                    {col.length === 0 && <p className="text-[11px] text-stone-400 text-center py-4">Sin pedidos</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'tabla' && orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EADBEE] overflow-x-auto shadow-xs">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-[#FAF7F0] text-xs text-stone-500 text-left">
              <tr>
                {['N° pedido', 'Cliente / teléfono', 'Productos', 'Estado operativo', 'Responsable actual', 'Estado de pago', 'Factura electrónica', 'Origen'].map(h => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map(o => {
                const st = stageOf(o);
                return (
                  <tr key={o.id} onClick={() => setOpenId(o.id)} className="border-t border-stone-100 hover:bg-[#F5ECF9]/40 cursor-pointer">
                    <td className="px-3 py-3 font-semibold text-[#2F183C]">{o.orderNumber}</td>
                    <td className="px-3 py-3">{o.customerName}<br /><span className="text-xs text-stone-500">{o.customerPhone}</span></td>
                    <td className="px-3 py-3 text-xs text-stone-600 max-w-[16rem]">{itemsText(o)}</td>
                    <td className="px-3 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${st.tone}`}>{st.short}</span></td>
                    <td className="px-3 py-3 text-xs">{st.ownerLabel}</td>
                    <td className="px-3 py-3"><PaymentBadge order={o} /></td>
                    <td className="px-3 py-3"><InvoiceBadge order={o} /></td>
                    <td className="px-3 py-3"><OriginBadge order={o} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {cancelled.length > 0 && view === 'kanban' && (
        <div>
          <button onClick={() => setShowCancelled(!showCancelled)} className="text-xs font-bold text-stone-500 underline">
            {showCancelled ? 'Ocultar' : 'Ver'} cancelados ({cancelled.length})
          </button>
          {showCancelled && (
            <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {cancelled.map(o => <OrderCard key={o.id} order={o} mine={false} onOpen={() => setOpenId(o.id)} />)}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-stone-400 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" /> {CANCELLED.label} aparte. Cada cambio queda en el historial del pedido con quién lo hizo.
      </p>

      {open && <OrderModal key={open.id} order={open} role={role} by={userEmail} onClose={() => setOpenId(null)} />}
      {showNew && <NewOrderModal onClose={() => setShowNew(false)} />}
    </div>
  );
};
