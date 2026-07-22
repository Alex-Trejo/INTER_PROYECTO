# 🏔️ Documentación Maestra — Chaski Alerta

**Última Actualización:** 21 de Julio de 2026
**Proyecto:** Sistema de Alerta Comunitaria Intercultural Andina (Interculturalidad)

Este documento contiene el análisis completo, flujos de arquitectura, credenciales y las instrucciones paso a paso para desplegar todo el ecosistema (Backend, Web, Móvil, Base de Datos y Autenticación).

---

## 🏛️ 1. Flujo Completo y Arquitectura

El ecosistema opera bajo una arquitectura orientada a microservicios y clientes independientes, dividida en 4 pilares:

### A. Base de Datos (Docker)
- **Tecnología:** PostgreSQL + PostGIS (Imprescindible para guardar coordenadas de emergencias).
- **Rol:** Persistencia de alertas, comunicados y datos locales del usuario (cédula, sector).

### B. Gestor de Identidad - Keycloak (Docker)
- **Tecnología:** Keycloak v24.
- **Rol:** Es el árbitro absoluto de autenticación. Maneja los inicios de sesión, tokens JWT, y Roles de Usuario (RBAC).

### C. Backend (FastAPI)
- **Tecnología:** Python 3 + FastAPI.
- **Flujo:** Expone una API REST en el puerto `8000`. Recibe peticiones de la Web y del Móvil, valida que el token JWT venga firmado por Keycloak, y ejecuta operaciones Geoespaciales o guarda datos en PostGIS.

### D. Clientes (Frontend)
- **Cliente Web (Next.js 15):** Panel administrativo para la "Directiva". Usado para publicar comunicados, ver el mapa completo de incidentes (Leaflet) y aceptar miembros.
- **Cliente Móvil (React Native / Expo):** App para los "Comuneros". Contiene el botón SOS (que extrae el GPS del teléfono), lector de comunicados y funciona de contingencia enviando SMS si falla la red.

---

## 🔑 2. Credenciales de Acceso y Clientes

### Base de Datos PostgreSQL
- **Host:** `localhost` (o `db` dentro de docker)
- **Puerto:** `5433` (Mapeado desde el 5432 interno)
- **Usuario:** `admin`
- **Contraseña:** `password123`
- **Database:** `chaski_alerta`

### Keycloak (Administrador Global)
- **URL:** `http://localhost:8080` (o la IP de tu PC)
- **Admin User:** `alextesis90@gmail.com`
- **Admin Pass:** `admin`
- **Realm de Trabajo:** `chaski-realm`

### Usuarios Pre-Registrados (Para probar la App y la Web)
Estos son los usuarios incluidos en el realm por defecto para hacer pruebas de inicio de sesión:
- **Usuario Directiva (Admin):** `admin@chaski.ec` (Contraseña por defecto de pruebas: `admin123` o similar).
- **Usuario Comunero (Vecino):** `vecino@chaski.ec` (Contraseña por defecto de pruebas: `vecino123` o similar).

### Clientes Configurados en Keycloak
1. **`web-app` (Cliente Confidencial):** Usado por Next.js usando Auth.js. Requiere un *Client Secret* para generar la sesión del navegador.
2. **`mobile-app` (Cliente Público):** Usado por React Native (Expo Auth Session PKCE). No requiere secreto, verifica los logins redirigiendo al navegador del celular y devolviendo el token.

### Roles del Sistema (RBAC)
- **`Directiva`:** Tienen acceso total a la Web y al Móvil. Pueden crear avisos y ver el historial de alertas geográficas.
- **`Comunero`:** Acceso exclusivo a la app Móvil. Solo pueden enviar alertas SOS y leer comunicados.

---

## 🚀 3. Guía de Inicio Local (Paso a Paso)

Para arrancar el ecosistema completo desde cero, debes abrir **4 terminales separadas** y seguir este orden estricto:

### Paso 1: Levantar Infraestructura (Docker)
Asegúrate de tener Docker Desktop abierto. Esto levantará PostgreSQL y Keycloak.
```bash
# Terminal 1 (Raíz del proyecto)
docker-compose up -d
```
*Espera unos segundos a que Keycloak termine de arrancar en el puerto 8080.*

### Paso 2: Arrancar el Backend (FastAPI)
```powershell
# Terminal 2
cd Backend
# Activar entorno virtual
.\venv\Scripts\Activate.ps1
# Arrancar servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*API disponible en: `http://localhost:8000/docs`*

### Paso 3: Arrancar Cliente Web (Next.js)
```bash
# Terminal 3
cd Frontend\cliente_web
npm install   # (Solo si hay dependencias nuevas)
npm run dev
```
*Dashboard Web disponible en: `http://localhost:3000`*

### Paso 4: Arrancar Cliente Móvil (Expo)
Tienes **dos opciones** dependiendo de cómo conectes tu celular:

#### Opción A: Mediante Cable USB (Recomendada y más rápida)
1. Conecta tu celular con depuración USB.
2. Ejecuta los puentes de red (ADB Reverse) en cualquier terminal:
   ```powershell
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:8000 tcp:8000
   adb reverse tcp:8080 tcp:8080
   ```
3. Arranca Expo:
   ```bash
   # Terminal 4
   cd Frontend\cliente_movil
   npx expo start --clear
   ```
4. Presiona la tecla **`a`** en la consola para forzar abrir la app en tu celular.

#### Opción B: Mediante Red Wi-Fi (Sin cable USB)
Si prefieres probar inalámbricamente, el celular debe apuntar a la IP de tu computadora (ej. `192.168.1.15`).
1. Ejecuta `ipconfig` en Windows para conocer tu IP IPv4.
2. Abre `Frontend\cliente_movil\.env` y modifica:
   ```env
   EXPO_PUBLIC_API_URL=http://TUU_IP_WIFI:8000
   EXPO_PUBLIC_KEYCLOAK_URL=http://TUU_IP_WIFI:8080
   ```
3. En la Terminal 4, arranca limpiando caché:
   ```bash
   cd Frontend\cliente_movil
   npx expo start --clear
   ```
4. Escanea el código QR con la app **Expo Go** de tu celular.

#### Opción C: Compilación Nativa Manual e Instalación USB (Custom Client)
Si tienes bibliotecas nativas o no deseas usar Expo Go, puedes compilar el APK directamente en tu computadora y mandarlo a tu teléfono usando el Android SDK. 
*Nota: Debes tener Android Studio instalado y tu teléfono conectado vía USB.*

1. Abre una **nueva terminal** (CMD o PowerShell) y corre este comando para evitar errores de rutas largas (MAX_PATH) montando una unidad `Z:`
   ```powershell
   subst Z: "C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO"
   ```
2. Entra a la unidad virtual y a la carpeta móvil:
   ```powershell
   Z:
   cd Frontend\cliente_movil
   ```
3. (Opcional) Si hiciste cambios recientes o recién montaste `Z:`, reinstala dependencias:
   ```powershell
   npm install --force
   ```
4. Finalmente, manda a compilar e instalar el APK automáticamente en tu celular:
   ```powershell
   npx expo run:android
   ```
5. Cuando termine, puedes desmontar la unidad virtual ejecutando `subst Z: /D` en cualquier otra terminal.

---
*Fin de la Documentación.*
