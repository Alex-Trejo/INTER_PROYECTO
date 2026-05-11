# 🏔️ Chaski Alert — Sistema de Alerta Comunitaria Intercultural

**Proyecto MVP** — Universidad Técnica de Ambato · Interculturalidad · Parcial I · 2026

Sistema de alerta comunitaria con identidad Kichwa para comunidades rurales del Ecuador.

---

## 📋 Prerequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Verificar con | Instalación |
|---|---|---|---|
| **Node.js** | v18+ | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | v9+ | `npm --version` | Incluido con Node.js |
| **Python** | v3.10+ | `python --version` | [python.org](https://python.org) |
| **Docker Desktop** | v4+ | `docker --version` | [docker.com](https://docker.com) |
| **Git** | cualquiera | `git --version` | [git-scm.com](https://git-scm.com) |

### Para el Cliente Móvil (adicional):

| Herramienta | Verificar con | Instalación |
|---|---|---|
| **Android SDK Platform Tools** (ADB) | `adb devices` | Incluido con Android Studio |
| **Expo Go** (en el teléfono) | App Store / Play Store | Buscar "Expo Go" |
| **Cable USB** | — | Para conectar el celular a la PC |
| **Depuración USB activada** | Ajustes > Opciones de desarrollador | Ver sección "Configuración del Teléfono" |

### Configuración del Teléfono (una sola vez):

1. Ve a **Ajustes → Acerca del teléfono**
2. Toca **"Número de compilación"** 7 veces hasta que diga "Eres un desarrollador"
3. Regresa a **Ajustes → Opciones de desarrollador**
4. Activa **"Depuración por USB"**
5. Conecta el celular con cable USB a la PC
6. En el celular, acepta el diálogo **"¿Permitir depuración por USB?"** y marca **"Permitir siempre desde este equipo"**

---

## 🏗️ Arquitectura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  📱 Expo Go  │     │  🌐 Next.js  │     │  🐍 FastAPI  │
│  (Celular)   │────▶│  (Web :3000) │────▶│  (API :8000) │
│  via USB/ADB │     │              │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────▼───────┐
                                          │  🐳 PostGIS   │
                                          │  (DB :5433)   │
                                          └───────────────┘
```

---

## 🚀 Inicio Rápido

### Opción A: Script Automático (recomendado)

```bash
# Desde la carpeta INTER_PROYECTO/
iniciar_todo.bat        # Levanta los 4 servicios + configura ADB
detener_todo.bat        # Detiene todo limpiamente
```

El script verifica prerequisitos, levanta Docker, Backend, Frontend Web, configura ADB reverse y lanza Expo.

### Opción B: Manual (4 terminales)

#### Terminal 1 — Base de Datos
```bash
cd INTER_PROYECTO
docker-compose up -d
```

#### Terminal 2 — Backend API
```bash
cd INTER_PROYECTO/Backend
.\venv\Scripts\Activate.ps1          # Windows PowerShell
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 3 — Frontend Web
```bash
cd INTER_PROYECTO/Frontend/cliente_web
npm run dev
```

#### Terminal 4 — Cliente Móvil
```bash
cd INTER_PROYECTO/Frontend/cliente_movil
npx expo start --clear
```

---

## 📱 Conexión del Cliente Móvil

### Método 1: USB con ADB Reverse (RECOMENDADO ✅)

Este método es el más confiable. Funciona **en cualquier red** y **no requiere configurar el firewall**.

1. **Conecta** el celular por cable USB a la PC
2. **Acepta** la depuración USB en el celular (si aparece el diálogo)
3. **Ejecuta** los siguientes comandos (una vez):
   ```powershell
   # Configura los puertos (el celular accede a localhost como si fuera la PC)
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:8000 tcp:8000
   ```
   > **Nota:** Si `adb` no es reconocido, usa la ruta completa:
   > `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`

4. **Lanza la app** de una de estas formas:
   - En la terminal de Expo, presiona **`a`** para abrir en Android
   - O ejecuta: `adb shell am start -a android.intent.action.VIEW -d "exp://localhost:8081" host.exp.exponent`

5. **Verifica** que el celular está detectado:
   ```powershell
   adb devices
   # Debe mostrar: R58R42SNH8V    device
   # Si dice "unauthorized", acepta el diálogo en el celular
   ```

### Método 2: WiFi (misma red, sin cable)

> ⚠️ **Requiere que el Firewall de Windows permita conexiones entrantes en los puertos 8081 y 8000.**

1. **PC y celular en el mismo WiFi**
2. **Obtén la IP de tu PC:**
   ```powershell
   ipconfig | Select-String "IPv4"
   # Ejemplo: 192.168.50.10
   ```
3. **Edita** `Frontend/cliente_movil/config.ts`:
   ```typescript
   export const API_URL = "http://TU_IP_AQUI:8000";
   ```
4. **Abre el Firewall** (PowerShell como Administrador):
   ```powershell
   netsh advfirewall firewall add rule name="Expo" dir=in action=allow protocol=TCP localport=8081
   netsh advfirewall firewall add rule name="Backend" dir=in action=allow protocol=TCP localport=8000
   ```
5. **Escanea** el QR de Expo Go o ingresa manualmente: `exp://TU_IP:8081`

---

## 🔄 ¿Qué pasa cuando cambio de red WiFi?

| Situación | ¿Debo cambiar algo? | ¿Qué cambiar? |
|---|---|---|
| **Usando USB + ADB reverse** | ❌ NO | Nada. `localhost` siempre funciona por USB |
| **Usando WiFi (sin cable)** | ✅ SÍ | Actualizar la IP en `Frontend/cliente_movil/config.ts` |
| **Cambié de WiFi a datos móviles** | Depende | Si usas USB → no cambies nada. Si usas WiFi → no funcionará con datos móviles |
| **PC en datos del celular (hotspot)** | ✅ SÍ | Usar la nueva IP del hotspot en `config.ts` |

### Resumen rápido:
- **USB conectado → no te preocupes por la red**, siempre funciona con `localhost`
- **Sin USB → PC y celular deben estar en la MISMA red WiFi**, y debes actualizar la IP en `config.ts`

---

## 🔧 Troubleshooting

### Error: "Failed to download remote update" (Expo Go)
**Causa:** El celular no puede alcanzar el servidor Expo de la PC.
**Solución:**
1. Usa el **método USB + ADB reverse** (ver arriba)
2. Verifica que Expo esté corriendo: `http://localhost:8081` en el navegador de la PC
3. Si usas WiFi, verifica que el firewall está abierto

### Error: "Port 8081 is being used"
```powershell
# Encuentra y mata el proceso en el puerto 8081
$proc = Get-NetTCPConnection -LocalPort 8081 | Select-Object -First 1 -ExpandProperty OwningProcess
Stop-Process -Id $proc -Force
```

### Error: "adb: device unauthorized"
1. Desconecta y reconecta el cable USB
2. En el celular, acepta el diálogo de depuración USB
3. Si no aparece el diálogo:
   ```powershell
   adb kill-server
   adb devices    # Debería forzar el diálogo
   ```

### Error: Puerto 5432 ocupado (PostgreSQL local)
El proyecto usa el puerto **5433** para evitar conflictos. Ya está configurado así.

### La app móvil no se conecta al backend
1. Verifica que el backend esté corriendo: `http://localhost:8000/docs`
2. Con USB: verifica `adb reverse --list` (debe mostrar puertos 8081 y 8000)
3. Con WiFi: verifica la IP en `config.ts` y que el firewall esté abierto

---

## 📁 Estructura del Proyecto

```
INTER_PROYECTO/
├── 📄 README.md                    ← Este archivo
├── 📄 docker-compose.yml           ← PostGIS en puerto 5433
├── 🔧 iniciar_todo.bat             ← Levantar todos los servicios
├── 🔧 detener_todo.bat             ← Detener todos los servicios
│
├── Backend/
│   ├── 📄 README.md                ← Documentación del backend
│   ├── 🐍 main.py                  ← FastAPI (4 endpoints REST)
│   ├── 📄 requirements.txt         ← Dependencias Python
│   ├── 📄 init.sql                 ← Esquema DB + datos ejemplo
│   ├── 📄 .env                     ← Variables de entorno
│   └── 📁 venv/                    ← Entorno virtual Python
│
└── Frontend/
    ├── cliente_web/                 ← Next.js 16 + TypeScript
    │   ├── 📄 README.md
    │   ├── src/app/                 ← Páginas (mapa, avisos)
    │   ├── src/components/          ← MapView, ComunicadoCard
    │   └── 📄 .env.local            ← API URL
    │
    └── cliente_movil/               ← Expo + React Native
        ├── 📄 README.md
        ├── 📱 App.tsx               ← Tab navigation
        ├── 📄 config.ts             ← API URL + colores
        └── screens/                 ← SOS, Comunicados, Info
```

---

## 🌐 URLs de los Servicios

| Servicio | URL | Descripción |
|---|---|---|
| **Frontend Web** | http://localhost:3000 | Panel de monitoreo |
| **Backend API** | http://localhost:8000 | API REST |
| **Swagger Docs** | http://localhost:8000/docs | Documentación interactiva |
| **ReDoc** | http://localhost:8000/redoc | Documentación alternativa |
| **OpenAPI JSON** | http://localhost:8000/openapi.json | Esquema de la API |
| **PostGIS DB** | localhost:5433 | Base de datos (user: admin, pass: password123) |
| **Expo Mobile** | http://localhost:8081 | Servidor Metro Bundler |

---

## 👥 Equipo

- **Alex Trejo** — Desarrollo del Prototipo Core (MVP)
- Universidad Técnica de Ambato · Semestre IX · Interculturalidad · Parcial I · 2026