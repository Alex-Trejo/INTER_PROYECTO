# 🏔️ Chaski Alert — Backend API

**Sistema de Alerta Comunitaria Intercultural Andina**

API REST construida con **FastAPI** + **PostGIS** para gestionar alertas de emergencia y comunicados oficiales de comunidades rurales del Ecuador.

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#-requisitos-previos)
- [Inicialización del Proyecto](#-inicialización-del-proyecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos](#-base-de-datos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Documentación Swagger](#-documentación-swagger)
- [Pruebas con cURL](#-pruebas-con-curl)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)

---

## ✅ Requisitos Previos

| Herramienta | Versión Mínima | Descripción |
|---|---|---|
| **Python** | 3.10+ | Lenguaje del backend |
| **Docker Desktop** | 4.x | Para la base de datos PostGIS |
| **pip** | 22+ | Gestor de paquetes de Python |

---

## 🚀 Inicialización del Proyecto

### 1. Levantar la Base de Datos (Docker)

Desde la **raíz del proyecto** (`INTER_PROYECTO/`):

```bash
docker-compose up -d
```

Esto levantará un contenedor PostgreSQL + PostGIS en el **puerto 5433** con:
- **Usuario:** `admin`
- **Contraseña:** `password123`
- **Base de datos:** `chaski_alerta`
- **Script de inicialización:** `Backend/init.sql` (crea tablas y datos de ejemplo automáticamente)

> **Nota:** Se usa el puerto `5433` (no el estándar `5432`) para evitar conflictos con instalaciones locales de PostgreSQL.

Verificar que el contenedor está corriendo:

```bash
docker ps
```

Debe mostrar el contenedor `chaski_db` en estado `Up`.

### 2. Crear el Entorno Virtual de Python

```bash
cd Backend
python -m venv venv
```

### 3. Activar el Entorno Virtual

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.\venv\Scripts\activate.bat
```

**Linux / macOS:**
```bash
source venv/bin/activate
```

### 4. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 5. Ejecutar el Servidor

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

O directamente:

```bash
python main.py
```

El servidor estará disponible en: **http://localhost:8000**

---

## 📁 Estructura del Proyecto

```
Backend/
├── .env                 # Variables de entorno (conexión DB, host, puerto)
├── init.sql             # Script SQL de inicialización (tablas + datos ejemplo)
├── main.py              # Aplicación FastAPI principal (endpoints, modelos, CORS)
├── requirements.txt     # Dependencias de Python
├── venv/                # Entorno virtual (no se sube a git)
└── README.md            # Este archivo
```

---

## 🔐 Variables de Entorno

Archivo `.env` en la raíz del Backend:

| Variable | Valor por Defecto | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://admin:password123@localhost:5433/chaski_alerta` | URL de conexión a PostgreSQL + PostGIS |
| `HOST` | `0.0.0.0` | Host del servidor |
| `PORT` | `8000` | Puerto del servidor |

---

## 🗄️ Base de Datos

### Motor
**PostgreSQL 15** con extensión **PostGIS 3.3** (imagen Docker: `postgis/postgis:15-3.3`)

### Esquema de Tablas

#### `alertas` — Alertas de Emergencia (CU-04)

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Identificador único |
| `usuario_nombre` | `VARCHAR(100)` | Nombre del usuario (default: "Vecino Anónimo") |
| `coordenadas` | `GEOMETRY(Point, 4326)` | Coordenadas GPS almacenadas como geometría PostGIS |
| `fecha_hora` | `TIMESTAMP` | Fecha y hora de la alerta (default: `CURRENT_TIMESTAMP`) |

#### `comunicados` — Comunicados Oficiales (CU-08/09)

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Identificador único |
| `titulo` | `VARCHAR(200) NOT NULL` | Título del comunicado |
| `mensaje` | `TEXT NOT NULL` | Contenido del comunicado |
| `autor` | `VARCHAR(100)` | Autor (default: "Directiva Comunal") |
| `fecha_publicacion` | `TIMESTAMP` | Fecha de publicación (default: `CURRENT_TIMESTAMP`) |

#### Índices

- `idx_alertas_coordenadas` — Índice espacial GIST sobre `alertas.coordenadas` para consultas geográficas eficientes.

---

## 🌐 Endpoints de la API

### Health Check

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Estado del servidor |

**Respuesta:**
```json
{
  "sistema": "Chaski Alert",
  "estado": "✅ Activo / Kawsashka",
  "version": "1.0.0",
  "descripcion": "Sistema de Alerta Comunitaria Intercultural Andina"
}
```

---

### Alertas / Yanapaway

| Método | Ruta | Descripción | CU |
|---|---|---|---|
| `POST` | `/api/alertas` | Emitir alerta de emergencia | CU-04 |
| `GET` | `/api/alertas` | Consultar alertas para mapa | CU-05 |

#### `POST /api/alertas` — Emitir Alerta

**Request Body:**
```json
{
  "lat": -0.22,
  "lng": -78.52,
  "usuario_nombre": "Juan Quispe"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `lat` | `float` | ✅ | -90 a 90 | Latitud GPS |
| `lng` | `float` | ✅ | -180 a 180 | Longitud GPS |
| `usuario_nombre` | `string` | ❌ | máx. 100 chars | Nombre del usuario (default: "Vecino Anónimo") |

**Response (201):**
```json
{
  "id": 1,
  "lat": -0.22,
  "lng": -78.52,
  "usuario_nombre": "Juan Quispe",
  "fecha_hora": "2026-05-11T05:45:00.123456"
}
```

#### `GET /api/alertas` — Consultar Alertas

**Response (200):**
```json
[
  {
    "id": 1,
    "lat": -0.22,
    "lng": -78.52,
    "usuario_nombre": "Juan Quispe",
    "fecha_hora": "2026-05-11T05:45:00.123456"
  }
]
```

---

### Comunicados / Willaykuna

| Método | Ruta | Descripción | CU |
|---|---|---|---|
| `POST` | `/api/comunicados` | Publicar comunicado oficial | CU-08 |
| `GET` | `/api/comunicados` | Leer comunicados del muro | CU-09 |

#### `POST /api/comunicados` — Publicar Comunicado

**Request Body:**
```json
{
  "titulo": "Minga Comunitaria",
  "mensaje": "Se convoca a todos los miembros de la comunidad...",
  "autor": "Directiva Comunal"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `titulo` | `string` | ✅ | 1–200 chars | Título del comunicado |
| `mensaje` | `string` | ✅ | mín. 1 char | Contenido del comunicado |
| `autor` | `string` | ❌ | máx. 100 chars | Autor (default: "Directiva Comunal") |

**Response (201):**
```json
{
  "id": 1,
  "titulo": "Minga Comunitaria",
  "mensaje": "Se convoca a todos los miembros de la comunidad...",
  "autor": "Directiva Comunal",
  "fecha_publicacion": "2026-05-11T05:50:00.123456"
}
```

#### `GET /api/comunicados` — Leer Comunicados

**Response (200):** Array de comunicados ordenados por `fecha_publicacion DESC`.

---

## 📖 Documentación Swagger

FastAPI genera automáticamente documentación interactiva de la API:

| Tipo | URL | Descripción |
|---|---|---|
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interfaz interactiva para probar endpoints |
| **ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Documentación en formato legible |
| **OpenAPI JSON** | [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json) | Esquema OpenAPI 3.0 en JSON |

> **Swagger UI** permite probar cada endpoint directamente desde el navegador con el botón **"Try it out"**.

---

## 🧪 Pruebas con cURL

### Health Check
```bash
curl http://localhost:8000/
```

### Crear Alerta
```bash
curl -X POST http://localhost:8000/api/alertas \
  -H "Content-Type: application/json" \
  -d '{"lat": -0.22, "lng": -78.52, "usuario_nombre": "Test User"}'
```

### Obtener Alertas
```bash
curl http://localhost:8000/api/alertas
```

### Crear Comunicado
```bash
curl -X POST http://localhost:8000/api/comunicados \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Prueba", "mensaje": "Mensaje de prueba", "autor": "Admin"}'
```

### Obtener Comunicados
```bash
curl http://localhost:8000/api/comunicados
```

### PowerShell (Windows)
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:8000/" -Method GET

# Crear alerta
$body = '{"lat": -0.22, "lng": -78.52, "usuario_nombre": "Test User"}'
Invoke-RestMethod -Uri "http://localhost:8000/api/alertas" -Method POST -Body $body -ContentType "application/json"

# Obtener alertas
Invoke-RestMethod -Uri "http://localhost:8000/api/alertas" -Method GET
```

---

## 🔧 CORS

El backend acepta solicitudes de los siguientes orígenes:

| Origen | Descripción |
|---|---|
| `http://localhost:3000` | Frontend Web (Next.js) |
| `http://localhost:19006` | Expo Web |
| `http://localhost:8081` | Expo Dev |
| `*` | Todos (solo para desarrollo) |

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| **FastAPI** | 0.115.12 | Framework web async de alto rendimiento |
| **Uvicorn** | 0.34.2 | Servidor ASGI para FastAPI |
| **PostgreSQL** | 15 | Base de datos relacional |
| **PostGIS** | 3.3 | Extensión espacial para coordenadas GPS |
| **asyncpg** | 0.30.0 | Driver PostgreSQL async para Python |
| **databases** | 0.9.0 | Abstracción async sobre asyncpg |
| **Pydantic** | 2.11.3 | Validación de datos y serialización |
| **python-dotenv** | 1.1.0 | Carga de variables de entorno |
| **Docker** | — | Contenedorización de la base de datos |

---

## 📄 Licencia

Proyecto académico — **Universidad Técnica de Ambato** · Materia: Interculturalidad · Parcial I · 2026
