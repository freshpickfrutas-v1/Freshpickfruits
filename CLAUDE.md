# Fresh Pick — guía para Claude

Sitio y sistema de pedidos de arándanos premium (freshpickfruits.com). La documentación completa
(arquitectura, Firebase, roles, flujo de pedidos, Wompi, suscripciones, contenido automático,
despliegue y pendientes) está en **[PROYECTO.md](PROYECTO.md)**: léelo antes de cambios grandes.

## Resumen técnico
- React 19 + TypeScript + Vite + Tailwind v4; datos en Firebase (Auth + Firestore).
- Despliegue en Vercel: cada subida a `main` despliega. Funciones de servidor en `api/` (Wompi).
- Contenido (recetas/noticias) en `src/content/*.json`, generado con GitHub Actions + Gemini.
- `public/sitemap.xml` se regenera con `npm run build` (`scripts/generar-sitemap.mjs`).

## Comandos
`npm install` · `npm run dev` (puerto 3000) · `npm run build` · `npm run lint` (tsc; hay un error conocido en `StructuredData.tsx`).

## Reglas
- Idioma del sitio y de los commits: español.
- `.env` nunca se sube a git; copiarlo a mano a cada equipo.
- Ramas `borradores/*` son borradores automáticos de contenido: no tocar sin revisar.
- Rutina entre equipos: `git pull` al empezar, `git commit` + `git push` al terminar.
  El historial de conversaciones con Claude NO viaja por git; este archivo y PROYECTO.md sí.
