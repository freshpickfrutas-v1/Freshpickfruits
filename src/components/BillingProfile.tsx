import React, { useEffect, useState } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { BOGOTA, PlacePick } from '../lib/maps';
import { AddressField } from './AddressField';
import { BillingData } from '../types';

const input = 'mt-1 w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none';

const REGIMES = ['Responsable de IVA', 'No responsable de IVA', 'Régimen simple de tributación'];

/** Billing details kept in the customer's account: used to pre-fill the invoice data on every order. */
export const BillingProfile: React.FC = () => {
  const { user, profile } = useAuth();
  const saved = profile?.billing;
  const [type, setType] = useState<'persona' | 'empresa'>(saved?.type ?? 'persona');
  const [document, setDocument] = useState(saved?.document ?? '');
  const [dv, setDv] = useState(saved?.dv ?? '');
  const [businessName, setBusinessName] = useState(saved?.businessName ?? '');
  const [taxRegime, setTaxRegime] = useState(saved?.taxRegime ?? '');
  const [billingEmail, setBillingEmail] = useState(saved?.billingEmail ?? user?.email ?? '');
  const [address, setAddress] = useState(saved?.address ?? '');
  const [place, setPlace] = useState<PlacePick | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // The profile arrives asynchronously: fill the form once with what was saved before.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded || !saved) return;
    setLoaded(true);
    setType(saved.type); setDocument(saved.document); setDv(saved.dv ?? ''); setBusinessName(saved.businessName ?? '');
    setTaxRegime(saved.taxRegime ?? ''); setBillingEmail(saved.billingEmail ?? ''); setAddress(saved.address ?? '');
  }, [saved, loaded]);

  if (!user) return null;
  const empresa = type === 'empresa';

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setDone(false);
    if (!/^\d{5,12}$/.test(document.trim())) return setError(empresa ? 'El NIT debe tener solo números, sin dígito de verificación.' : 'La cédula debe tener solo números.');
    if (!address.trim()) return setError('Escribe la dirección de facturación.');
    if (empresa) {
      if (!/^\d$/.test(dv.trim())) return setError('Escribe el dígito de verificación del NIT (1 número).');
      if (!businessName.trim()) return setError('Escribe la razón social.');
      if (!taxRegime) return setError('Elige el régimen fiscal.');
    }
    if (!/^\S+@\S+\.\S+$/.test(billingEmail.trim())) return setError('Escribe un correo de facturación válido.');

    const billing: BillingData = {
      type,
      document: document.trim(),
      address: address.trim(),
      billingEmail: billingEmail.trim(),
      ...(empresa ? { dv: dv.trim(), businessName: businessName.trim(), taxRegime } : {}),
    };
    setBusy(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { billing });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intenta de nuevo.');
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-[#EADBEE] p-5 space-y-3 shadow-xs">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#7B4382]" />
        <h2 className="font-bold text-[#2F183C]">Datos de facturación</h2>
      </div>
      <p className="text-xs text-stone-500">Se usan para tu factura electrónica y se completan solos en tus pedidos. La dirección de facturación puede ser distinta a la de entrega.</p>

      <div className="flex gap-2">
        {([['persona', 'Persona natural (cédula)'], ['empresa', 'Empresa (NIT)']] as const).map(([v, label]) => (
          <button key={v} type="button" onClick={() => setType(v)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${type === v ? 'bg-[#2F183C] text-white border-[#2F183C]' : 'bg-white text-stone-600 border-[#DFCEE6]'}`}>{label}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {empresa && (
          <label className="block text-sm sm:col-span-2"><span className="text-xs font-semibold text-stone-500">Razón social</span>
            <input className={input} value={businessName} onChange={e => setBusinessName(e.target.value)} /></label>
        )}
        <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">{empresa ? 'NIT (sin DV)' : 'Cédula'}</span>
          <input className={input} inputMode="numeric" value={document} onChange={e => setDocument(e.target.value)} /></label>
        {empresa && (
          <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Dígito de verificación</span>
            <input className={input} inputMode="numeric" maxLength={1} value={dv} onChange={e => setDv(e.target.value)} /></label>
        )}
        {empresa && (
          <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Régimen fiscal</span>
            <select className={input} value={taxRegime} onChange={e => setTaxRegime(e.target.value)}>
              <option value="">Elige uno</option>
              {REGIMES.map(r => <option key={r}>{r}</option>)}
            </select></label>
        )}
        <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">Correo para la factura</span>
          <input className={input} type="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} /></label>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-semibold text-stone-500">Dirección de facturación ({BOGOTA})</span>
        <AddressField value={address} onChange={setAddress} place={place} onPlace={setPlace} placeholder="Dirección que aparecerá en la factura" />
      </div>

      {error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Guardar datos de facturación
        </button>
        {done && <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Guardado en tu cuenta</span>}
      </div>
    </form>
  );
};
