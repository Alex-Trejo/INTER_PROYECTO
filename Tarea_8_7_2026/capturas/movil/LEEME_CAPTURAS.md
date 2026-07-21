# Capturas del cliente móvil — instrucciones

El informe referencia estas capturas del cliente móvil (Expo). Tómalas en tu teléfono
(o en el emulador de Android Studio) y guárdalas EN ESTA CARPETA con estos nombres exactos:

| Archivo | Pantalla | Cómo tomarla |
|---|---|---|
| 01_login.png | Login | Abrir la app sin sesión (pantalla "Iniciar Sesión" con Keycloak) |
| 02_sos.png | SOS | Pestaña SOS con el botón rojo y el estado del GPS visible |
| 03_sos_confirmacion.png | SOS enviado | Tocar SOS con internet: pantalla "Alerta Enviada" |
| 04_comunicados.png | Avisos | Pestaña Comunicados con el muro de avisos (Willaykuna) |
| 05_perfil.png | Perfil | Pestaña Perfil con los datos del comunero |
| 06_info.png | Info | Pestaña Info (estado del sistema) |
| 07_sms_offline.png | SMS offline | Activar modo avión y tocar SOS: se abre el SMS con las coordenadas |

Pasos: 1) conectar el teléfono por USB, 2) `iniciar_todo.bat`, 3) en el teléfono tomar
captura (Encendido + Vol-) en cada pantalla, 4) copiar aquí con `adb pull /sdcard/Pictures/Screenshots/...`
o por cable.

Cuando estén las 7 capturas, pide regenerar el documento Word y se insertarán
automáticamente en la sección de Evidencias (hoy aparecen como recuadros de posición).
