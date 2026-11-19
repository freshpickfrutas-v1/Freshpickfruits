import React, { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';

const KEY = 'fp-cookie-consent';
const OPEN_EVENT = 'fp:cookie-settings';

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

export function readConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CookieConsent) : null;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean, marketing: boolean) {
  const value: CookieConsent = { analytics, marketing, decidedAt: new Date().toISOString() };
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* private mode: the choice just lasts this visit */ }
  window.dispatchEvent(new CustomEvent('fp:cookie-consent', { detail: value }));
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Consent banner (Ley 1581 de 2012). Analytics/marketing scripts must only load when readConsent() allows it. */
export const CookieBanner: React.FC = () => {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setVisible(!readConsent());
    const open = () => {
      const c = readConsent();
      setAnalytics(!!c?.analytics);
      setMarketing(!!c?.marketing);
      setConfiguring(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  if (!visible) return null;

  const decide = (a: boolean, m: boolean) => { saveConsent(a, m); setVisible(false); setConfiguring(false); };

  return (
    <div role="dialog" aria-label={t('Preferencias de cookies', 'Cookie preferences')} className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4 max-md:mb-16">
      <div className="max-w-3xl mx-auto bg-white border border-[#DFCEE6] rounded-2xl shadow-2xl p-4 text-sm text-stone-700">
        <p>
          {t('Usamos cookies necesarias para que el sitio funcione y, si lo autorizas, cookies de análisis y marketing para mejorar tu experiencia y medir campañas.', 'We use necessary cookies so the site works and, if you allow it, analytics and marketing cookies to improve your experience and measure campaigns.')}{' '}
          <a href="/cookies" className="font-semibold text-[#7B4382] underline">{t('Más información', 'Learn more')}</a>.
        </p>
        {configuring && (
          <div className="mt-3 space-y-2 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" checked disabled /> {t('Necesarias (siempre activas)', 'Necessary (always on)')}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> {t('Análisis (visitas y rendimiento)', 'Analytics (visits and performance)')}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} /> {t('Marketing (campañas de Google y Meta)', 'Marketing (Google and Meta campaigns)')}</label>
          </div>
        )}
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
          {configuring ? (
            <button type="button" onClick={() => decide(analytics, marketing)} className="px-4 py-2 rounded-xl bg-[#2F183C] text-white font-bold cursor-pointer">{t('Guardar preferencias', 'Save preferences')}</button>
          ) : (
            <button type="button" onClick={() => setConfiguring(true)} className="px-4 py-2 rounded-xl border border-[#DFCEE6] text-[#2F183C] font-bold cursor-pointer">{t('Configurar', 'Customize')}</button>
          )}
          <button type="button" onClick={() => decide(false, false)} className="px-4 py-2 rounded-xl border border-[#DFCEE6] text-[#2F183C] font-bold cursor-pointer">{t('Rechazar no esenciales', 'Reject non-essential')}</button>
          <button type="button" onClick={() => decide(true, true)} className="px-4 py-2 rounded-xl bg-[#2F183C] text-white font-bold cursor-pointer">{t('Aceptar todas', 'Accept all')}</button>
        </div>
      </div>
    </div>
  );
};
