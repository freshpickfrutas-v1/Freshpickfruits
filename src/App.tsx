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

  if (pathname === '/blog') return <BlogPage />;
  const articleMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (articleMatch) return <BlogArticlePage slug={decodeURIComponent(articleMatch[1])} />;

  return <PublicHome />;
}

export default function App() {
  const location = useAppLocation();
  useInternalLinkInterception();

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
        {renderRoute(location.pathname)}
      </React.Fragment>
    </CartProvider>
  );
}
