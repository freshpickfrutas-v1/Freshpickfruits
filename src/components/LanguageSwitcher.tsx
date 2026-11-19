import React from 'react';
import { Globe } from 'lucide-react';
import { useAppLocation } from '../lib/router';
import { Lang, switchLangHref, useLang } from '../lib/i18n';

/**
 * Selector ES | EN. Cambia a la misma página en el otro idioma (/recetas ⇄ /en/recetas).
 * `data-lang-switch` evita que la navegación vuelva a agregar el prefijo del idioma actual.
 */
export const LanguageSwitcher: React.FC<{ className?: string; variant?: 'light' | 'dark' }> = ({ className = '', variant = 'light' }) => {
  const lang = useLang();
  const { pathname, search } = useAppLocation();
  const current = pathname + search;

  const option = (code: Lang, label: string, name: string) => {
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
        className={`px-2.5 py-1 transition-colors ${
          active
            ? 'bg-[#2F183C] text-[#DDA83A]'
            : variant === 'dark'
              ? 'text-[#DFCEE6] hover:bg-[#432356]'
              : 'text-[#2F183C] hover:bg-[#F5ECF9]'
        }`}
      >
        {label}
      </a>
    );
  };

  return (
    <div
      role="group"
      aria-label={lang === 'en' ? 'Language' : 'Idioma'}
      className={`inline-flex items-center overflow-hidden rounded-full border text-xs font-bold ${variant === 'dark' ? 'border-[#7B4382]' : 'border-[#2F183C]'} ${className}`}
    >
      <Globe className={`ml-2 w-3.5 h-3.5 shrink-0 ${variant === 'dark' ? 'text-[#DDA83A]' : 'text-[#7B4382]'}`} aria-hidden="true" />
      {option('es', 'ES', 'Español')}
      {option('en', 'EN', 'English')}
    </div>
  );
};
