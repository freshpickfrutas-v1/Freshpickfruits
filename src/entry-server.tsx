import { renderToString } from 'react-dom/server';
import App from './App';
import { seedContent } from './data/content';
import { setServerLocation } from './lib/router';
import { resetCollectedMeta, resolvePageMeta, takeCollectedMeta } from './lib/seo';

// Entrada de servidor para el prerender (scripts/prerender.mjs). No se carga en el navegador.
export { seedContent, resolvePageMeta };

export function render(url: string) {
  setServerLocation(url);
  resetCollectedMeta();
  const html = renderToString(<App />);
  return { html, meta: takeCollectedMeta() };
}
