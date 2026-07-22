# EMPEZAR AQUÍ — Chaski Alert

Guía de arranque paso a paso. **Si solo vas a leer un archivo, que sea este.**

---

## ¿Qué quieres hacer?

| Objetivo | Ve a |
|---|---|
| Probar en mi PC (teléfono por USB o en mi misma WiFi) | [MODO LOCAL](#modo-local) |
| Que funcione **fuera de mi WiFi**, con HTTPS | [MODO INTERNET](#modo-internet) |

En ambos casos necesitas **4 terminales de PowerShell abiertas a la vez**. Cada
servicio ocupa la suya y hay que dejarlas abiertas.

---

# MODO INTERNET

## Paso 1 — Crear los túneles

```powershell
cd C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO
.\iniciar_tuneles.ps1
```

**¿Qué hace el script?** Crea los 3 túneles y **escribe él mismo las URLs** en los
archivos de configuración. Al terminar imprime algo así:

```
  Panel web (Directiva) : https://xxxx-xxxx.trycloudflare.com
  API (backend)         : https://yyyy-yyyy.trycloudflare.com
  Keycloak (login)      : https://zzzz-zzzz.trycloudflare.com
```

### ⚠️ ¿Tengo que copiar esas URLs a algún lado?

# NO.

El script ya las escribió por ti en:

- `Frontend\cliente_movil\.env`
- `Frontend\cliente_web\.env.local`

**No abras esos archivos. No copies ni pegues nada.** Las URLs quedan guardadas
también en `tuneles_activos.txt` por si quieres consultarlas después.

### ¿Y si el script termina y vuelve al prompt?

**Es lo normal.** El script crea los túneles, escribe la configuración y sale. Los
túneles siguen corriendo aparte, en segundo plano, así que **puedes cerrar esa
ventana sin problema**.

Para comprobar que siguen vivos en cualquier momento:

```powershell
Get-Process cloudflared
```

Deben aparecer **3 procesos**. Lo único que los mata es apagar o suspender la
laptop, o ejecutar:

```powershell
Get-Process cloudflared | Stop-Process -Force
```

---

## Paso 2 — Base de datos y Keycloak · TERMINAL 1

```powershell
cd C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO
docker-compose up -d
docker ps
```

**Debes ver** dos contenedores: `chaski_db` y `chaski_keycloak`.
Si ya estaban corriendo, no pasa nada: el comando no los reinicia.

---

## Paso 3 — Backend · TERMINAL 2

```powershell
cd C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO\Backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Debes ver estas 3 líneas:**

```
[OK] Conectado a PostGIS: localhost:5433/chaski_alerta
[PUSH] Firebase Cloud Messaging inicializado correctamente.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Si NO aparece la línea `[PUSH]`, las notificaciones no funcionarán: falta el
archivo `Backend\firebase-service-account.json`.

> **Deja esta terminal abierta.** No escribas nada más en ella.

---

## Paso 4 — Panel web · TERMINAL 3

```powershell
cd C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO\Frontend\cliente_web
npm run dev
```

**Debes ver:** `✓ Ready in ...` y `Local: http://localhost:3000`

> Este paso va **después** del script de túneles, porque Next.js lee su
> configuración solo al arrancar. Si lo arrancaste antes, ciérralo con `Ctrl+C`
> y vuelve a lanzarlo.

### Comprobar que funciona

Abre en el navegador la URL del **Panel web** que imprimió el script
(la que empieza por `https://` y termina en `.trycloudflare.com`).

Debe llevarte solo a la pantalla de login con el logo de Chaski Alerta y el texto
**"Yaykuna / Iniciar Sesión"**. Entra con:

```
admin@chaski.ec
admin123
```

---

## Paso 5 — App móvil · TERMINAL 4

Conecta el teléfono por USB y acepta la depuración. Luego:

```powershell
Z:
cd Z:\Frontend\cliente_movil
npx expo run:android
```

**Tarda entre 10 y 20 minutos** la primera vez. No lo interrumpas aunque parezca
detenido en `> Task :app:compileDebugKotlin`.

### 🔴 Dos reglas que no puedes saltarte

1. **Compila SIEMPRE desde `Z:`**, nunca desde `C:`. Si mezclas los dos discos,
   Kotlin falla con *"different roots"*. (Solución en [Problemas](#problemas-frecuentes)).
2. **Hay que recompilar cada vez que cambien las URLs**, porque quedan grabadas
   dentro del APK.

### Al abrir la app

1. Sale la guía de bienvenida (solo la primera vez) → deslizar y **Empezar**
2. **Iniciar Sesión** → login de Keycloak → `vecino@chaski.ec` / `vecino123`
3. Android pide permiso de notificaciones → **Permitir**

Comprobar que el teléfono quedó registrado para notificaciones:

```powershell
docker exec chaski_db psql -U admin -d chaski_alerta -c "SELECT nombre_usuario, activo FROM dispositivos;"
```

Debe aparecer tu nombre con `activo = t`.

---

# MODO LOCAL

Igual que el modo internet **pero sin el Paso 1**, y con una diferencia: como no
hay script, las direcciones las pones tú a mano.

## Paso previo — Poner tu IP

Averigua tu IP:

```powershell
ipconfig
```

Busca **Adaptador de LAN inalámbrica Wi-Fi → Dirección IPv4**. Será algo como
`192.168.50.11`.

**Abre este archivo:** `Frontend\cliente_movil\.env`

Y deja estas dos líneas con TU IP (cambia solo el número):

```env
EXPO_PUBLIC_API_URL=http://192.168.50.11:8000
EXPO_PUBLIC_KEYCLOAK_URL=http://192.168.50.11:8080/realms/chaski-realm
```

**Abre este otro:** `Frontend\cliente_web\.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
KEYCLOAK_ISSUER=http://localhost:8080/realms/chaski-realm
```

Luego sigue los **Pasos 2, 3, 4 y 5** de arriba. El panel se abre en
<http://localhost:3000>.

---

# Detener todo

```powershell
# Túneles
Get-Process cloudflared | Stop-Process -Force

# Backend y panel web: Ctrl+C en cada terminal

# Docker (opcional, NO borra datos)
docker-compose stop
```

⚠️ **Nunca escribas `docker-compose down -v`.** La `-v` borra el volumen y con él
usuarios, comunicados y toda la configuración de Keycloak.

---

# Credenciales

| Para | Usuario | Clave |
|---|---|---|
| Panel web y app (Directiva) | `admin@chaski.ec` | `admin123` |
| App móvil (Comunero) | `vecino@chaski.ec` | `vecino123` |
| Consola de Keycloak (<http://localhost:8080>) | `alextesis90@gmail.com` | `admin` |

---

# Qué archivo toca cada cosa

| Archivo | Qué guarda | Quién lo edita |
|---|---|---|
| `Frontend\cliente_movil\.env` | URLs de API y Keycloak | El script (modo internet) o tú (modo local). **Exige recompilar** |
| `Frontend\cliente_web\.env.local` | URLs del panel | El script o tú. Exige reiniciar `npm run dev` |
| `Backend\.env` | Base de datos, Keycloak, Telegram | Casi nunca |
| `Backend\firebase-service-account.json` | Credencial de notificaciones | Ya está. **Nunca subir a git** |
| `Frontend\cliente_movil\google-services.json` | Firebase del APK | Ya está. **Nunca subir a git** |

---

# Documentación

Estos son los archivos vigentes; el resto son históricos.

| Archivo | Para qué |
|---|---|
| **`EMPEZAR_AQUI.md`** | Este. Arranque y comandos |
| `TUNEL_CLOUDFLARE.md` | Detalle de los túneles y por qué no hay subdominio propio |
| `Backend\NOTIFICACIONES_PUSH.md` | Cómo funcionan las notificaciones push |
| `Backend\keycloak\LEEME.md` | Idioma y tema visual del login |
| `PLAN_MEJORAS_POST_EVALUACION.md` | Los 10 problemas de la evaluación y su estado |

---

# Problemas frecuentes

### "Port 8081 is being used by another process"

Hay un Metro de Expo anterior vivo. Ciérralo y vuelve a compilar:

```powershell
Get-NetTCPConnection -LocalPort 8081 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Si te pregunta *"Use port 8082 instead?"* responde **n**: tu teléfono espera el 8081.

### Kotlin: "this and base files have different roots"

Mezclaste compilaciones de `C:` y `Z:`. Limpia las cachés y compila siempre desde `Z:`:

```powershell
cd Z:\Frontend\cliente_movil
.\android\gradlew --stop -p android

cd C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO\Frontend\cliente_movil
Get-ChildItem node_modules -Recurse -Depth 2 -Directory -Filter build |
  Where-Object { $_.FullName -like "*\android\build" } |
  Remove-Item -Recurse -Force
```

### El login se queda en "Te estamos llevando al inicio de sesión…"

Next.js está bloqueando sus recursos al dominio del túnel. Ya está resuelto en
`Frontend\cliente_web\next.config.ts` con `allowedDevOrigins`. Si vuelve a pasar,
reinicia el panel web (`Ctrl+C` y `npm run dev`).

### Las notificaciones no llegan con la app cerrada

1. Debe ser un build nativo — **en Expo Go nunca funcionan**.
2. Acepta el permiso de notificaciones al iniciar sesión.
3. En Samsung: *Ajustes → Aplicaciones → Chaski Alerta → Batería → Sin restricciones*.

### La app móvil no conecta al backend

La URL del `.env` debe ser alcanzable desde el teléfono. Con cable USB:

```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8000 tcp:8000
```
