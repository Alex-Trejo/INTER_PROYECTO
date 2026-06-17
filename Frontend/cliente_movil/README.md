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

## 🔄 Configuración de Red (Cambio de IP)

Si tu servidor de Backend y Keycloak cambian de dirección IP (ej. te conectas a otra red WiFi), **DEBES actualizar los siguientes lugares ANTES de compilar la app**:

1. Abre el archivo `.env` ubicado en `Frontend/cliente_movil/.env`
2. Modifica la IP en las variables `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_KEYCLOAK_URL`:
   ```env
   EXPO_PUBLIC_API_URL=http://NUEVA_IP:8000
   EXPO_PUBLIC_KEYCLOAK_URL=http://NUEVA_IP:8080
   ```
3. Guarda el archivo `.env`.
4. Vuelve a ejecutar la compilación para inyectar la nueva IP al código:
   ```cmd
   .\build-android-release.bat
   ```

*Nota: Con cable USB (ADB Reverse) no necesitas cambiar nada si usaste `localhost`.*

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

---

## 📡 Arquitectura de Notificaciones (Online & Offline)

### 1. Contingencia SMS Offline
Cuando el comunero **no tiene internet** (ni WiFi ni Datos), al presionar el Botón SOS, la aplicación redirige inmediatamente la alerta a la red GSM (SMS).
- Se redacta un SMS automático.
- Se adjuntan las coordenadas GPS y Google Maps.
- Se envía directo al número de la Directiva configurado en las variables de entorno.

### 2. Notificaciones de Avisos Globales (App Abierta)
Implementado con Context Providers y `expo-notifications`.
- Si la app está abierta en **cualquier pantalla** (SOS, Perfil, etc.), el sistema consulta el Backend cada 10s.
- Si hay un nuevo aviso, la aplicación vibra, muestra una notificación Push Nativa (Prioridad MAX) y despliega un Banner Premium Flotante In-App.

### 3. 🚀 Próxima Implementación: Firebase Cloud Messaging (FCM)
Actualmente, por restricciones de batería de Android (Doze Mode), la aplicación suspende sus temporizadores en segundo plano. Para garantizar que los avisos suenen incluso cuando la app está **Cerrada** o el celular bloqueado, se implementará en la V2:
- Integración de `@react-native-firebase/messaging`.
- El Backend FastAPI disparará las alertas directamente hacia los servidores de Google FCM usando Firebase Admin SDK.
- Google FCM "despertará" el celular a nivel de hardware, asegurando que el sonido y el Push nativo lleguen al instante, con máxima fiabilidad para emergencias comunitarias.
