import React, { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, AlertCircle, Home, Briefcase, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveAddresses, newAddressId, MAX_ADDRESSES } from '../lib/addresses';
import { BOGOTA, PlacePick, mapsLink } from '../lib/maps';
import { AddressField } from './AddressField';
import { SavedAddress } from '../types';

const LABELS = ['Casa', 'Oficina', 'Otra'];

interface FormState {
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  complement: string;
  neighborhood: string;
  place: PlacePick | null;
  notes: string;
  timeSlot: string;
  makeDefault: boolean;
}

const empty = (name: string, first: boolean): FormState => ({
  label: 'Casa', recipientName: name, phone: '', address: '', complement: '', neighborhood: '', place: null, notes: '', timeSlot: 'Mañana 8am–1pm', makeDefault: first,
});

const input = 'mt-1 w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none';

/** Address book: save a delivery address once, pick it later, add more whenever needed. Deliveries are only in Bogotá. */
export const AddressBook: React.FC = () => {
  const { user, profile } = useAuth();
  const addresses: SavedAddress[] = profile?.addresses ?? [];
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(empty(user?.displayName ?? '', true));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const persist = async (next: SavedAddress[]) => {
    setBusy(true); setError('');
    try {
      await saveAddresses(user.uid, next);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intenta de nuevo.');
      return false;
    } finally { setBusy(false); }
  };

  const startNew = () => {
    setForm(empty(user.displayName ?? '', addresses.length === 0));
    setEditingId('new');
    setError('');
  };

  const startEdit = (a: SavedAddress) => {
    setForm({
      label: a.label, recipientName: a.recipientName, phone: a.phone, address: a.address,
      complement: a.complement ?? '', neighborhood: a.neighborhood ?? '',
      place: typeof a.lat === 'number' && typeof a.lng === 'number' ? { address: a.address, lat: a.lat, lng: a.lng, placeId: a.placeId ?? '' } : null,
      notes: a.notes ?? '', timeSlot: a.timeSlot ?? 'Mañana 8am–1pm', makeDefault: !!a.isDefault,
    });
    setEditingId(a.id);
    setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientName.trim() || form.phone.trim().length < 7 || !form.address.trim()) {
      setError('Completa nombre, WhatsApp y la dirección exacta.');
      return;
    }
    const item: SavedAddress = {
      id: editingId && editingId !== 'new' ? editingId : newAddressId(),
      label: form.label.trim() || 'Otra',
      recipientName: form.recipientName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: BOGOTA,
      complement: form.complement.trim(),
      neighborhood: form.neighborhood.trim(),
      notes: form.notes.trim(),
      timeSlot: form.timeSlot,
      isDefault: form.makeDefault,
      createdAt: new Date().toISOString(),
      // Firestore rejects undefined: the pin is only written when Google Maps confirmed it.
      ...(form.place ? { lat: form.place.lat, lng: form.place.lng, placeId: form.place.placeId } : {}),
    };
    let next: SavedAddress[];
    if (editingId === 'new') {
      if (addresses.length >= MAX_ADDRESSES) { setError(`Puedes guardar hasta ${MAX_ADDRESSES} direcciones.`); return; }
      next = [...addresses, item];
    } else {
      next = addresses.map(a => (a.id === item.id ? { ...item, createdAt: a.createdAt } : a));
    }
    // Exactly one default: the first address ever saved, or whichever the person marks.
    if (item.isDefault || !next.some(a => a.isDefault)) {
      const winner = item.isDefault ? item.id : next[0].id;
      next = next.map(a => ({ ...a, isDefault: a.id === winner }));
    }
    if (await persist(next)) setEditingId(null);
  };

  const makeDefault = (id: string) => persist(addresses.map(a => ({ ...a, isDefault: a.id === id })));

  const remove = async (a: SavedAddress) => {
    if (!window.confirm(`¿Eliminar la dirección "${a.label}"?`)) return;
    let next = addresses.filter(x => x.id !== a.id);
    if (next.length && !next.some(x => x.isDefault)) next = next.map((x, i) => ({ ...x, isDefault: i === 0 }));
    await persist(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          Guarda tus direcciones de entrega una sola vez y elige a cuál quieres que lleguen tus pedidos. Entregamos solo en {BOGOTA}.
        </p>
        {editingId === null && (
          <button onClick={startNew} disabled={addresses.length >= MAX_ADDRESSES} className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-50">
            <Plus className="w-4 h-4" /> Agregar dirección
          </button>
        )}
      </div>

      {addresses.length === 0 && editingId === null && (
        <div className="bg-white rounded-2xl border border-dashed border-[#DFCEE6] p-8 text-center">
          <MapPin className="w-8 h-8 mx-auto text-[#7B4382]" />
          <p className="mt-2 font-semibold text-[#2F183C]">Aún no tienes direcciones guardadas</p>
          <p className="text-sm text-stone-500">Agrega la primera y quedará lista para tus próximos pedidos.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {addresses.map(a => (
          <div key={a.id} className={`bg-white rounded-2xl border p-4 space-y-2 shadow-xs ${a.isDefault ? 'border-[#DDA83A] ring-1 ring-[#DDA83A]/40' : 'border-[#EADBEE]'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#2F183C]">
                {a.label === 'Oficina' ? <Briefcase className="w-4 h-4 text-[#7B4382]" /> : <Home className="w-4 h-4 text-[#7B4382]" />}
                {a.label}
              </span>
              {a.isDefault && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#DDA83A]/25 text-[#8a6410] inline-flex items-center gap-1"><Star className="w-3 h-3" /> Principal</span>}
            </div>
            <p className="text-sm text-stone-800">{a.address}{a.complement ? ` · ${a.complement}` : ''}</p>
            <p className="text-xs text-stone-500">{a.neighborhood ? `${a.neighborhood} · ` : ''}{BOGOTA} · {a.recipientName} · {a.phone}</p>
            {a.notes && <p className="text-xs text-stone-500 italic">{a.notes}</p>}
            <a href={mapsLink(a)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#7B4382] underline">
              {typeof a.lat === 'number' ? 'Ubicación confirmada · ver mapa' : 'Ver en Google Maps'} <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex flex-wrap gap-2 pt-1">
              {!a.isDefault && <button onClick={() => makeDefault(a.id)} disabled={busy} className="text-xs font-bold text-[#7B4382] hover:underline">Hacer principal</button>}
              <button onClick={() => startEdit(a)} className="text-xs font-bold text-stone-600 hover:underline inline-flex items-center gap-1"><Pencil className="w-3 h-3" /> Editar</button>
              <button onClick={() => remove(a)} disabled={busy} className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {editingId !== null && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-[#EADBEE] p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#2F183C]">{editingId === 'new' ? 'Nueva dirección de entrega' : 'Editar dirección'}</h2>
            <button type="button" onClick={() => setEditingId(null)} aria-label="Cancelar" className="p-1.5 rounded-lg hover:bg-stone-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2">
            {LABELS.map(l => (
              <button key={l} type="button" onClick={() => setForm({ ...form, label: l })} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${form.label === l ? 'bg-[#2F183C] text-white border-[#2F183C]' : 'bg-white text-stone-600 border-[#DFCEE6]'}`}>{l}</button>
            ))}
            {!LABELS.includes(form.label) && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#2F183C] text-white">{form.label}</span>}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500">Dirección exacta (busca y elige la sugerencia de Google Maps)</span>
            <AddressField
              value={form.address}
              onChange={address => setForm(f => ({ ...f, address }))}
              place={form.place}
              onPlace={place => setForm(f => ({ ...f, place }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Apto, torre, casa, oficina…</span>
              <input className={input} name="address-line2" autoComplete="address-line2" placeholder="Torre 2, Apto 502" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Barrio</span>
              <input className={input} name="neighborhood" autoComplete="address-level3" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Quién recibe</span>
              <input className={input} name="name" autoComplete="name" value={form.recipientName} onChange={e => setForm({ ...form, recipientName: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">WhatsApp de contacto</span>
              <input className={input} name="tel" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Ciudad</span>
              <input className={`${input} bg-stone-100 text-stone-500`} value={BOGOTA} readOnly aria-readonly /></label>
            <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Franja preferida</span>
              <select className={input} value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}>
                <option>Mañana 8am–1pm</option><option>Tarde 1pm–3pm</option>
              </select></label>
            <label className="block text-sm sm:col-span-2"><span className="text-xs font-semibold text-stone-500">Indicaciones para el domiciliario (opcional)</span>
              <input className={input} placeholder="Portería, punto de referencia, color de la fachada…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#2F183C] font-semibold">
            <input type="checkbox" checked={form.makeDefault} onChange={e => setForm({ ...form, makeDefault: e.target.checked })} /> Usar como dirección principal
          </label>
          {error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Guardar dirección
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="px-5 py-2.5 rounded-xl border border-[#DFCEE6] text-sm font-bold text-stone-600">Cancelar</button>
          </div>
        </form>
      )}
      {editingId === null && error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
    </div>
  );
};
