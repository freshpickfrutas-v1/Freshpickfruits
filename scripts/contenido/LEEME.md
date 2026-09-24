# Contenido automático de Fresh Pick

Todos los días a las 9:00 a.m. (hora de Colombia) GitHub Actions ejecuta `scripts/contenido/ejecutar.mjs`:

- **1 receta** tomada en orden de `cola-recetas.json` → se publica directo en `/recetas`.
- **Noticias de arándanos** con meta de **7 por semana** (lunes a domingo), máximo 2 por día para recuperar días sin noticia. Lo que falte al cerrar la semana no se arrastra.
  - Salud y ciencia (Beneficios, Nutrición y Ciencia, Salud Digestiva) → llegan como **Pull Request** para aprobar.
  - Estilo de Vida y Cultivo y Origen (incluye mercado y exportación) → se publican directo.
- Cada pieza lleva una **imagen generada con IA** y revisada por otra IA. Sin imagen aprobada, no se publica.
- Un **revisor automático** bloquea piezas incompletas, con afirmaciones médicas, con otras frutas en las recetas o con fuentes que no abren.

## Fuentes de noticias

Blueberries Consulting, Portal Frutícola, FreshPlaza, ScienceDaily (nutrición) y PubMed, de los últimos 7 días. Si no alcanzan, una búsqueda con Google (Gemini) limitada a dominios confiables. Las noticias en inglés se escriben como ensayo propio en español con la fuente original enlazada.

## Aprobar una noticia (desde el celular)

1. GitHub te envía un correo "Revisar: …".
2. Abre el Pull Request, espera el comentario de Vercel y toca **Preview** para verla.
3. **Merge pull request** → se publica. **Close pull request** → se descarta.

## Enviar una noticia de la finca

En la app de GitHub: **Issues → New issue**, escribe título y texto, adjunta una foto y ponle la etiqueta **`noticia-finca`**. Al día siguiente llega como Pull Request para aprobar. Solo quien tiene acceso de escritura al repositorio puede poner etiquetas.

## Ejecutarlo a mano

GitHub → **Actions → Contenido diario → Run workflow**. La opción *Prueba segura* (activada por defecto) manda todo como Pull Request, sin publicar nada directo.

La ejecución diaria automática solo corre si existe la variable del repositorio `CONTENIDO_ACTIVO` con valor `si` (Settings → Secrets and variables → Actions → Variables). Para pausar el sistema, cámbiala a `no`.

## Claves (Settings → Secrets and variables → Actions → Secrets)

| Secret | De dónde sale |
|---|---|
| `GEMINI_API_KEY2` | Google AI Studio → Get API key (gratis) |
| `ACCOUNT_ID` | Account ID de Cloudflare (Workers AI, gratis) |
| `WORKERS_AI` | Token de Cloudflare: My Profile → API Tokens → plantilla "Workers AI" |

## Archivos

- `cola-recetas.json` — recetas pendientes, en orden. Se pueden editar, quitar o reordenar las que digan `"pendiente"`.
- `automatizacion/estado.json` — fuentes ya usadas (para no repetir noticias) e historial.
- `scripts/contenido/config.mjs` — metas, fuentes, modos por categoría, modelos y reglas del revisor.
- Prueba local sin publicar: `node scripts/contenido/ejecutar.mjs --prueba` (con las claves como variables de entorno).
