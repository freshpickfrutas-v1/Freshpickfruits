# Pendiente: cargar Firebase bajo demanda

**Estado:** no aplicado (decisión: hacerlo más adelante). Este documento deja el plan listo para ejecutarlo en una tarea aparte.

## Por qué y cuándo hacerlo

Hoy el código de Firebase (`firebase-*.js`, unos 677 KB; 168 KB comprimidos) se descarga en **todas** las páginas, incluidas recetas y noticias, aunque la persona nunca inicie sesión. Hacerlo bajo demanda ahorra esos ~168 KB en las páginas que llegan desde Google.

Conviene hacerlo cuando:
- la mayoría del tráfico llegue por recetas y noticias (no por la portada), o
- Search Console / PageSpeed muestre LCP o "JavaScript sin usar" altos en móvil, o
- se vaya a ampliar el contenido y se quiera cuidar la velocidad.

**No hacerlo** en una semana con campañas, temporada alta de pedidos o sin tiempo para probar el pedido completo: toca sesión y pedidos.

## Dónde se usa Firebase hoy (mapa real del código)

| Archivo | Qué hace con Firebase | Se carga en |
|---|---|---|
| `src/lib/firebase.ts` | Crea `app`, `auth`, `db` y los proveedores (Google, Apple, Facebook). Hace una prueba de conexión al cargar. | Todo el sitio |
| `src/context/AuthContext.tsx` | Sesión (`onAuthStateChanged`), perfil en vivo (`onSnapshot`), inicio de sesión, cierre de sesión, promoción de administradores. | Todo el sitio (envuelve `<App/>`) |
| `src/lib/catalog.ts` (`useCatalog`) | Productos de la tienda desde Firestore. | Portada |
| `src/components/CustomOrderSection.tsx` | `createOrder` (`lib/firestore.ts`) y `saveAddresses` (`lib/addresses.ts`). | Portada |
| `src/components/BillingProfile.tsx`, `src/lib/subscriptions.ts`, `OrdersBoard.tsx`, `AdminPanel.tsx`, `UserPanel.tsx` | Paneles de cliente y equipo. | Solo `/panel` y `/admin` (ya cargan aparte) |

Consecuencia importante: **la portada necesita Firebase de inmediato** (catálogo y pedido). Por eso la ganancia real está en `/recetas` y `/noticias` (y sus páginas de detalle), no en la portada.

## Estrategia recomendada (en este orden, un cambio por PR)

### Paso 1 — Separar el "módulo Firebase" del resto
1. Dejar `src/lib/firebase.ts` como está, pero **nunca importarlo de forma estática** desde código que corre en recetas/noticias. Todo acceso pasará por una función asíncrona:
   ```ts
   // src/lib/firebaseLazy.ts
   export const loadFirebase = () => import('./firebase');            // app, auth, db, proveedores
   export const loadFirestoreApi = () => import('firebase/firestore');
   export const loadAuthApi = () => import('firebase/auth');
   ```
2. Quitar de `firebase.ts` la prueba de conexión automática o dejarla solo cuando se cargue el módulo (ya está protegida para el prerender con `typeof window !== 'undefined'`).

### Paso 2 — `AuthContext` sin Firebase en la carga inicial
1. En `AuthProvider`, el `useEffect` que hoy llama a `onAuthStateChanged` pasa a hacer `const fb = await loadFirebase()` y recién ahí suscribirse. Conserva `loading = true` hasta que llegue la primera respuesta, igual que ahora.
2. **Para no perder la sesión de quien ya la tiene:** si no hay nada guardado de Firebase en el navegador, saltarse la carga y poner `loading = false` de inmediato. Una forma simple y segura: revisar si existe una clave de IndexedDB/localStorage de Firebase (`firebase:authUser:…` en localStorage o la base `firebaseLocalStorageDb`). Si no existe → visitante sin sesión → no cargar Firebase. Si existe → cargarlo en segundo plano (idealmente en `requestIdleCallback`).
3. Las funciones `signInWithGoogle/Apple/Facebook` y `signOut` pasan a `async` y cargan Firebase en el momento del clic (`await loadFirebase()`). Mantener intactos los mensajes de error (`auth/popup-blocked`, etc.) y el respaldo con `signInWithRedirect`.
4. **Ojo con el *popup*:** los navegadores bloquean ventanas que se abren después de un `await` largo. Para evitarlo, precargar Firebase cuando la persona abra el menú de cuenta o pase el cursor/toque el botón "Ingresar" (`onPointerEnter`/`onFocus` → `loadFirebase()`), de modo que al hacer clic ya esté cargado.

### Paso 3 — Portada (catálogo y pedido)
1. `useCatalog` (`src/lib/catalog.ts`): importar `firebase/firestore` con `import()` dentro del efecto. La portada ya tiene el catálogo de respaldo en `data/mockData`, úsalo mientras llega Firestore.
2. `CustomOrderSection`: cargar `lib/firestore` y `lib/addresses` con `import()` **dentro de la función de envío del pedido** (`createOrder`, `saveAddresses`). Antes de eso, precargar al enfocar el formulario.
3. Mantener `CartContext` sin cambios (no usa Firebase).

### Paso 4 — Verificar que quedó fuera de recetas/noticias
1. `npm run build` y revisar la lista de archivos: `firebase-*.js` **no** debe aparecer en las dependencias directas de la página `/recetas` (pestaña Network del navegador, sin sesión iniciada: no debe pedirse `firebase-*.js`).
2. `vite.config.ts` ya separa `firebase` en su propio trozo (`manualChunks`); con los `import()` dinámicos, ese trozo pasa a cargarse solo cuando se necesita.
3. Revisar que el prerender (`npm run build`) siga generando las 100+ páginas sin errores y sin abrir conexiones (el log no debe mostrar mensajes de `@firebase/firestore`).

## Prueba obligatoria antes de publicar

Marca cada punto en un despliegue de **vista previa** de Vercel, en celular y en computador:

**Visitante sin sesión**
- [ ] `/recetas`, `/noticias` y una receta: cargan; en Network **no** se pide `firebase-*.js`.
- [ ] Portada: el catálogo aparece con precios y se pueden agregar productos al carrito.
- [ ] Pedido como invitado: se envía y llega a `/admin` (estado "Recibido").
- [ ] Pago con Wompi: abre el widget y vuelve correctamente.

**Inicio de sesión**
- [ ] Google: abre el *popup* a la primera (sin bloqueo del navegador) y deja la sesión iniciada.
- [ ] Apple y Facebook (si están configurados): igual.
- [ ] Celular con *popup* bloqueado: cae al respaldo por redirección y regresa con sesión.
- [ ] Recargar la página con sesión ya iniciada: el botón de cuenta aparece solo (sin pedir ingresar otra vez).
- [ ] Cerrar sesión.

**Cliente con sesión**
- [ ] Pedido con cuenta: se guarda y aparece en `/panel` → Mis pedidos.
- [ ] Guardar una dirección nueva y datos de facturación.
- [ ] Suscripciones: solicitar y ver el estado.

**Equipo (`/admin`)**
- [ ] Entrar con un administrador: se ve el tablero de pedidos y el cambio de rol sigue en vivo.
- [ ] Mover un pedido de estado y registrar una factura.

Si algo falla, el cambio se revierte con un solo `git revert` del PR (no hay migraciones ni datos nuevos).

## Resultado esperado

- `/recetas` y `/noticias`: ~168 KB (comprimidos) menos de JavaScript.
- Portada: igual que hoy (necesita Firebase) o ligeramente mejor si se retrasa hasta después del primer pintado.
- Sin cambios para quien ya tiene sesión, salvo una carga en segundo plano.

## Fuera de alcance (decisiones tomadas)

- **No** se parte el índice de recetas/noticias por año. Con el volumen actual no hace falta; solo se revisaría si la biblioteca llegara a miles de piezas y se notara lenta.
- **No** se agrega "más leídos" (requeriría guardar visitas en Firestore).
