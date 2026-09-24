import React, { useEffect } from 'react';
import PublicHome from './pages/PublicHome';
import UserPanel from './pages/UserPanel';
import AdminPanel from './pages/AdminPanel';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import { CartProvider } from './context/CartContext';
import { scrollToId, useAppLocation, useInternalLinkInterception } from './lib/router';

function renderRoute(pathname: string) {
  if (pathname === '/panel' || pathname.startsWith('/panel/')) return <UserPanel />;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <AdminPanel />;

  if (pathname === '/recetas') return <RecipesPage />;
  const recipeMatch = pathname.match(/^\/recetas\/([^/]+)$/);
  if (recipeMatch) return <RecipeDetailPage slug={decodeURIComponent(recipeMatch[1])} />;

  if (pathname === '/noticias') return <BlogPage />;
  const articleMatch = pathname.match(/^\/noticias\/([^/]+)$/);
  if (articleMatch) return <BlogArticlePage slug={decodeURIComponent(articleMatch[1])} />;

  return <PublicHome />;
}

/** Old /blog URLs moved to /noticias. Vercel redirects them server-side; this covers dev and any cached client. */
function legacyBlogRedirect(location: { pathname: string; search: string; hash: string }) {
  if (location.pathname !== '/blog' && !location.pathname.startsWith('/blog/')) return null;
  return location.pathname.replace(/^\/blog/, '/noticias') + location.search + location.hash;
}

export default function App() {
  const location = useAppLocation();
  useInternalLinkInterception();

  const redirectTo = legacyBlogRedirect(location);
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
    <CartProvider>
      <React.Fragment key={location.pathname + location.search}>
        {redirectTo ? null : renderRoute(location.pathname)}
      </React.Fragment>
    </CartProvider>
  );
}
