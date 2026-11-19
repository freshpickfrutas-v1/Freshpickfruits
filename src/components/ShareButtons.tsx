import React, { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { useLang, useT } from '../lib/i18n';

export type ShareButtonsProps = {
  /** Absolute or site-relative URL to share. If relative, resolved against the current origin. */
  url: string;
  title: string;
  /** Optional short text for X / native share */
  text?: string;
  /** compact = icon row for cards; default = labeled row for article headers */
  variant?: 'default' | 'compact';
  className?: string;
};

function absoluteUrl(url: string): string {
  if (typeof window === 'undefined') {
    if (url.startsWith('http')) return url;
    return `https://www.freshpickfruits.com${url.startsWith('/') ? url : `/${url}`}`;
  }
  if (url.startsWith('http')) return url;
  return new URL(url, window.location.origin).href;
}

/** Botones para compartir en Facebook, X e Instagram (+ copiar enlace / compartir nativo). */
export function ShareButtons({ url, title, text, variant = 'default', className = '' }: ShareButtonsProps) {
  const t = useT();
  const lang = useLang();
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState('');

  const fullUrl = absoluteUrl(url);
  const shareText = text?.trim() || title;

  function open(href: string) {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=560');
  }

  function shareFacebook() {
    open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`);
  }

  function shareX() {
    open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`
    );
  }

  async function shareInstagram() {
    // Instagram no tiene URL de compartir en feed desde web; copiamos el enlace y, si existe, usamos el share nativo.
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text: shareText, url: fullUrl });
        return;
      }
    } catch {
      /* usuario canceló o no soportado */
    }
    await copyLink(
      t(
        'Enlace copiado. Ábrelo en Instagram y pégalo en tu historia o bio.',
        'Link copied. Open Instagram and paste it in your story or bio.'
      )
    );
  }

  async function copyLink(message?: string) {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setHint(
        message ||
          t('Enlace copiado', 'Link copied')
      );
      setTimeout(() => {
        setCopied(false);
        setHint('');
      }, 2500);
    } catch {
      setHint(t('No se pudo copiar el enlace', 'Could not copy the link'));
      setTimeout(() => setHint(''), 2500);
    }
  }

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText, url: fullUrl });
        return;
      }
    } catch {
      /* cancelado */
      return;
    }
    await copyLink();
  }

  const isCompact = variant === 'compact';

  const btnBase = isCompact
    ? 'inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#EADBEE] bg-white text-[#2F183C] hover:bg-[#F5ECF9] hover:border-[#DFCEE6] transition-colors'
    : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#EADBEE] bg-white text-[#2F183C] hover:bg-[#F5ECF9] hover:border-[#DFCEE6] transition-colors';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('Compartir', 'Share')}>
        {!isCompact && (
          <span className="text-xs font-semibold text-stone-500 mr-0.5 flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" aria-hidden />
            {t('Compartir', 'Share')}
          </span>
        )}

        <button
          type="button"
          onClick={shareFacebook}
          className={btnBase}
          title="Facebook"
          aria-label={t('Compartir en Facebook', 'Share on Facebook')}
        >
          <FacebookIcon className={isCompact ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          {!isCompact && <span>Facebook</span>}
        </button>

        <button
          type="button"
          onClick={shareX}
          className={btnBase}
          title="X"
          aria-label={t('Compartir en X', 'Share on X')}
        >
          <XIcon className={isCompact ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          {!isCompact && <span>X</span>}
        </button>

        <button
          type="button"
          onClick={shareInstagram}
          className={btnBase}
          title="Instagram"
          aria-label={t('Compartir en Instagram', 'Share on Instagram')}
        >
          <InstagramIcon className={isCompact ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          {!isCompact && <span>Instagram</span>}
        </button>

        <button
          type="button"
          onClick={() => copyLink()}
          className={btnBase}
          title={t('Copiar enlace', 'Copy link')}
          aria-label={t('Copiar enlace', 'Copy link')}
        >
          {copied ? (
            <Check className={isCompact ? 'w-4 h-4 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          ) : (
            <Copy className={isCompact ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          )}
          {!isCompact && <span>{copied ? t('Copiado', 'Copied') : t('Copiar', 'Copy')}</span>}
        </button>

        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={nativeShare}
            className={btnBase}
            title={t('Más opciones', 'More options')}
            aria-label={t('Compartir con otras apps', 'Share with other apps')}
          >
            <Share2 className={isCompact ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            {!isCompact && <span>{lang === 'en' ? 'More' : 'Más'}</span>}
          </button>
        )}
      </div>
      {hint && (
        <p className="text-[11px] text-[#7B4382] font-medium" role="status">
          {hint}
        </p>
      )}
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.931-1.956 1.887v2.257h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.829L1.24 2.25h7.414l4.261 5.686L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
