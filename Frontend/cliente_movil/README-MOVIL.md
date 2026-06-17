# 📱 Chaski Alerta - Cliente Móvil (Expo)

Esta guía contiene los comandos fundamentales para levantar la aplicación móvil en modo de desarrollo y realizar pruebas en tu dispositivo físico Android.

## 🚀 1. Arrancar el Servidor (Normal)
Úsalo cuando vayas a programar en el día a día y **NO** hayas modificado variables de entorno o instalado dependencias nuevas.

```bash
npx expo start
```
*Una vez ejecutado, abre la app "Expo Go" en tu celular Android y escanea el código QR que aparece en la terminal.*

## 🧹 2. Arrancar Limpiando Caché (OBLIGATORIO tras cambios)
Úsalo **siempre** que modifiques el archivo `.env` o cuando instales nuevas librerías (`npm install ...`). Esto fuerza a Expo (Metro Bundler) a borrar la basura temporal y recargar la configuración real.

```bash
npx expo start --clear
```

## 🤖 3. Abrir directamente en Emulador Android (o USB)
Si en lugar de escanear el QR prefieres que la terminal mande la orden directa a tu celular conectado por cable USB (con depuración USB activa) o a un emulador de Android Studio:

```bash
npx expo start --android
```
*(También puedes arrancar con `npx expo start` y presionar la tecla `a` en tu teclado).*

---

### ⚠️ Notas de Resolución de Problemas

1. **`Invalid project root` o `expo no se reconoce`:** 
   Ocurre si intentas ejecutar comandos inventados como `npx expo start:android` (que no existe en tu `package.json`) o si omites `npx` (ej. ejecutar solo `expo run:android` en Windows suele fallar si no tienes instalado expo-cli globalmente). 
   **Solución:** Siempre antepón `npx` y usa los comandos listados arriba.

2. **Error 401 Unauthorized:**
   Si el Backend rechaza peticiones, asegúrate de haber **iniciado sesión** en la app móvil. (¡Ya quedó corregido en el código para que inyecte el token real del usuario en el botón SOS!).
