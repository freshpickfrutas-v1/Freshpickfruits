import { readConsent } from '../components/CookieBanner';

// Google Analytics 4 y píxel de Meta. Solo se cargan si el visitante lo autorizó en el banner de cookies
// (análisis → GA4, marketing → Meta) y si el ID está configurado en las variables de entorno de Vercel.
const GA_ID = (import.meta.env.VITE_GA4_ID as string | undefined)?.trim();
const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim();

type Win = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; _fbq?: unknown };
const w = () => window as Win;

let gaLoaded = false;
let pixelLoaded = false;

function loadScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadGa() {
  if (gaLoaded || !GA_ID) return;
  gaLoaded = true;
  w().dataLayer = w().dataLayer || [];
  w().gtag = function () { (w().dataLayer as unknown[]).push(arguments); };
  w().gtag!('js', new Date());
  w().gtag!('config', GA_ID);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`);
}

function loadPixel() {
  if (pixelLoaded || !PIXEL_ID) return;
  pixelLoaded = true;
  const win = w();
  const fbq: any = function (...args: unknown[]) { fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args); };
  if (!win._fbq) win._fbq = fbq;
  fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
  win.fbq = fbq;
  loadScript('https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
}

function applyConsent() {
  if (window.location.pathname.startsWith('/admin')) return;
  const c = readConsent();
  if (c?.analytics) loadGa();
  if (c?.marketing) loadPixel();
}

/** Mide una acción. No hace nada si el visitante no aceptó cookies o no hay ID configurado. */
export function track(event: 'add_to_cart' | 'whatsapp_click' | 'lead' | 'purchase', data: { value?: number; id?: string; name?: string } = {}) {
  if (typeof window === 'undefined') return;
  const value = data.value ?? 0;
  const ga = w().gtag;
  const fb = w().fbq;
  if (ga) {
    if (event === 'whatsapp_click') ga('event', 'whatsapp_click');
    else if (event === 'lead') ga('event', 'generate_lead', { currency: 'COP', value });
    else if (event === 'add_to_cart') ga('event', 'add_to_cart', { currency: 'COP', value, items: data.id ? [{ item_id: data.id, item_name: data.name }] : undefined });
    else ga('event', 'purchase', { currency: 'COP', value, transaction_id: data.id });
  }
  if (fb) {
    if (event === 'whatsapp_click') fb('track', 'Contact');
    else if (event === 'lead') fb('track', 'Lead', { currency: 'COP', value });
    else if (event === 'add_to_cart') fb('track', 'AddToCart', { currency: 'COP', value, content_ids: data.id ? [data.id] : undefined });
    else fb('track', 'Purchase', { currency: 'COP', value });
  }
}

export function initAnalytics() {
  applyConsent();
  window.addEventListener('fp:cookie-consent', applyConsent);
  // Cualquier enlace a WhatsApp cuenta como clic de contacto, sin tocar cada botón.
  document.addEventListener('click', e => {
    const a = (e.target as Element | null)?.closest?.('a[href*="wa.me"]');
    if (a) track('whatsapp_click');
  });
}
