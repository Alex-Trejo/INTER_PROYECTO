# 🌐 Chaski Alert — Frontend Web

**Panel de Monitoreo Comunitario Intercultural**

Aplicación web construida con **Next.js 16** + **TypeScript** + **Tailwind CSS 4** para el monitoreo en tiempo real de alertas de emergencia y gestión de comunicados comunitarios.

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#-requisitos-previos)
- [Inicialización del Proyecto](#-inicialización-del-proyecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Rutas de la Aplicación](#-rutas-de-la-aplicación)
- [Componentes](#-componentes)
- [Diseño y Temas](#-diseño-y-temas)
- [Conexión con el Backend](#-conexión-con-el-backend)
- [Comandos Disponibles](#-comandos-disponibles)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)

---

## ✅ Requisitos Previos

| Herramienta | Versión Mínima | Descripción |
|---|---|---|
| **Node.js** | 18.17+ | Runtime de JavaScript |
| **npm** | 9+ | Gestor de paquetes |
| **Backend API** | — | Debe estar corriendo en `http://localhost:8000` |

---

## 🚀 Inicialización del Proyecto

### 1. Asegurar que el Backend esté corriendo

Antes de iniciar el frontend, el backend FastAPI debe estar activo:

```bash
# Desde INTER_PROYECTO/Backend/
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Instalar Dependencias

```bash
cd Frontend/cliente_web
npm install
```

### 3. Configurar Variables de Entorno

Crear el archivo `.env.local` en la raíz del proyecto web (si no existe):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

> La app redirige automáticamente a `/dashboard/mapa` al cargar.

### 5. Build de Producción (opcional)

```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto

```
Frontend/cliente_web/
├── public/
│   ├── Recurso/                      # Assets del proyecto
│   │   └── Captura de pantalla...png  # Logo de Chaski Alerta
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css               # Design system completo (light/dark)
│   │   ├── layout.tsx                # Root layout (fuente, SEO, tema)
│   │   ├── page.tsx                  # Página raíz (redirect a /dashboard/mapa)
│   │   └── dashboard/
│   │       ├── layout.tsx            # Layout del dashboard (sidebar, nav, theme toggle)
│   │       ├── mapa/
│   │       │   └── page.tsx          # Página del mapa de incidencias
│   │       └── avisos/
│   │           └── page.tsx          # Página de comunicados oficiales
│   └── components/
│       ├── MapView.tsx               # Componente de mapa Leaflet (client-side only)
│       └── ComunicadoCard.tsx        # Card de comunicado con gradiente
├── .env.local                        # Variables de entorno locales
├── package.json                      # Dependencias y scripts
├── tsconfig.json                     # Configuración TypeScript
├── next.config.ts                    # Configuración de Next.js
└── README.md                         # Este archivo
```

---

## 🔐 Variables de Entorno

Archivo `.env.local`:

| Variable | Valor por Defecto | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL base de la API del Backend |

> Variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente (navegador).

---

## 🗺️ Rutas de la Aplicación

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Loading | Pantalla de carga con logo, redirige a `/dashboard/mapa` |
| `/dashboard/mapa` | Mapa de Incidencias | Mapa Leaflet con alertas SOS en tiempo real |
| `/dashboard/avisos` | Comunicados Oficiales | Grid de comunicados + formulario de publicación |

### Página: Mapa de Incidencias (`/dashboard/mapa`)

- **Polling cada 5 segundos** para actualización en tiempo real
- **Stat cards**: Alertas totales, Alertas de hoy, Timestamp en vivo
- **Mapa Leaflet** con tiles CARTO (Voyager para light, Dark para dark mode)
- **Markers rojos** para alertas SOS con popup detallado
- **Auto-fit bounds** al recibir nuevas alertas

### Página: Comunicados Oficiales (`/dashboard/avisos`)

- **Grid responsive** de gradient cards (320px min)
- **Formulario modal** de 2 columnas (slide-down)
- **Campos**: Título, Autor (opcional), Mensaje
- **Publicación vía POST** a la API
- **Actualización manual** con botón "Actualizar"

---

## 🧩 Componentes

### `MapView.tsx`

Componente de mapa interactivo basado en React-Leaflet.

| Característica | Detalle |
|---|---|
| **Renderizado** | Client-side only (dynamic import, `ssr: false`) |
| **Tiles** | CARTO Voyager (light) / CARTO Dark (dark) — se adapta al tema |
| **Markers** | Iconos rojos para alertas SOS |
| **Popups** | Detalle de alerta: usuario, fecha, coordenadas, tiempo relativo |
| **Auto-zoom** | `fitBounds` automático al cargar alertas |
| **Theme-aware** | `MutationObserver` detecta cambios en `data-theme` del HTML |

### `ComunicadoCard.tsx`

Card con gradiente vibrante para mostrar comunicados.

| Característica | Detalle |
|---|---|
| **8 gradientes** | Teal, Orange, Purple, Green, Blue, Red, Pink, Amber |
| **Decoraciones** | Icono SVG semi-transparente, círculo geométrico |
| **Author badge** | Glassmorphism con iniciales del autor |
| **Texto** | Clamped a 3 líneas con `WebkitLineClamp` |
| **Animación** | `fadeUp` con stagger delay por índice |

---

## 🎨 Diseño y Temas

### Sistema de Diseño

El archivo `globals.css` contiene un design system completo con **80+ CSS variables**:

- **Tokens de color**: Teal, Orange, Green, Red (6 tonos cada uno)
- **Surfaces**: body, sidebar, card, input, hover
- **Sombras**: xs, sm, md, lg, xl, card, card-hover, glow
- **Radios**: sm (10px), md (14px), lg (20px), xl (24px), 2xl (28px)
- **Gradientes**: 6 gradientes primarios + 8 gradientes para cards

### Light / Dark Mode

| Aspecto | Light | Dark |
|---|---|---|
| **Body** | `#F0F4F8` | `#0B0F19` |
| **Cards** | `#FFFFFF` | `#1E293B` |
| **Texto** | `#0F172A` | `#F1F5F9` |
| **Tiles del mapa** | CARTO Voyager | CARTO Dark |
| **Persistencia** | `localStorage` key: `chaski-theme` |

Toggle ubicado en el sidebar inferior. El cambio es instantáneo con transición de 0.4s.

### Animaciones

| Clase | Efecto | Duración |
|---|---|---|
| `.animate-fadeUp` | Fade + translate Y 24px → 0 | 0.6s |
| `.animate-fadeIn` | Fade opacity 0 → 1 | 0.4s |
| `.animate-slideRight` | Slide X -24px → 0 | 0.5s |
| `.animate-scaleIn` | Scale 0.92 → 1 + fade | 0.5s |
| `.animate-slideDown` | Slide Y -12px → 0 | 0.35s |
| `.animate-float` | Float Y ±6px loop | 4s infinite |

### Identidad Intercultural

- **Bilingüismo**: Labels en Español + Kichwa (Shutikuna, Willachiy, Willaykuna, Allpamapa)
- **Andean Bar**: Gradiente animado multicolor (teal → green → orange → red)
- **Estado del sistema**: "Sistema Kawsashka" (Sistema Vivo en Kichwa)

---

## 🔗 Conexión con el Backend

El frontend consume los siguientes endpoints:

| Método | Endpoint | Página | Acción |
|---|---|---|---|
| `GET` | `/api/alertas` | Mapa | Obtener alertas para mostrar en el mapa |
| `GET` | `/api/comunicados` | Avisos | Listar comunicados en el grid |
| `POST` | `/api/comunicados` | Avisos | Publicar nuevo comunicado desde el formulario |

> La URL base se configura en `.env.local` con `NEXT_PUBLIC_API_URL`.

### ⚠️ Advertencia de Seguridad (Endpoint de Sesión)

Para facilitar las pruebas de desarrollo y validación con Swagger, el token JWT (`access_token`) ha sido expuesto intencionalmente en el objeto de sesión del cliente. 

Si visitas la ruta `http://localhost:3000/api/auth/session` mientras estás logueado, podrás visualizar y copiar tu Bearer Token en texto plano.

> **[CRÍTICO]**: Este comportamiento es un **riesgo de seguridad grave en producción** (facilita ataques XSS). Antes de desplegar esta aplicación a un entorno real, debes remover la línea `session.access_token = token.access_token` del archivo `src/app/api/auth/[...nextauth]/route.ts`. NextAuth por defecto oculta este token precisamente por seguridad.

### Manejo de Errores

- **Error de conexión**: Banner rojo con mensaje + reintento automático (mapa: cada 5s)
- **Error de publicación**: Banner rojo en el formulario
- **Éxito**: Banner verde con auto-dismiss a los 5 segundos

---

## 📦 Comandos Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack (http://localhost:3000) |
| `npm run build` | Compilar para producción |
| `npm start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** | 16.2.6 | Framework React con SSR y App Router |
| **React** | 19.2.4 | Librería de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Utilidades CSS (usado junto con CSS custom) |
| **React-Leaflet** | 5.0.0 | Mapas interactivos |
| **Leaflet** | 1.9.4 | Librería de mapas base |
| **Plus Jakarta Sans** | — | Tipografía principal (Google Fonts) |
| **CARTO Basemaps** | — | Tiles del mapa (Voyager + Dark) |

---

## 📄 Licencia

Proyecto académico — **Universidad Técnica de Ambato** · Materia: Interculturalidad · Parcial I · 2026
