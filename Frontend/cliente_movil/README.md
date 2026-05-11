# 📱 Chaski Alert — Cliente Móvil

**App de Alerta Comunitaria para Android/iOS** con Expo + React Native

---

## 📋 Prerequisitos

| Herramienta | Dónde | Instalación |
|---|---|---|
| **Node.js** v18+ | PC | [nodejs.org](https://nodejs.org) |
| **Expo Go** | Celular | Play Store / App Store → buscar "Expo Go" |
| **Cable USB** | — | Para conectar celular a PC |
| **Depuración USB** | Celular | Ajustes → Opciones de desarrollador → Depuración USB |
| **ADB** | PC | Incluido con Android Studio (`%LOCALAPPDATA%\Android\Sdk\platform-tools\`) |

### Activar Depuración USB (una sola vez):
1. **Ajustes → Acerca del teléfono** → toca "Número de compilación" 7 veces
2. **Ajustes → Opciones de desarrollador** → activa "Depuración por USB"
3. Conecta USB → acepta el diálogo en el celular

---

## 🚀 Inicialización del Proyecto

```bash
cd Frontend/cliente_movil
npm install
```

---

## ▶️ Ejecutar la App

### Paso 1: Asegúrate de que Docker + Backend estén corriendo
```bash
# Desde INTER_PROYECTO/
docker-compose up -d                    # DB en :5433
cd Backend && .\venv\Scripts\Activate.ps1 && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Paso 2: Configura ADB reverse (con celular conectado por USB)
```powershell
adb reverse tcp:8081 tcp:8081    # Metro Bundler
adb reverse tcp:8000 tcp:8000    # Backend API
```

### Paso 3: Inicia Expo
```bash
cd Frontend/cliente_movil
npx expo start --clear
```

### Paso 4: Abre en tu celular
En la terminal de Expo, presiona **`a`** para abrir en Android.

O ejecuta:
```powershell
adb shell am start -a android.intent.action.VIEW -d "exp://localhost:8081" host.exp.exponent
```

---

## 🔄 Configuración de Red

### Con USB (ADB Reverse) — RECOMENDADO
- `config.ts` usa `localhost` → **NO necesitas cambiar nada al cambiar de red**
- El tráfico va por el cable USB, no por WiFi

### Sin USB (WiFi directo)
- Edita `config.ts` y cambia `API_URL` por la IP de tu PC:
  ```typescript
  export const API_URL = "http://TU_IP:8000";
  ```
- PC y celular deben estar en la **misma red WiFi**
- Necesitas abrir el firewall de Windows (ver README principal)

---

## 📱 Pantallas

| Pantalla | Descripción |
|---|---|
| **🆘 SOS** | Botón de emergencia con GPS. Envía alerta con coordenadas al backend |
| **📋 Comunicados** | Feed de avisos oficiales con pull-to-refresh |
| **ℹ️ Info** | Estado del sistema, verificación de red, links a Swagger docs |

---

## 📁 Estructura

```
cliente_movil/
├── App.tsx                  # Tab navigation (SOS | Comunicados | Info)
├── config.ts                # API_URL + sistema de colores
├── app.json                 # Config Expo (permisos GPS, splash)
├── screens/
│   ├── SOSScreen.tsx        # Botón SOS con GPS + animaciones
│   ├── ComunicadosScreen.tsx # Feed de gradient cards
│   └── InfoScreen.tsx       # Estado del sistema
└── assets/
    └── logo.png             # Logo Chaski Alerta
```

---

## ⚠️ Limitaciones

1. **Red:** Con USB no hay limitaciones. Sin USB, PC y celular deben estar en el mismo WiFi
2. **GPS:** Requiere permiso de ubicación (se solicita al usar SOS)
3. **Expo Go:** La versión de Expo Go debe ser compatible con SDK 54+
