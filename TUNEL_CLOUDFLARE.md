# Publicar Chaski Alert en internet (Cloudflare Tunnel)

Permite que **la Directiva y los comuneros usen el sistema desde fuera de tu red**,
con HTTPS real, sin abrir puertos del router, sin IP fija y **sin tocar el DNS de
GoDaddy**. Tu PC es el servidor.

> **Tu laptop debe permanecer encendida** con los túneles corriendo. Si la apagas,
> el sistema deja de responder desde fuera.

---

## Uso

```powershell
.\iniciar_tuneles.ps1
```

El script hace, en este orden:

1. **Cierra** los túneles anteriores.
2. **Crea los 3 túneles** por separado y captura las URLs que devuelve Cloudflare:
   | Túnel | Puerto | Para qué |
   |---|---|---|
   | Panel web | 3000 | La Directiva entra desde su navegador |
   | API | 8000 | Datos de la app móvil y del panel |
   | Keycloak | 8080 | Pantalla de inicio de sesión |
3. **Escribe esas URLs en el `.env` de cada servicio**.
4. **Autoriza el panel** en Keycloak (`redirectUris` y `webOrigins`).

Al terminar deja el resumen en `tuneles_activos.txt`.

### Qué se escribe y dónde

| Archivo | Variables |
|---|---|
| `Frontend/cliente_movil/.env` | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_KEYCLOAK_URL` |
| `Frontend/cliente_web/.env.local` | `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, `KEYCLOAK_ISSUER` |

**El `Backend/.env` no cambia.** Consulta Keycloak en `localhost` para descargar las
claves públicas, y aun así acepta los tokens emitidos a través de la URL pública
(verificado: login por el túnel y petición autenticada al API, ambos correctos).

---

## Después de ejecutar el script

```powershell
# 1. Base de datos y Keycloak (si no están levantados)
docker-compose up -d

# 2. Backend
cd Backend; .\venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# 3. Panel web — DESPUÉS del script, porque lee .env.local al arrancar
cd Frontend\cliente_web; npm run dev

# 4. App móvil — hay que RECOMPILAR: las EXPO_PUBLIC_* se incrustan en el APK
Z:
cd Z:\Frontend\cliente_movil
npx expo run:android
```

> Si vuelves a ejecutar el script, **las URLs cambian**: hay que reiniciar el panel
> web y recompilar la app móvil.

---

## Dos ajustes que hicieron falta (y por qué)

### 1. Keycloak generaba enlaces en `http://`

Detrás de un proxy HTTPS no sabía que la conexión externa era segura, y el login por
OAuth fallaba. En `docker-compose.yml`:

```yaml
- KC_PROXY_HEADERS=xforwarded
- KC_HOSTNAME_STRICT=false
```

### 2. Next.js bloqueaba sus propios recursos

En desarrollo, Next.js rechaza servir `/_next/*` a un dominio distinto de localhost.
El panel cargaba el HTML pero **React no hidrataba**, así que el login se quedaba
colgado en *"Te estamos llevando al inicio de sesión..."* sin llegar nunca a Keycloak.
En `next.config.ts`:

```ts
allowedDevOrigins: ["*.trycloudflare.com"],
```

Se usa comodín porque el subdominio cambia en cada arranque del túnel.

---

## Por qué no hay un subdominio propio

Cloudflare Tunnel publica servicios mediante un CNAME hacia `<uuid>.cfargotunnel.com`,
y **ese dominio no resuelve públicamente**: solo funciona si la zona DNS está alojada
en Cloudflare. Como el dominio de GoDaddy ya tiene servicios en producción (`auth`,
`grafana`), migrar los nameservers suponía un riesgo innecesario.

Si algún día se quiere una URL fija:
1. Desactivar **DNSSEC** en GoDaddy primero (si no, el dominio deja de resolver entero).
2. Añadir el dominio a Cloudflare y **verificar que importó los 9 registros**.
3. Dejar `auth` y `grafana` en **"DNS only"** (nube gris) para que se comporten igual.
4. Recién entonces cambiar los nameservers.

---

## Verificación

Comprobado el 22-jul-2026, extremo a extremo por internet:

- Redirección automática al login de Keycloak con el tema propio y textos bilingües
- Inicio de sesión completo y regreso al panel autenticado
- Mapa y muro de comunicados leyendo datos del API por el túnel
- Registro de dispositivo push y consulta de perfil desde el móvil
- Seguridad intacta: petición sin token sigue devolviendo **403**
