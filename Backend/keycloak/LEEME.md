# Configuración de Keycloak — Chaski Alert

## Idioma del inicio de sesión (Fase 2 · problemas P01 y P10)

La pantalla donde el comunero escribe sus credenciales la sirve **Keycloak**, no la app.
Por eso salía en inglés aunque el resto del sistema fuera bilingüe.

### Qué se configuró

| Ajuste | Dónde vive | Se pierde si… |
|---|---|---|
| `internationalizationEnabled: true`, `defaultLocale: es` | Base de datos **y** `chaski-realm.json` | No se pierde: el JSON ya lo trae |
| Textos bilingües Español/Kichwa del login | Solo base de datos (*Realm overrides*) | Se pierden al borrar el volumen de Postgres |

### Cómo restaurarlo tras una importación limpia del realm

Con Keycloak levantado (`docker-compose up -d`):

```bash
python Backend/keycloak/configurar_idioma.py         # activa español por defecto
python Backend/keycloak/configurar_textos_kichwa.py  # aplica los textos Kichwa
```

No hace falta reiniciar el contenedor: los cambios se aplican en caliente.

### Textos aplicados

| Clave de Keycloak | Texto mostrado |
|---|---|
| `loginAccountTitle` | Yaykuna / Iniciar Sesión |
| `email` | Correo electrónico |
| `password` | Contraseña / Yaykuna Rimay |
| `doLogIn` | Ingresar / Yaykuy |
| `rememberMe` | Recordarme en este teléfono |
| `doForgotPassword` | Olvidé mi contraseña |
| `noAccount` | ¿Eres nuevo en la comunidad? |
| `doRegister` | Regístrate / Killkay |
| `invalidUserMessage` | Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo. |
| `missingPasswordMessage` | Escribe tu contraseña. |
| `missingUsernameMessage` | Escribe tu correo electrónico. |
| `accountDisabledMessage` | Tu cuenta está desactivada. Comunícate con la directiva de la comunidad. |

> Los textos van con **tildes y ñ**. El script los envía en UTF-8, así que se guardan
> correctamente; edítalos siempre desde `configurar_textos_kichwa.py` para no perder el acento.

Para editarlos también puedes ir a la consola de administración:
**Realm settings → Localization → Realm overrides**.

## Tema visual del login (`themes/chaski`)

El login usa un tema propio que replica el sistema de diseño del panel web
(`Frontend/cliente_web/src/app/globals.css`): fuente **Plus Jakarta Sans**, fondo `#F0F4F8`,
tarjeta blanca con franja degradada teal, campos y botón idénticos a `.input-field` y
`.btn-primary`.

```
themes/chaski/login/
├── theme.properties              # parent=keycloak · styles=css/login.css css/chaski.css
└── resources/css/chaski.css      # nuestras personalizaciones
```

> **Detalle importante:** `styles` debe incluir **también** `css/login.css` (el del tema padre).
> Si solo se declara el CSS propio, se pierde el comportamiento base de Keycloak y el
> desplegable de idioma aparece siempre abierto tapando el formulario.

### Cómo aplicar cambios de CSS

El tema se monta como volumen en `docker-compose.yml`, así que basta con editar
`chaski.css` y recrear el contenedor:

```bash
docker-compose up -d keycloak
```

Para probar un cambio **sin recrear el contenedor** (útil mientras se itera):

```bash
docker exec -u root chaski_keycloak rm -rf /opt/keycloak/themes/chaski
docker cp Backend/keycloak/themes/chaski chaski_keycloak:/opt/keycloak/themes/
docker exec -u root chaski_keycloak chown -R keycloak:root /opt/keycloak/themes/chaski
```

Con `start-dev` la caché de temas está desactivada: basta recargar el navegador.

El tema se activa con `loginTheme: "chaski"` en el realm (ya aplicado y guardado en la BD).

### ¿Se pierden datos al recrear el contenedor de Keycloak?

**No.** Keycloak está configurado con `KC_DB=postgres`: usuarios, clientes, realms y
traducciones viven en PostgreSQL, dentro del volumen `postgis_data`. El contenedor de
Keycloak no guarda estado. Lo único que borraría los datos es `docker-compose down -v`
o eliminar ese volumen.

### Nota sobre la página intermedia (P10)

La pantalla genérica *"Sign in with Keycloak"* se eliminó desde el lado de Next.js:
`src/app/login/page.tsx` es ahora la pantalla de acceso propia y está declarada en
`pages.signIn` dentro de `src/app/api/auth/[...nextauth]/route.ts`.
