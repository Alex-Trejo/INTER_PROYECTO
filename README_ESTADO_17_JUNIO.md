# Estado Actual del Proyecto Chaski Alerta
**Fecha de Reporte:** 17 de Junio de 2026

En base a la Especificación Detallada de Casos de Uso (CU), el siguiente es el informe de cumplimiento técnico y arquitectónico de la plataforma Chaski Alerta (Móvil y Web) hasta la fecha.

---

## 🟢 CU-1: Solicitar adhesión a la red comunitaria
**Estado:** `Completado (100%)`
- **Justificación:** El sistema de gestión de identidades (Keycloak) permite registrar usuarios (Sign-Up) y captura sus datos correctamente. El sistema registra las solicitudes y la funcionalidad administrativa para visualizar a estos nuevos vecinos se integró exitosamente dentro del Panel Web (Sección de Membresía).

## 🟢 CU-2: Autenticarse en el sistema (Iniciar Sesión)
**Estado:** `Parcialmente Completado`
- **Lo que está hecho:** La arquitectura base con **Keycloak Auth** opera con éxito. La App Móvil y el Panel Web (NextAuth.js v5) exigen autenticación por JWT, y el login supera restricciones de red nativas de Android.
- **Faltante para el 100% (Seguridad Frontend):** Falta pulir la seguridad estricta a nivel de rutas en el Frontend (Role-Based Access Control - RBAC). Es necesario garantizar que las vistas administrativas en Next.js se bloqueen y validen exhaustivamente según los roles del token JWT, evitando accesos indebidos incluso a nivel de interfaz de usuario.

## 🟢 CU-3: Restablecer credenciales de acceso
**Estado:** `Completado`
- **Justificación:** Al delegar la autenticación a Keycloak, el sistema hereda su robusta capa de seguridad. El flujo de "Olvidé mi contraseña", verificación por correo y pantallas de reseteo están operativas nativamente, cumpliendo el caso de uso sin necesidad de programar un flujo vulnerable a mano.

## 🟢 CU-4: Emitir alerta de emergencia comunitaria
**Estado:** `Completado (100% con Plus de Resiliencia)`
- **Justificación:** El vecino puede accionar el Botón SOS en la App. El sistema extrae latitud y longitud (`expo-location`) y emite un POST al servidor de forma instantánea. 
- **Flujo Alternativo Cumplido:** Se implementó exitosamente la **Contingencia SMS Offline**. Si no hay WiFi o Datos, el hardware activa la red GSM (`expo-sms`) y prepara un mensaje de texto pre-escrito con las coordenadas de Google Maps dirigido directo a la directiva.

## 🟢 CU-5: Consultar mapa de incidencias
**Estado:** `Completado`
- **Justificación:** El Administrador/Directiva cuenta con el Panel de Monitoreo Web en Next.js. El frontend consume la API de `/alertas` y pinta los marcadores georreferenciados en un mapa interactivo (Leaflet/Mapbox) en tiempo real.

## 🟢 CU-6: Atender / Cerrar incidencia comunitaria
**Estado:** `Completado`
- **Justificación:** El Backend FastAPI posee los métodos PUT/PATCH para actualizar los estados a "Resuelta" o "Falsa alarma". El Dashboard Web permite a la Directiva modificar estos estados cerrando el ciclo de vida de la emergencia, manteniendo la trazabilidad.

## 🟢 CU-7: Gestionar membresía comunitaria
**Estado:** `Completado (100%)`
- **Justificación:** La directiva cuenta con una sección funcional en el Panel Web (`/dashboard/membresia`) donde puede visualizar y gestionar las solicitudes de adhesión y los perfiles de la comunidad sin necesidad de acceder a la consola técnica, integrando a la perfección la UI del dashboard con la arquitectura robusta de roles y permisos del backend.

## 🟢 CU-8: Publicar comunicado oficial
**Estado:** `Completado`
- **Justificación:** La directiva cuenta con el módulo en la plataforma Web para redactar los comunicados. El Backend procesa estos mensajes y los inyecta en la base de datos PostgreSQL garantizando su persistencia y publicación inmediata.

## 🟢 CU-9: Consultar muro de avisos oficiales
**Estado:** `Parcialmente Completado`
- **Lo que está hecho:** El vecino cuenta con la pantalla de Avisos en la App Móvil ordenados cronológicamente. Se integró Polling Global para buscar comunicados nuevos cada 10s mientras la app esté en primer plano, mostrando Notificaciones Push Nativas y un Banner Flotante.
- **Faltante para el 100% (Firebase FCM):** Actualmente el sistema sufre las limitaciones de ahorro de batería de Android (Doze Mode). Para que las notificaciones suenen de forma confiable cuando la aplicación está **cerrada o en segundo plano**, se debe migrar obligatoriamente de *Polling Local* a un sistema push genuino mediante **Firebase Cloud Messaging (FCM)** vinculado al backend.

---

## 🎯 Conclusión del Estado Actual
**7 de los 9 Casos de Uso están 100% COMPLETADOS**, demostrando una integración robusta entre PostgreSQL/PostGIS, el Backend FastAPI, el Web App (Next.js) y la App Móvil (React Native) con contingencias Offline SMS.

Para culminar la plataforma a un nivel Enterprise, quedan **2 áreas pendientes de mejora (Deuda Técnica)**:
1. **Seguridad y Roles (CU-2):** Endurecer la validación de roles en el middleware de Next.js para proteger herméticamente las rutas del Web Admin.
2. **Notificaciones Background (CU-9):** Implementar Firebase Cloud Messaging (FCM) para garantizar la recepción de alertas cuando la app móvil esté completamente cerrada.
