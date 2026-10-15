import React, { Suspense, lazy, useEffect, useState } from 'react';
import PublicHome from './pages/PublicHome';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import LegalPage from './pages/LegalPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { scrollToId, useAppLocation, useInternalLinkInterception } from './lib/router';
import { matchContentRoute } from './lib/routes';
import { preloadRoute } from './lib/routePreload';

// Los paneles pesan bastante (Firestore, tableros) y solo los usa el equipo y los clientes con sesión:
// se descargan al entrar a /panel o /admin, no con la página de inicio, recetas o noticias.
const UserPanel = lazy(() => import('./pages/UserPanel'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function renderRoute(pathname: string) {
  if (pathname === '/panel' || pathname.startsWith('/panel/')) return <Suspense fallback={null}><UserPanel /></Suspense>;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <Suspense fallback={null}><AdminPanel /></Suspense>;

  if (pathname === '/privacidad') return <LegalPage kind="privacidad" />;
  if (pathname === '/terminos') return <LegalPage kind="terminos" />;

  const route = matchContentRoute(pathname);
  switch (route?.type) {
    case 'recetas-biblioteca': return <RecipesPage />;
    case 'recetas-detalle': return <RecipeDetailPage slug={route.slug} />;
    case 'noticias-biblioteca': return <BlogPage />;
    case 'noticias-detalle': return <BlogArticlePage slug={route.slug} />;
    default: return <PublicHome />;
  }
}

/** Old /blog URLs moved to /noticias. Vercel redirects them server-side; this covers dev and any cached client. */
function legacyBlogRedirect(location: { pathname: string; search: string; hash: string }) {
  if (location.pathname !== '/blog' && !location.pathname.startsWith('/blog/')) return null;
  return location.pathname.replace(/^\/blog/, '/noticias') + location.search + location.hash;
}

export default function App() {
  const current = useAppLocation();
  useInternalLinkInterception();

  // Al navegar se precargan los datos de la nueva ruta y recién entonces se muestra, así la página
  // anterior sigue visible (sin parpadeos en blanco) y las páginas leen su contenido sin esperas.
  const [location, setLocation] = useState(current);
  useEffect(() => {
    let cancelled = false;
    preloadRoute(current.pathname).finally(() => {
      if (!cancelled) setLocation(current);
    });
    return () => { cancelled = true; };
  }, [current]);

  const redirectTo = legacyBlogRedirect(current);
  useEffect(() => {
    if (redirectTo) {
      window.history.replaceState({}, '', redirectTo);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [redirectTo]);

  // After each navigation: jump to the #section if there is one, otherwise start at the top.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) {
      window.scrollTo(0, 0);
      return;
    }
    // Wait for the new page to render before looking for the section.
    const timer = window.setTimeout(() => {
      if (!scrollToId(id)) window.scrollTo(0, 0);
    }, 60);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return (
    <AuthProvider>
      <CartProvider>
        <React.Fragment key={location.pathname + location.search}>
          {redirectTo ? null : renderRoute(location.pathname)}
        </React.Fragment>
      </CartProvider>
    </AuthProvider>
  );
}
