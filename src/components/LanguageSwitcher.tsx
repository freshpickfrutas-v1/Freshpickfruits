import React, { useId } from 'react';
import { useAppLocation } from '../lib/router';
import { Lang, switchLangHref, useLang } from '../lib/i18n';

// Banderas en SVG: los emojis de bandera no se ven en Windows (salen como letras "CO" y "GB").
const FlagColombia: React.FC = () => (
  <svg viewBox="0 0 24 16" width="20" height="14" aria-hidden="true" className="rounded-[2px] shrink-0 ring-1 ring-black/10">
    <rect width="24" height="16" fill="#FCD116" />
    <rect y="8" width="24" height="4" fill="#003893" />
    <rect y="12" width="24" height="4" fill="#CE1126" />
  </svg>
);

const FlagUK: React.FC = () => {
  const id = useId();
  return (
    <svg viewBox="0 0 60 30" width="20" height="14" preserveAspectRatio="none" aria-hidden="true" className="rounded-[2px] shrink-0 ring-1 ring-black/10">
      <clipPath id={`${id}-s`}><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <clipPath id={`${id}-t`}><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
      <g clipPath={`url(#${id}-s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
};

/**
 * Selector ES | EN con banderas (Colombia y Reino Unido). Cambia a la misma página en el otro idioma
 * (/recetas ⇄ /en/recetas). `data-lang-switch` evita que la navegación vuelva a agregar el prefijo del idioma actual.
 */
export const LanguageSwitcher: React.FC<{ className?: string; variant?: 'light' | 'dark' }> = ({ className = '', variant = 'light' }) => {
  const lang = useLang();
  const { pathname, search } = useAppLocation();
  const current = pathname + search;
  const dark = variant === 'dark';

  const option = (code: Lang, label: string, name: string, flag: React.ReactNode) => {
    const active = lang === code;
    return (
      <a
        key={code}
        href={switchLangHref(current, code)}
        data-lang-switch=""
        hrefLang={code}
        lang={code}
        aria-current={active ? 'true' : undefined}
        aria-label={name}
        title={name}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
          active
            ? 'bg-[#2F183C] text-[#DDA83A] shadow-sm'
            : dark
              ? 'text-[#DFCEE6] hover:bg-[#432356]'
              : 'text-[#2F183C] hover:bg-[#F5ECF9]'
        }`}
      >
        {flag}
        <span>{label}</span>
      </a>
    );
  };

  return (
    <div
      role="group"
      aria-label={lang === 'en' ? 'Language' : 'Idioma'}
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs font-bold ${dark ? 'border-[#7B4382] bg-[#2F183C]/40' : 'border-[#DFCEE6] bg-white'} ${className}`}
    >
      {option('es', 'ES', 'Español', <FlagColombia />)}
      {option('en', 'EN', 'English', <FlagUK />)}
    </div>
  );
};
