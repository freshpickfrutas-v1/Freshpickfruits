# Fresh Pick — Documentación del proyecto

Sitio web y sistema de pedidos de **Fresh Pick**, arándanos premium de alta montaña cultivados en la Vereda Santa Bárbara, Guasca (Cundinamarca, Colombia), a más de 2.800 m.s.n.m.

- **Sitio público:** https://www.freshpickfruits.com
- **Repositorio:** `freshpickfrutas-v1/Freshpickfruits` (GitHub, rama `main`)
- **Contacto:** info@freshpickfruits.com · WhatsApp +57 317 893 1026

---

## 1. Qué incluye

| Área | Qué hace |
|---|---|
| **Tienda** | Catálogo de estuches (125 g, 250 g, 500 g), carrito, armador de pedidos personalizados y planes de suscripción. |
| **Recetas y noticias** | 21 recetas y 11 artículos sobre vida saludable, recetas e investigación, con publicación automática. |
| **Panel de cliente** (`/panel`) | Mis pedidos, suscripciones, libreta de direcciones y datos de facturación. |
| **Panel del equipo** (`/admin`) | Flujo de pedidos en 7 estados (Kanban y tabla), suscripciones, productos, clientes y gestión de roles. |
| **Contenido automático** | Una receta al día y hasta 7 noticias por semana, generadas con IA y revisadas por reglas. |

---

## 2. Tecnología

- **Interfaz:** React 19 + TypeScript, Vite, Tailwind CSS v4, `lucide-react`, `motion`.
- **Datos y acceso:** Firebase (Authentication y Firestore).
- **Despliegue:** Vercel. Cada subida a `main` despliega el sitio.
- **Pagos en línea:** Wompi (widget) + funciones de servidor en `api/` (firma de integridad y webhook) con `firebase-admin`.
- **Contenido automático:** GitHub Actions + Gemini (texto) + Cloudflare Workers AI (imágenes).

### Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor local en http://localhost:3000
npm run build        # genera el sitemap y compila a dist/
npm run lint         # revisión de tipos (tsc --noEmit)
```

> `npm run lint` marca hoy un error conocido en `src/components/StructuredData.tsx` (no afecta la compilación).

---

## 3. Estructura de carpetas

```
src/
  App.tsx                 Rutas y proveedores (sesión y carrito)
  pages/                  PublicHome, RecipesPage, RecipeDetailPage, BlogPage,
                          BlogArticlePage, UserPanel, AdminPanel
  components/             Navbar, Hero, FruitCatalog, CustomOrderSection,
                          SubscriptionPlans, OrdersBoard, SubscriptionsBoard,
                          AddressBook, AddressField, BillingProfile, AuthGate,
                          AccountMenu, MobileBottomBar, LatestNews, Footer…
  lib/                    firebase, firestore, orderFlow, subscriptions,
                          addresses, catalog, maps, router, seo
  context/                AuthContext (sesión + rol), CartContext
  data/                   mockData (catálogo original, planes, preguntas), blog, recipes
  content/recetas|noticias  Un archivo JSON por pieza de contenido
api/wompi/                Funciones de servidor de Vercel: firma.ts (firma de integridad) y webhook.ts (confirmación de pago)
api/_lib/                 admin.ts (Firebase Admin) y email.ts (correo de confirmación con Resend)
scripts/contenido/        Automatización de recetas y noticias
automatizacion/           Estado de la automatización (fuentes usadas, historial)
.github/workflows/        contenido.yml, imagenes-faltantes.yml
firestore.rules           Reglas de seguridad de Firestore
firebase-applet-config.json  Configuración web de Firebase
cola-recetas.json         Cola de recetas pendientes
```

### Rutas

| Ruta | Contenido |
|---|---|
| `/` | Inicio: hero, variedades, armar pedido, recetas, artículos, planes, sostenibilidad, testimonios y preguntas |
| `/recetas`, `/recetas/:slug` | Listado y detalle de recetas |
| `/noticias`, `/noticias/:slug` | Listado y detalle de artículos |
| `/panel` | Panel de cliente (pide iniciar sesión) |
| `/admin` | Panel del equipo (solo roles del equipo) |

Cualquier otra dirección muestra hoy la página de inicio (no hay página 404 real).

---

## 4. Firebase

- **Proyecto:** `yogic-oxygen-h53bd-869ca` (cuenta de `info@freshpickfruits.com`)
- **Base de datos:** `(default)`, ubicación `nam5`
- **Autenticación:** Google activo. Apple y Facebook tienen botón en el sitio, pero requieren su propia configuración en Firebase.
- **Dominios autorizados:** `freshpickfruits.com` y `www.freshpickfruits.com`

### Colecciones de Firestore

| Colección | Contenido | Quién accede |
|---|---|---|
| `users/{uid}` | Perfil, rol, direcciones guardadas y datos de facturación | El dueño y el administrador |
| `orders/{id}` | Pedidos, con cliente, entrega, facturación, estado e historial | Crea cualquiera; lee el equipo o el dueño; edita el equipo |
| `subscriptions/{id}` | Solicitudes y suscripciones activas | Crea el cliente; gestiona el equipo |
| `products/{id}` | Catálogo administrable | Lectura pública; escribe solo el administrador |

Las reglas completas están en [`firestore.rules`](firestore.rules). **Cada cambio en ese archivo hay que publicarlo a mano** en Firebase → Firestore → Reglas (base `(default)`).

---

## 5. Roles del equipo

Se asignan desde `/admin` → **Equipo**. Cada persona debe iniciar sesión una vez antes de aparecer.

| Rol | Puede hacer |
|---|---|
| **Administrador** | Todo. Los correos `info@freshpickfruits.com` y `freshpickfrutas@gmail.com` entran siempre como administradores. |
| **Finanzas / Tesorería** | Confirmar pagos y cancelar pedidos; gestionar suscripciones. |
| **Poscosecha** | Iniciar alistamiento y marcar pedidos como empacados. |
| **Auxiliar contable** | Registrar facturas electrónicas y cerrar ventas; ve suscripciones y clientes. |
| **Asistente todero** | Despachar, crear pedidos manuales y gestionar suscripciones. |
| **Domiciliario** | Confirmar entregas. |
| **Cliente** | Su propio panel; no ve el panel del equipo. |

> La restricción por rol del flujo de pedidos está en la pantalla. Las reglas de Firestore solo comprueban que sea alguien del equipo.

---

## 6. Flujo de pedidos (7 estados)

```
1 Recibido → 2 Pago verificado → 3 En poscosecha y facturación → 4 Empacado
→ 5 En ruta → 6 Entregado → 7 Factura emitida y cierre   (+ Cancelado)
```

| Paso | Acción | Responsable |
|---|---|---|
| 1 → 2 | Confirmar pago | Finanzas |
| 2 → 3 | Iniciar alistamiento | Poscosecha |
| 3 → 4 | Marcar empacado | Poscosecha |
| 4 → 5 | Despachar | Asistente / Contabilidad |
| 5 → 6 | Confirmar entrega | Domiciliario / Asistente |
| 6 → 7 | Cerrar venta (exige factura registrada) | Contabilidad |
| en paralelo | Registrar número y enlace de la factura (World Office) | Contabilidad |

- Vistas: **Tablero Kanban** y **Tabla** de procesos. Filtros por origen y "Solo lo mío".
- Origen del pedido: *Web · con cuenta*, *Web · invitado* o *Manual*.
- Cada cambio queda en el historial con quién y cuándo.
- Los mensajes de WhatsApp al cliente salen prellenados con un toque (aún no se envían automáticamente).

### Reglas de pedido
- Mínimo 500 g en total.
- Estuches de 125 g y 250 g: de a 2 unidades. Estuche de 500 g: desde 1.
- Entregas martes y miércoles, de 8:00 a.m. a 3:00 p.m., solo en **Bogotá D.C.**
- Pago en línea con Wompi (tarjeta, PSE, Nequi), o por transferencia bancaria / Bre-B `@9010401617`. Ver la sección 8 (Pagos con Wompi).
- **No se despacha un pedido sin pago verificado**: el botón "Despachar" se bloquea y la acción también se rechaza en `applyOrderAction`.

---

## 7. Direcciones y facturación

- **Libreta de direcciones** en el panel de cliente: guardar una vez, elegir en cada pedido, agregar más (hasta 10), una principal. Con complemento (apto, torre), barrio e indicaciones. Ciudad fija: Bogotá D.C.
- **Datos de facturación** guardados en la cuenta: cédula o NIT con DV, razón social, régimen fiscal, correo y dirección de facturación. Se completan solos en cada pedido.
- **Mensaje de WhatsApp del pedido** completo: cliente, entrega con enlace de Google Maps, facturación, productos, totales y forma de pago.
- **Google Maps:** las sugerencias de dirección necesitan la variable `VITE_GOOGLE_MAPS_API_KEY` (Places API New). Sin ella, la dirección se escribe a mano y se verifica con un enlace a Google Maps.

---

## 8. Pagos con Wompi

### Cómo funciona

1. El cliente confirma su pedido (formulario "Armar pedido", o desde el carrito con **Continuar y pagar en línea**, que pasa los estuches al formulario).
2. Aparece **Pagar en línea**. El navegador pide la firma a `POST /api/wompi/firma` con el ID del pedido. El servidor toma el **monto del pedido guardado en Firestore** (nunca del navegador), crea la referencia y calcula la firma de integridad SHA256.
3. Se abre el widget de Wompi. El resultado que ve el navegador es solo informativo.
4. Wompi avisa a `POST /api/wompi/webhook` (evento `transaction.updated`). El servidor valida el checksum con el secreto de eventos y que el monto cobrado sea igual al total del pedido. Si el estado es `APPROVED`:
   - guarda el registro de pago en el pedido (`payment`: referencia, ID de transacción, método, valor cobrado, fecha de aprobación),
   - marca `paymentStatus: verificado` y pasa el pedido a **Pago verificado** (historial: "Wompi"),
   - envía un correo de confirmación al cliente (si Resend está configurado).

### Referencia de pago

Formato: `FP-2026-4821_<ID del pedido>_<intento>`. En el dashboard de Wompi se lee el número del pedido; el webhook usa el ID del pedido (segunda parte) para encontrarlo. Cada intento de pago tiene su propia referencia.

### Verificar un pago antes de despachar

- Pedido en **Pago verificado**, con historial "Wompi" y datos en el bloque **Pago** del detalle: se puede alistar y despachar.
- Duda: buscar la transacción en el dashboard de Wompi con la referencia o el ID.
- Si el cliente pagó, Wompi la muestra aprobada y el pedido sigue en "Recibido": revisar en Vercel → Logs si llegó la llamada al webhook y, si Wompi la aprobó, Finanzas usa **Registrar pago y confirmar** manualmente.

### Conciliación

- En `/admin` el buscador encuentra por número de pedido, cliente, correo, teléfono, **referencia** o **ID de transacción**.
- **Exportar pagos (CSV)** genera una fila por pedido pagado (método, referencia, ID, valor, aprobado, fecha de entrega, despacho, entregado, factura) para comparar con el reporte de Wompi al cierre del mes.
- Pagos por transferencia o Bre-B: Finanzas registra a mano los mismos datos al confirmar el pago.

### Configuración

Variables en Vercel (proyecto → Settings → Environment Variables; luego *Redeploy*):

| Variable | Uso |
|---|---|
| `VITE_WOMPI_PUBLIC_KEY` | Llave pública de Wompi (`pub_test_…` / `pub_prod_…`). Sin ella el botón no aparece |
| `WOMPI_INTEGRITY_SECRET` | Secreto de integridad (Wompi → Desarrolladores → Secretos para integración técnica) |
| `WOMPI_EVENTS_SECRET` | Secreto de eventos (misma pantalla) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON de la cuenta de servicio de Firebase (Configuración del proyecto → Cuentas de servicio) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TEAM` | Opcionales: correo de confirmación (remitente de un dominio verificado en Resend; copia oculta al equipo) |

- URL de eventos en el dashboard de Wompi: `https://www.freshpickfruits.com/api/wompi/webhook`.
- La llave privada de Wompi (`prv_…`) **no se usa** y no debe cargarse. Los secretos nunca van en el código ni en el chat.
- Llaves de pruebas (`pub_test_`) para probar sin dinero real; las de producción (`pub_prod_`) cobran de verdad.

---

## 9. Suscripciones

Cuatro planes mensuales de 2.000 g (entregas semanales o quincenales). El cliente solicita el plan desde su panel y el equipo lo activa.

Estados: `solicitada` → `activa` ⇄ `pausada` → `cancelada`. El administrador ve activas, ingreso mensual recurrente, por activar y pausadas; el cliente puede pedir pausa o cancelación.

Pendiente: generar automáticamente el pedido de cada entrega programada y el cobro recurrente.

---

## 10. Contenido automático

Cada día a las 9:00 a.m. (hora de Colombia), GitHub Actions ejecuta `scripts/contenido/ejecutar.mjs`:

- **1 receta** tomada en orden de `cola-recetas.json`.
- **Noticias** con meta de 7 por semana (máximo 2 por día).
- **Línea editorial:** vida saludable, recetas y artículos investigativos. No se publican noticias de competitividad, mercado, exportaciones, otros países ni competidores (filtro `TEMAS_VETADOS` en `scripts/contenido/config.mjs`).
- **Fuentes:** ScienceDaily (nutrición) y PubMed, más noticias de la finca enviadas como *issues* con la etiqueta `noticia-finca`.
- Las piezas de salud y ciencia llegan como **Pull Request** para aprobar; las demás se publican directo.
- Cada pieza lleva imagen generada con IA y pasa por un revisor automático (sin afirmaciones médicas, fuentes que abren, largo adecuado).

Más detalle en [`scripts/contenido/LEEME.md`](scripts/contenido/LEEME.md).

### Secretos (GitHub → Settings → Secrets and variables → Actions)

| Secreto | Para qué |
|---|---|
| `ARANDANOS_ARTICULOS` (o `GEMINI_API_KEY2`) | Clave de Gemini (texto) |
| `ACCOUNT_ID` | Cuenta de Cloudflare (imágenes) |
| `WORKERS_AI` | Token de Workers AI |

La ejecución automática solo corre si existe la variable del repositorio `CONTENIDO_ACTIVO` con valor `si`.

---

## 11. Despliegue

1. Trabaja en una rama (`feature/…`) y compila: `npm run build`.
2. Sube a `main`: Vercel despliega solo.
3. Si cambiaste `firestore.rules`, **publícalas** en Firebase.
4. Si cambiaste variables (por ejemplo la de Google Maps), hazlo en Vercel → Settings → Environment Variables y pulsa *Redeploy*.

Variables de entorno (ver `.env.example`):

| Variable | Uso |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Sugerencias de dirección (opcional) |
| `VITE_WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`, `FIREBASE_SERVICE_ACCOUNT` | Pagos con Wompi (ver sección 8) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TEAM` | Correo de confirmación de pago (opcional) |

---

## 12. Pendientes y decisiones abiertas

**Legal y confianza**
- Páginas de política de privacidad, términos y condiciones, política de reembolsos y entregas, y aviso de cookies (requisitos del banco y de la ley de datos personales). Faltan razón social, NIT, dirección legal y correo de datos personales.
- Revisar los testimonios y afirmaciones del sitio ("sin residuos químicos", certificaciones, garantía) para confirmar que son verificables.

**Pagos y comunicación**
- Pagos con Wompi: cargar las variables en Vercel, configurar la URL de eventos, probar con llaves `pub_test_` y pasar a producción (requiere las páginas legales de arriba).
- Unificar el costo de envío: el carrito calcula $7.000 (gratis desde $60.000) y el formulario de pedido $6.000; el formulario es el que se cobra.
- Pago recurrente de las suscripciones.
- Envío automático de mensajes de WhatsApp con la API de WhatsApp Business.
- Facturación integrada con World Office (hoy se registra el número y el enlace a mano).

**Calidad del sitio**
- Página 404 real, contraste de color de algunos textos pequeños, etiquetas de formularios, cabeceras de seguridad, optimización de imágenes y protección contra pedidos falsos (Firebase App Check).
- Restringir en las reglas qué rol puede mover cada estado del pedido.

**Acceso**
- Apple y Facebook: configurar cada proveedor en Firebase (Apple exige cuenta de desarrollador de pago).
- Google Maps: activar Places API (New) con una clave restringida a los dominios del sitio (requiere cuenta de facturación de Google Cloud).

---

*Documento generado el 2 de octubre de 2026. Actualizado el 8 de octubre de 2026 (pagos con Wompi).*
