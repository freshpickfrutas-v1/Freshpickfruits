import React, { useEffect, useState } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { BOGOTA, PlacePick } from '../lib/maps';
import { AddressField } from './AddressField';
import { BillingData } from '../types';
import { useT } from '../lib/i18n';

const input = 'mt-1 w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none';

const REGIMES = ['Responsable de IVA', 'No responsable de IVA', 'Régimen simple de tributación'];
const REGIME_EN: Record<string, string> = { 'Responsable de IVA': 'VAT-responsible', 'No responsable de IVA': 'Not VAT-responsible', 'Régimen simple de tributación': 'Simple taxation regime' };

/** Billing details kept in the customer's account: used to pre-fill the invoice data on every order. */
export const BillingProfile: React.FC = () => {
  const t = useT();
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
    if (!/^\d{5,12}$/.test(document.trim())) return setError(empresa ? t('El NIT debe tener solo números, sin dígito de verificación.', 'The NIT must contain digits only, without the check digit.') : t('La cédula debe tener solo números.', 'The ID number must contain digits only.'));
    if (!address.trim()) return setError(t('Escribe la dirección de facturación.', 'Enter the billing address.'));
    if (empresa) {
      if (!/^\d$/.test(dv.trim())) return setError(t('Escribe el dígito de verificación del NIT (1 número).', 'Enter the NIT check digit (1 number).'));
      if (!businessName.trim()) return setError(t('Escribe la razón social.', 'Enter the company name.'));
      if (!taxRegime) return setError(t('Elige el régimen fiscal.', 'Choose the tax regime.'));
    }
    if (!/^\S+@\S+\.\S+$/.test(billingEmail.trim())) return setError(t('Escribe un correo de facturación válido.', 'Enter a valid billing email.'));

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
      setError(err instanceof Error ? err.message : t('No se pudo guardar. Intenta de nuevo.', 'We could not save. Please try again.'));
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-[#EADBEE] p-5 space-y-3 shadow-xs">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#7B4382]" />
        <h2 className="font-bold text-[#2F183C]">{t('Datos de facturación', 'Billing details')}</h2>
      </div>
      <p className="text-xs text-stone-500">{t('Se usan para tu factura electrónica y se completan solos en tus pedidos. La dirección de facturación puede ser distinta a la de entrega.', 'They are used for your electronic invoice and fill in automatically on your orders. The billing address can differ from the delivery address.')}</p>

      <div className="flex gap-2">
        {([['persona', t('Persona natural (cédula)', 'Individual (ID number)')], ['empresa', t('Empresa (NIT)', 'Company (NIT)')]] as const).map(([v, label]) => (
          <button key={v} type="button" onClick={() => setType(v)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${type === v ? 'bg-[#2F183C] text-white border-[#2F183C]' : 'bg-white text-stone-600 border-[#DFCEE6]'}`}>{label}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {empresa && (
          <label className="block text-sm sm:col-span-2"><span className="text-xs font-semibold text-stone-500">{t('Razón social', 'Company name')}</span>
            <input className={input} name="organization" autoComplete="organization" value={businessName} onChange={e => setBusinessName(e.target.value)} /></label>
        )}
        <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">{empresa ? t('NIT (sin DV)', 'NIT (no check digit)') : t('Cédula', 'ID number')}</span>
          <input className={input} inputMode="numeric" value={document} onChange={e => setDocument(e.target.value)} /></label>
        {empresa && (
          <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">{t('Dígito de verificación', 'Check digit')}</span>
            <input className={input} inputMode="numeric" maxLength={1} value={dv} onChange={e => setDv(e.target.value)} /></label>
        )}
        {empresa && (
          <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">{t('Régimen fiscal', 'Tax regime')}</span>
            <select className={input} value={taxRegime} onChange={e => setTaxRegime(e.target.value)}>
              <option value="">{t('Elige uno', 'Choose one')}</option>
              {REGIMES.map(r => <option key={r} value={r}>{t(r, REGIME_EN[r])}</option>)}
            </select></label>
        )}
        <label className="block text-sm"><span className="text-xs font-semibold text-stone-500">{t('Correo para la factura', 'Email for the invoice')}</span>
          <input className={input} type="email" name="email" autoComplete="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} /></label>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-semibold text-stone-500">{t('Dirección de facturación', 'Billing address')} ({BOGOTA})</span>
        <AddressField value={address} onChange={setAddress} place={place} onPlace={setPlace} placeholder={t('Dirección que aparecerá en la factura', 'Address that will appear on the invoice')} />
      </div>

      {error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t('Guardar datos de facturación', 'Save billing details')}
        </button>
        {done && <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {t('Guardado en tu cuenta', 'Saved to your account')}</span>}
      </div>
    </form>
  );
};
