import React, { useEffect, useState } from 'react';
import PublicHome from './pages/PublicHome';
import UserPanel from './pages/UserPanel';
import AdminPanel from './pages/AdminPanel';

type Route = 'home' | 'panel' | 'admin';

function pathToRoute(pathname: string): Route {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/panel' || p.startsWith('/panel/')) return 'panel';
  if (p === '/admin' || p.startsWith('/admin/')) return 'admin';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== 'undefined' ? pathToRoute(window.location.pathname) : 'home'
  );

  useEffect(() => {
    const onPop = () => setRoute(pathToRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('https://wa.me')) return;
      if (href === '/panel' || href === '/admin' || href === '/') {
        e.preventDefault();
        window.history.pushState({}, '', href);
        setRoute(pathToRoute(href));
        window.scrollTo(0, 0);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (route === 'panel') return <UserPanel />;
  if (route === 'admin') return <AdminPanel />;
  return <PublicHome />;
}
