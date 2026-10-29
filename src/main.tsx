import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.tsx';
import { preloadRoute } from './lib/routePreload';
import { readLocation } from './lib/router';
import { initAnalytics } from './lib/analytics';
import './index.css';

async function start() {
  const container = document.getElementById('root')!;
  // Carga los datos de la ruta antes de pintar, para que coincidan con el HTML prerenderizado.
  await preloadRoute(readLocation().pathname);
  const app = (
    <StrictMode>
      <App />
      <SpeedInsights />
    </StrictMode>
  );
  // Las páginas de recetas y noticias llegan prerenderizadas: se "hidratan" en lugar de volver a pintarlas.
  if (container.hasChildNodes()) hydrateRoot(container, app);
  else createRoot(container).render(app);
}

initAnalytics();
void start();
