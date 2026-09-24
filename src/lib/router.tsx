import React, { useEffect, useState } from 'react';

const NAVIGATE_EVENT = 'fp:navigate';

export interface AppLocation {
  pathname: string;
  search: string;
  hash: string;
}

function readLocation(): AppLocation {
  if (typeof window === 'undefined') return { pathname: '/', search: '', hash: '' };
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return { pathname, search: window.location.search, hash: window.location.hash };
}

/** Client-side navigation: updates the URL and notifies useAppLocation subscribers. */
export function navigate(href: string) {
  const url = new URL(href, window.location.origin);
  const current = window.location.pathname + window.location.search + window.location.hash;
  const next = url.pathname + url.search + url.hash;
  if (next === current) {
    // Same URL (e.g. clicking "Armar Pedido" twice): location state won't change, so scroll directly.
    if (url.hash) scrollToId(decodeURIComponent(url.hash.slice(1)));
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.history.pushState({}, '', next);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** Goes to a section of the home page (e.g. "pedidos-personalizados"), scrolling there if already home. */
export function goToHomeSection(id: string) {
  navigate(`/#${id}`);
}

export function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (!element) return false;
  const navOffset = 80;
  const top = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
  window.scrollTo({ top, behavior: 'smooth' });
  return true;
}

export function useAppLocation(): AppLocation {
  const [location, setLocation] = useState<AppLocation>(readLocation);

  useEffect(() => {
    const update = () => setLocation(readLocation());
    window.addEventListener('popstate', update);
    window.addEventListener(NAVIGATE_EVENT, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(NAVIGATE_EVENT, update);
    };
  }, []);

  return location;
}

/**
 * Intercepts clicks on internal links (<a href="/...">) so they navigate without a full reload.
 * External links, new-tab clicks and downloads keep the browser's default behaviour.
 */
export function useInternalLinkInterception() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.('a') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      e.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Plain <a> with a real href (crawlable for SEO); navigation is handled by useInternalLinkInterception. */
export const AppLink: React.FC<AppLinkProps> = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);
