# Plan de mejoras post-evaluación — Chaski Alert

> Documento de revisión. **No se ha modificado ni ejecutado nada todavía.**
> Fecha: 8 de julio de 2026

---

## PARTE 0 — Verificación del informe (hallazgos)

Releí el informe completo contrastándolo con los datos y el código. Hay **7 textos que quedaron
desactualizados** de la versión anterior (cuando había 14 problemas y resultados más negativos).
Ninguno afecta a las tablas ni a los gráficos; son frases de acompañamiento.

| # | Dónde | Dice ahora (incorrecto) | Debe decir |
|---|---|---|---|
| 1 | §2.2.1, justificación PSSUQ | "mensajes de error técnicos en inglés, **retroalimentación contradictoria ante fallas de permisos**" | Ese hallazgo fue retirado. Debe hablar de idioma del login y ausencia de ayuda. |
| 2 | §3.1, procedimiento | "sobre los **15 problemas** documentados" | Son **10** problemas. |
| 3 | Figura 19 (pie) | "**H1 (visibilidad del estado) concentra los hallazgos más graves**" | Falso hoy: H3 tiene la severidad media más alta (3.0) y H1 baja a 2.30. |
| 4 | Figura 21 (pie) | "perfil hedónico fuerte y **pragmático débil** (Fiabilidad, Eficiencia)" | Ambas están **Sobre el promedio** (+1.25 y +1.13). No son débiles. |
| 5 | §4.4, párrafo final | "…lo segundo a **los errores técnicos visibles, al indicador de estado que no refleja la conectividad real**" | Ambos hallazgos fueron retirados del informe. |
| 6 | Figura 22 (pie) | "convergencia en torno a una calidad **'aceptable' con brecha pragmática**" | Hoy el perfil es positivo en las seis escalas. |
| 7 | §5.2 | "al normalizar las puntuaciones (**Figura 12**)" | La figura comparativa es la **Figura 22**. |

### ⚠️ Aviso importante antes de regenerar

El `.docx` que tienes tiene **ediciones manuales tuyas** que el script NO conoce y que se
**perderían** si regenero el documento:

- Encabezado de la Universidad de las Fuerzas Armadas ESPE, departamento, carrera y NRC 30745.
- Los cuatro nombres de autores (Alejandro Andrade, Alex Trejo, Allan Panchi, Milena Maldonado).
- Fechas cambiadas a 05/07/2026 en la introducción y en el Anexo A.

Además quedó una **inconsistencia de fechas**: la introducción dice "5 de julio", pero §3.1
dice "8 de julio". Hay que unificar.

**Decisión necesaria:** o incorporo tus datos (universidad, autores, fecha 05/07) al script y
regenero todo limpio, o te entrego la lista de 7 correcciones para que las apliques a mano sobre
tu `.docx` actual. Ver preguntas al final.

---

## PARTE 1 — Revisión del plan de Gemini

La estructura general (4 fases) es razonable, pero **contiene errores de hecho que romperían el
trabajo si se ejecutan tal cual**. Verifiqué cada ruta y dependencia contra el repositorio real:

### Errores confirmados

| Gemini dice | Realidad verificada | Impacto |
|---|---|---|
| "Crearemos **`middleware.ts`** en Next.js" | En **Next.js 16** el archivo es **`proxy.ts`** y **ya existe** (`src/proxy.ts`, con `withAuth`). Crear `middleware.ts` no se ejecutaría. | Alto — la corrección de RBAC no funcionaría |
| `cliente_movil/screens/**YanapawayScreen.tsx**` | El archivo real es **`SOSScreen.tsx`**. `Yanapaway` es solo el texto del encabezado. | Alto — ruta inexistente |
| `cliente_web/.../dashboard/**comunicados**/page.tsx` | La ruta real es **`dashboard/avisos/page.tsx`**. | Alto — ruta inexistente |
| "Uso de un hook **`useSWR`**" | **SWR no está instalado**. El proyecto ya resuelve esto con `useEffect` + `setInterval` en `mapa/page.tsx`. | Medio — dependencia innecesaria |

### Afirmaciones imprecisas

- **"HTTPS necesario para notificaciones seguras"** — incorrecto. Las notificaciones push viajan
  `dispositivo ↔ Google FCM` y `backend → FCM`; **no requieren que tu backend tenga dominio ni
  HTTPS**. Lo que sí necesita dominio/HTTPS es que la app funcione **fuera de tu red WiFi** y que
  Keycloak opere en modo producción. Son dos problemas distintos.
- **Editar `chaski-realm.json` para el idioma** — insuficiente por sí solo: el realm **ya está
  importado en la base de datos**, así que un cambio en el JSON no se aplica solo. Hay que
  cambiarlo en la consola de administración (o por API) **y además** actualizar el JSON para
  futuras importaciones.
- **Firebase por `@react-native-firebase`** — es una opción válida, pero hay un camino con menos
  trabajo: ya tienes **`expo-notifications` instalado y funcionando** (hoy para notificaciones
  locales). Ver Parte 2.

### Aciertos del plan de Gemini
- Agrupar por fases y atacar primero FCM (es efectivamente el problema de mayor impacto: P05).
- La idea de *hold-to-activate* para el SOS (P04) y el onboarding (P07).
- El plan de verificación (probar con la app cerrada y la pantalla apagada) es correcto.
- Preguntar antes de tocar el dominio.

---

## PARTE 2 — Notificaciones push (P05): ¿hace falta Firebase?

**Sí, un proyecto de Firebase es obligatorio.** En Android **todo** push remoto pasa por FCM
(Firebase Cloud Messaging); no hay alternativa. Lo que se decide es **quién habla con FCM**:

### Opción A — Expo Push Service *(recomendada para este proyecto)*
```
App → token de Expo → Backend guarda token en BD
Backend → https://exp.host/--/api/v2/push/send → Expo → FCM → teléfono
```
- Aprovecha `expo-notifications` que **ya está instalado y configurado** (canal Android, plugin).
- Requiere: proyecto de Firebase (para subir las credenciales FCM V1 a Expo) + `eas init`
  (la app **no tiene `projectId` de EAS** todavía).
- Trabajo estimado: bajo. Menos código nativo, sin tocar Gradle.

### Opción B — `@react-native-firebase` directo *(la que propone Gemini)*
```
App → token FCM → Backend guarda token
Backend (firebase-admin) → FCM → teléfono
```
- Sin intermediarios ni cuenta de Expo; control total.
- Requiere: `google-services.json`, plugin de Gradle, `firebase-admin` en Python, y recompilar
  el APK nativo.
- Trabajo estimado: medio-alto. Más piezas que pueden fallar en Windows (ya sufriste MAX_PATH).

**Falta en ambos casos:** no existe columna para guardar el token push en la base de datos
(verificado en `init.sql` / `final.sql` / `schemas.py`), así que hay que añadir la tabla/columna
y un endpoint `POST /api/dispositivos/token`.

---

## PARTE 3 — Dominio GoDaddy y despliegue

Hoy la IP está **quemada en `.env`** (`192.168.50.6`) y cambia cada vez que cambias de red — esa
es la razón real por la que la app "se rompe" al moverte. Un dominio lo soluciona de raíz.

| Alternativa | Costo | Ventajas | Desventajas |
|---|---|---|---|
| **Cloudflare Tunnel** (recomendada) | $0 | HTTPS automático, sin abrir puertos del router, funciona detrás de CGNAT | Hay que mover los *nameservers* de GoDaddy a Cloudflare (gratis); tu PC debe estar encendida |
| **VPS** (Hetzner/DigitalOcean) + registro A en GoDaddy | ~$5/mes | Servicio real 24/7, independiente de tu PC | Cuesta dinero y hay que desplegar todo el stack allá |
| **ngrok gratuito** | $0 | Inmediato | La URL cambia en cada reinicio; no sirve con dominio propio |

Subdominios propuestos: `api.tudominio.com` → backend :8000 · `auth.tudominio.com` → Keycloak :8080
· `panel.tudominio.com` → web :3000.

**Ojo con Keycloak:** al pasar a HTTPS hay que fijar `KC_HOSTNAME`, actualizar los *redirect URIs*
de los clientes `web-app` y `mobile-app`, y quitar el `usesCleartextTraffic` del Android.

---

## PARTE 4 — Deuda técnica detectada (auditoría del repo)

| # | Deuda | Estado verificado |
|---|---|---|
| D1 | `proxy.ts` valida sesión pero **no el rol** → un Comunero carga `/dashboard` | Confirmado en vivo hoy. (Lo retiraste del informe, pero sigue siendo real) |
| D2 | Sin FCM: no hay push con la app cerrada | Confirmado — solo notificaciones locales |
| D3 | IP fija en `.env` del móvil, se rompe al cambiar de red | Confirmado |
| D4 | Sin columna de token push en BD | Confirmado |
| D5 | `comunicados.py` solo tiene `POST` y `GET` — falta `PUT`/`DELETE` | Confirmado |
| D6 | Realm de Keycloak **sin claves de i18n** (`internationalizationEnabled` ausente) | Confirmado |
| D7 | 16 comunicados de prueba ('test', 'aq', 'ss'…) contaminando la BD de demo | Confirmado |
| D8 | Tráfico en texto plano (HTTP) entre app y backend | Confirmado |

---

## PARTE 5 — Plan de ejecución propuesto

Ordenado por impacto/esfuerzo. **Cada fase se ejecuta solo con tu aprobación previa.**

### Fase 1 — Correcciones rápidas de UX (sin infraestructura) · ~1 sesión
Resuelve **P02, P03, P04, P06, P08, P09** sin depender de Firebase ni del dominio.

| Problema | Archivo real | Cambio |
|---|---|---|
| P04 SOS de un toque | `cliente_movil/screens/SOSScreen.tsx` | Mantener pulsado 3 s con anillo de progreso + vibración |
| P09 GPS denegado | `cliente_movil/screens/SOSScreen.tsx` | Si no hay GPS, enviar alerta con el **sector del perfil** (ya existe: "Sector Sur / Uray Llakta") |
| P08 Info técnica | `cliente_movil/screens/InfoScreen.tsx` | Vista limpia para el comunero; datos técnicos tras 7 toques en el logo |
| P02 Comunicado sin confirmar | `cliente_web/src/app/dashboard/avisos/page.tsx` | Mínimo 10 caracteres + diálogo "¿Enviar a toda la comunidad?" |
| P03 Sin editar/eliminar | `Backend/routers/comunicados.py` + `avisos/page.tsx` | `PUT`/`DELETE` protegidos por rol Directiva + botones en la tarjeta |
| P06 Muro web estático | `avisos/page.tsx` | Replicar el `setInterval` de 10 s + indicador "En vivo" **igual que `mapa/page.tsx`** (sin instalar SWR) |
| D7 Datos basura | BD | Limpiar los comunicados de prueba |

### Fase 2 — Idioma del login (P01, P10, D6) · ~medio día
1. Activar i18n en Keycloak: `internationalizationEnabled: true`, `defaultLocale: es`
   (por consola de administración **y** en `chaski-realm.json`). Keycloak trae el español
   incorporado → "Sign in to your account" pasa a "Inicia sesión en tu cuenta" sin más trabajo.
2. Tema personalizado con textos bilingües Kichwa ("Yaykuna / Iniciar Sesión") y el logo.
3. P10: página de login propia en Next.js que redirija directo a Keycloak, sin la pantalla
   intermedia genérica.

### Fase 3 — Notificaciones push reales (P05, D2, D4) · ~1 sesión
1. Crear proyecto en Firebase (te guío con capturas) y obtener credenciales FCM V1.
2. `eas init` en el móvil para obtener `projectId`.
3. Registro del token: pantalla pide permiso → `getExpoPushToken()` → `POST /api/dispositivos/token`.
4. Migración de BD: tabla `dispositivos(usuario_id, token, plataforma, actualizado)`.
5. Backend: al crear alerta o comunicado, enviar push a todos los tokens (prioridad alta para Doze).
6. Prueba de aceptación: **app cerrada, pantalla apagada** → llega la notificación.

### Fase 4 — Dominio y despliegue (D3, D8) · ~1 sesión
1. Elegir método (ver preguntas).
2. Configurar DNS de los tres subdominios y certificados.
3. Cambiar `.env` del móvil a `https://api.tudominio.com`, actualizar redirect URIs de Keycloak,
   quitar cleartext traffic, recompilar APK.

### Fase 5 (opcional) — RBAC por rol (D1)
Añadir la validación de rol dentro del `withAuth` de **`src/proxy.ts`** (no crear `middleware.ts`).
Verificación: entrar con `vecino@chaski.ec` y confirmar que el panel lo rechaza con un mensaje claro.

---

## Verificación final propuesta
1. Push con la app **cerrada** y pantalla apagada → llega alerta sonora.
2. Login del móvil en español desde el primer arranque.
3. SOS accidental (un toque) **no** dispara alerta; mantener 3 s sí.
4. Publicar comunicado exige confirmación; se puede editar y eliminar.
5. La app funciona desde **datos móviles** (fuera del WiFi) contra el dominio.
6. `vecino@chaski.ec` no accede al panel de Directiva.
