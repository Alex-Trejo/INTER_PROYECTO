# Notificaciones push (FCM) — Chaski Alert

Resuelve el problema **P05** de la evaluación de usabilidad: *"Con la aplicación cerrada
no llegan notificaciones de avisos"* (severidad 3.2, la más alta junto con P04).

---

## Cómo funciona

```
App móvil  ──token FCM──►  POST /api/dispositivos/token  ──►  tabla dispositivos
                                                                     │
Directiva publica comunicado  ──►  Backend  ──firebase-admin──►  FCM  ──►  Teléfono
Comunero pulsa SOS            ──►  Backend  ──firebase-admin──►  FCM  ──►  Teléfonos
```

El envío va en **segundo plano** (`BackgroundTasks`): la Directiva no espera a que
FCM responda para ver su comunicado publicado.

---

## Piezas

| Archivo | Función |
|---|---|
| `Backend/core/push.py` | Inicializa Firebase y envía las notificaciones |
| `Backend/routers/dispositivos.py` | `POST`/`DELETE /api/dispositivos/token` |
| `Backend/migraciones/001_dispositivos_push.sql` | Tabla `dispositivos` |
| `Frontend/cliente_movil/src/services/push.ts` | Permiso, token FCM y registro |
| `Frontend/cliente_movil/App.tsx` | Canal Android + registro al iniciar sesión |

### Credenciales (nunca en git)

| Archivo | Dónde se obtiene |
|---|---|
| `Backend/firebase-service-account.json` | Firebase → ⚙️ → Cuentas de servicio → Generar clave privada |
| `Frontend/cliente_movil/google-services.json` | Firebase → ⚙️ → General → app Android |

Ambos están en `.gitignore`. Si falta el primero, **el sistema sigue funcionando**:
`push.py` lo detecta, avisa por consola y omite los envíos.

---

## Requisitos para que llegue con la app CERRADA

1. **Build nativo.** En Expo Go **nunca** funcionará. Basta el build de desarrollo:
   ```bash
   cd Frontend/cliente_movil
   npx expo run:android          # o .\build-android.bat si falla por rutas largas
   ```
   Hay que **recompilar** tras esta fase, porque `google-services.json` y el permiso
   `POST_NOTIFICATIONS` se incrustan en el APK.

2. **Permiso de notificaciones.** Android 13+ lo exige en tiempo de ejecución; la app
   lo pide al iniciar sesión.

3. **Canal `emergencias`.** Se crea con importancia `MAX` y `bypassDnd`. Sin él, Android
   silencia el aviso en reposo (Doze). El `channel_id` debe coincidir entre
   `core/push.py` y `services/push.ts`.

4. **Samsung:** su gestor de batería es agresivo. Si no llegan estando cerrada, ve a
   *Ajustes → Aplicaciones → Chaski Alerta → Batería → Sin restricciones*.

---

## Detalles de diseño

- **El emisor no se notifica a sí mismo:** al emitir un SOS se excluye su `keycloak_id`,
  porque ya ve la confirmación en pantalla.
- **Tokens muertos se dan de baja solos:** si FCM responde `Unregistered`,
  `SenderIdMismatch` o que el token es inválido, se marca `activo = FALSE` y no se
  reintenta más.
- **Registro idempotente:** el endpoint usa `ON CONFLICT (token) DO UPDATE`, así que
  reenviar el mismo token solo refresca la fecha; si el teléfono cambia de dueño, el
  token se reasigna.
- **Logs a prueba de consola Windows:** los títulos llevan emoji (🚨 / 📢) y `cmd` usa
  cp1252, lo que provocaba `UnicodeEncodeError`. Todos los mensajes pasan por `_log()`,
  que sustituye los caracteres no representables en vez de romper el envío.

---

## Comprobar que funciona

```bash
# 1. ¿Se inicializó Firebase?
#    Al arrancar el backend debe verse:
#    [PUSH] Firebase Cloud Messaging inicializado correctamente.

# 2. ¿Hay dispositivos registrados?
docker exec chaski_db psql -U admin -d chaski_alerta \
  -c "SELECT id, nombre_usuario, plataforma, activo FROM dispositivos;"

# 3. Publicar un comunicado desde el panel y mirar la consola del backend:
#    [PUSH] '... ' -> N entregados, 0 fallidos.
```

**Prueba de aceptación:** cerrar del todo la app en el teléfono, apagar la pantalla,
publicar un comunicado desde el panel web y comprobar que llega la notificación.
