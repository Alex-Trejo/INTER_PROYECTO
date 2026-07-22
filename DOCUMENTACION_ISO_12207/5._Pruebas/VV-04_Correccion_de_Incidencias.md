# Corrección de Incidencias y Mejoras

**Sistema de Alerta Comunitaria Intercultural**
**CHASKI ALERT**

**Código:** Doc-CI-001  
**Versión:** 1.0  
**Fecha de Emisión:** 22/07/2026  
**Elaborado por:** Alex Trejo, Alejandro Andrade, Milena Maldonado, Allan Panchi  

---

## Contenido
1. Introducción
2. Objetivo
3. Alcance
4. Clasificación de Incidencias
5. Registro de Incidencias y Acciones Correctivas
   - 5.1 Defectos funcionales detectados por pruebas
   - 5.2 Incidencias de usabilidad (Evaluación Heurística)
   - 5.3 Incidencias de configuración y despliegue
   - 5.4 Incidencias de la infraestructura de pruebas
6. Matriz de Trazabilidad
7. Incidencias Pendientes y Riesgos Aceptados
8. Verificación de las Correcciones
9. Conclusiones de Estabilidad
10. Responsables
11. Control de Cambios
12. Anexos

---

## 1. Introducción

Este documento detalla las incidencias técnicas y de usabilidad detectadas durante las
fases de Pruebas Unitarias, Evaluación Heurística de Jakob Nielsen y evaluación de
métricas de usabilidad (SUS, PSSUQ v3, UEQ) del sistema Chaski Alert. Registra además
las acciones correctivas aplicadas sobre el código fuente y la configuración del
sistema, garantizando la trazabilidad completa entre el hallazgo, la corrección y la
prueba que impide su regresión.

A diferencia de un registro de errores convencional, este documento incorpora tanto
defectos funcionales como incidencias de **experiencia de usuario intercultural**,
dado que en un sistema de alerta comunitaria un problema de comprensión idiomática
tiene el mismo impacto operativo que un fallo de código: en ambos casos el comunero
no consigue pedir ayuda.

---

## 2. Objetivo

- Registrar de forma trazable las incidencias detectadas en el ciclo de verificación.
- Documentar la causa raíz de cada incidencia, no únicamente su síntoma.
- Evidenciar la acción correctiva aplicada y el mecanismo que valida su corrección.
- Declarar de forma transparente las incidencias no resueltas y los riesgos aceptados.

---

## 3. Alcance

Cubre las incidencias detectadas entre el 5 y el 22 de julio de 2026 sobre los tres
componentes del sistema (Backend FastAPI, Panel Web Next.js y App Móvil Expo), así
como sobre su configuración de despliegue (Keycloak, Docker, Cloudflare Tunnel).

Quedan fuera del alcance las incidencias de infraestructura externa y las
funcionalidades no contempladas en el MVP.

---

## 4. Clasificación de Incidencias

| Categoría | Origen de la detección | Cantidad |
|---|---|---|
| A. Defectos funcionales | Pruebas unitarias automatizadas | 3 |
| B. Incidencias de usabilidad | Evaluación Heurística (P01–P10) | 9 |
| C. Configuración y despliegue | Verificación en ejecución | 4 |
| D. Infraestructura de pruebas | Implantación del entorno de testing | 4 |
| **Total registradas** | | **20** |

**Severidad** conforme a la escala de Nielsen (1994): 0 = sin problema · 1 = cosmético ·
2 = menor · 3 = mayor · 4 = catastrófico.

---

## 5. Registro de Incidencias y Acciones Correctivas

### 5.1 Defectos funcionales detectados por pruebas

| ID | Módulo | Problema detectado (causa raíz) | Acción correctiva | Estado / Validación |
|---|---|---|---|---|
| **INC-01** | Panel Web (Next.js) | **Doble desplazamiento horario en `timeSince()`.** La función comprobaba si la fecha ya traía zona horaria buscando `"+"` o `"Z"`, comprobación que **no detecta un desplazamiento negativo** como `-05:00`. Al añadirle un segundo offset, la fecha resultaba inválida y la tarjeta mostraba `hace NaNd`. | Se sustituyó la comprobación por la expresión regular `/(?:Z\|[+-]\d{2}:?\d{2})$/`, que evalúa el final de la cadena. | **Resuelto.** Validado por `tiempo.test.ts` (9 pruebas). |
| **INC-02** | Backend (FastAPI) | **`UnicodeEncodeError` al registrar el envío de notificaciones.** Los títulos de las notificaciones incluyen emojis (🚨 / 📢) y la consola de Windows usa la codificación cp1252. El `print()` de diagnóstico lanzaba la excepción **después** de haber enviado la notificación, abortando la tarea en segundo plano y dejando sin ejecutar la limpieza de tokens. | Se centralizó el registro en la función `_log()`, que sustituye los caracteres no representables en lugar de propagar la excepción. | **Resuelto.** Validado por `test_push_dispositivos.py`, que simula una consola cp1252. |
| **INC-03** | Backend (FastAPI) | **Tokens FCM inválidos no se daban de baja.** La detección solo contemplaba `UnregisteredError` y `SenderIdMismatchError`, por lo que un token con **formato incorrecto** se reintentaba indefinidamente en cada envío. | Se amplió la detección para incluir errores de autenticación de terceros y respuestas que identifican el token como no válido, marcando `activo = FALSE`. | **Resuelto.** Verificado en ejecución: el token de prueba quedó desactivado automáticamente. |

### 5.2 Incidencias de usabilidad (Evaluación Heurística)

| ID | Heur. | Sev. | Problema detectado | Acción correctiva | Estado / Validación |
|---|---|---|---|---|---|
| **INC-04** | H5 (P02) | 2.0 | **Muro contaminado.** Se permitían comunicados con títulos y mensajes de uno o dos caracteres (`aq`, `ss`, `test`), que se difundían a toda la comunidad sin confirmación previa. | Longitud mínima de 5 caracteres en título y 10 en mensaje, validada en el esquema Pydantic **y** en la interfaz, más un diálogo de confirmación que advierte que el aviso se enviará a toda la comunidad. | **Resuelto.** `test_comunicados_validacion.py` (16 pruebas) + verificación en navegador. |
| **INC-05** | H3 (P03) | 3.0 | **Sin capacidad de rectificación.** Un comunicado publicado por error no podía corregirse ni retirarse; la API carecía de los métodos correspondientes. | Se añadieron los endpoints `PUT` y `DELETE` protegidos por rol Directiva, con botones de corregir y retirar en cada tarjeta y confirmación previa. | **Resuelto.** `ComunicadoCard.test.tsx` + pruebas de API (403 para Comunero, 404 para inexistente). |
| **INC-06** | H5 (P04) | 3.2 | **Falsas alarmas por activación accidental.** El botón SOS se disparaba con un solo toque, emitiendo una alerta comunitaria real ante un roce involuntario. | Mecánica *hold-to-activate*: se exige mantener pulsado 3 segundos, con relleno visual progresivo y vibración al iniciar. Si se suelta antes, no se envía nada. | **Resuelto.** Verificado en dispositivo físico. |
| **INC-07** | H1 (P05) | 3.2 | **Sin avisos con la aplicación cerrada.** El sistema dependía de consultas periódicas y notificaciones locales, por lo que un comunero con la app cerrada o el teléfono en reposo (Doze) no recibía ninguna alerta. | Integración completa de Firebase Cloud Messaging: tabla `dispositivos`, endpoint de registro del token, envío en segundo plano al crear alertas y comunicados, y canal Android de máxima prioridad con `bypassDnd`. | **Resuelto.** `push.test.ts` (13 pruebas) + prueba de aceptación en dispositivo real con la app cerrada. |
| **INC-08** | H4 (P01, P10) | 2.8 / 2.0 | **Ruptura de la consistencia idiomática.** La pantalla donde el usuario escribe sus credenciales, servida por Keycloak, estaba íntegramente en inglés; antes de ella aparecía una página genérica *"Sign in with Keycloak"*. Los participantes de mayor edad requirieron apoyo para superarla. | Activación de internacionalización en el realm con español por defecto, traducciones propias bilingües Español–Kichwa, tema visual propio alineado al sistema de diseño del panel, y sustitución de la página intermedia por una pantalla de acceso propia. | **Resuelto.** Verificación end-to-end en navegador (7/7 comprobaciones). |
| **INC-09** | H1 (P06) | 1.4 | **Muro web sin actualización automática.** A diferencia del mapa, la página de comunicados solo consultaba al cargar y mediante un botón manual. | Auto-refresco cada 10 segundos replicando el patrón ya existente en el mapa, con indicador *"En vivo"* y hora de última sincronización. | **Resuelto.** Verificado: 3 peticiones automáticas en 28 segundos. |
| **INC-10** | H10 (P07) | 1.8 | **Ausencia de ayuda para el usuario final.** No existía tutorial ni guía de primeros pasos; el primer uso dependía de conocimiento previo. | Guía de bienvenida de tres pantallas con pictogramas grandes y lenguaje sencillo, mostrada una única vez y reabrible desde la pestaña Info. | **Resuelto.** `onboarding.test.ts` (16 pruebas). |
| **INC-11** | H8 (P08) | 1.8 | **Contenido técnico expuesto al comunero.** La pantalla Info mostraba estado de la API, requisitos de red y enlaces a documentación de desarrollador. | Rediseño con ayuda funcional (SOS, avisos, perfil) en lenguaje llano; el contenido técnico queda oculto tras siete toques en el logotipo. | **Resuelto.** Verificado en dispositivo. |
| **INC-12** | H6 (P09) | 2.8 | **Petición de ayuda bloqueada sin GPS.** Si el permiso de ubicación se rechazaba, el botón SOS quedaba inhabilitado sin vía alternativa para pedir auxilio. | El botón permanece operativo: la alerta se emite por SMS indicando el sector de residencia registrado en el perfil, y se ofrece reactivar el permiso. | **Resuelto.** Verificado en dispositivo físico. |

### 5.3 Incidencias de configuración y despliegue

| ID | Componente | Problema detectado (causa raíz) | Acción correctiva | Estado / Validación |
|---|---|---|---|---|
| **INC-13** | App Móvil (Expo) | **Firebase no llegaba al binario.** El archivo `google-services.json` se declaró en `app.json`, pero `expo run:android` **no vuelve a ejecutar el prebuild** cuando la carpeta `android/` ya existe. El resultado era un fallo silencioso: la aplicación no daba error, simplemente nunca obtenía el token FCM. | Ejecución explícita de `npx expo prebuild --platform android`, que propaga el archivo a `android/app/`, aplica el plugin Gradle de Google Services y declara el permiso `POST_NOTIFICATIONS`. | **Resuelto.** Verificadas las tres piezas en el proyecto nativo. |
| **INC-14** | Keycloak | **Enlaces generados en `http://` tras un proxy HTTPS.** Publicado mediante túnel, Keycloak desconocía que la conexión externa era segura y emitía `token-service` en texto plano, lo que rompe el flujo OAuth por discrepancia de esquema. | Se añadieron `KC_PROXY_HEADERS=xforwarded` y `KC_HOSTNAME_STRICT=false`, para que confíe en la cabecera `X-Forwarded-Proto`. | **Resuelto.** El realm devuelve ahora URLs `https://`. |
| **INC-15** | Panel Web (Next.js) | **Bloqueo de recursos internos ante dominio externo.** En modo desarrollo, Next.js rechaza servir `/_next/*` a un origen distinto de localhost. El panel entregaba el HTML pero **React no hidrataba**, de modo que el inicio de sesión quedaba detenido indefinidamente sin llegar a Keycloak. Se confirmó por la ausencia total de peticiones a `/api/auth`. | Declaración de `allowedDevOrigins: ["*.trycloudflare.com"]` en `next.config.ts`, con comodín porque el subdominio del túnel cambia en cada arranque. | **Resuelto.** Verificación end-to-end (6/6 comprobaciones). |
| **INC-16** | App Móvil (Expo) | **Botón de reactivación de permisos sin efecto.** Cuando el usuario ya había denegado la ubicación, Android marca `canAskAgain = false` y devuelve el rechazo **de inmediato y sin mostrar diálogo**, por lo que el botón aparentaba estar averiado. | Se detecta `canAskAgain` y, cuando el sistema ya no permite preguntar, se ofrece abrir directamente los ajustes de la aplicación. Se añadió además el caso de permiso concedido con GPS apagado. | **Resuelto.** Verificado en dispositivo físico. |

### 5.4 Incidencias de la infraestructura de pruebas

| ID | Componente | Problema detectado (causa raíz) | Acción correctiva | Estado |
|---|---|---|---|---|
| **INC-17** | Backend | **Riesgo de alteración de datos productivos.** Los archivos `test_aprobar.py` y `test_http.py` residían en la raíz del backend y, pese a no ser pruebas, pytest los recolectaba por su prefijo `test_`. El primero **se conecta a la base de datos real y modifica un usuario de Keycloak**. | Reubicación a `Backend/scripts_debug/` con documentación de su naturaleza, y exclusión explícita mediante `norecursedirs` en `pytest.ini`. | **Resuelto** |
| **INC-18** | App Móvil | **Conflicto de dependencias en el entorno de pruebas.** `jest-expo@57` exige React 19.2.3, mientras que Expo SDK 54 fija React 19.1.0. | Instalación mediante `expo install`, que selecciona `jest-expo@54`, compatible con el SDK. Se verificó que la versión de React permaneciera inalterada para no comprometer la compilación nativa. | **Resuelto** |
| **INC-19** | App Móvil | **Ausencia de `babel.config.js`.** Expo lo omite porque Metro aplica `babel-preset-expo` de forma implícita, pero Jest no hereda esa configuración y no lograba transformar los archivos de React Native (que emplean anotaciones Flow). | Creación del archivo declarando el mismo preset, de modo que no altera el comportamiento del build nativo. | **Resuelto** |
| **INC-20** | App Móvil | **Preset de plataforma incorrecto.** Las pruebas se ejecutaban como iOS, por lo que la creación del canal de notificaciones Android finalizaba sin realizar ninguna acción y las verificaciones no comprobaban nada. | Fijación del preset `jest-expo/android`, acorde con la única plataforma objetivo del proyecto. | **Resuelto** |

---

## 6. Matriz de Trazabilidad

Relación entre la incidencia, el problema de usabilidad de origen y el artefacto que
impide su regresión.

| Incidencia | Problema origen | Prueba que lo protege | Nº pruebas |
|---|---|---|---|
| INC-01 | Detectado por pruebas | `cliente_web/__tests__/tiempo.test.ts` | 9 |
| INC-02 | Detectado en ejecución | `Backend/tests/test_push_dispositivos.py` | 12 |
| INC-03 | Detectado en ejecución | Verificación funcional en BD | — |
| INC-04 | P02 (Heurística H5) | `Backend/tests/test_comunicados_validacion.py` | 18 |
| INC-05 | P03 (Heurística H3) | `cliente_web/__tests__/ComunicadoCard.test.tsx` | 13 |
| INC-06 | P04 (Heurística H5) | Prueba de campo en dispositivo | — |
| INC-07 | P05 (Heurística H1) | `cliente_movil/__tests__/push.test.ts` | 13 |
| INC-08 | P01 y P10 (Heurística H4) | Verificación end-to-end (7/7) | — |
| INC-09 | P06 (Heurística H1) | Verificación de red (3 peticiones/28 s) | — |
| INC-10 | P07 (Heurística H10) | `cliente_movil/__tests__/onboarding.test.ts` | 16 |
| INC-11 | P08 (Heurística H8) | Verificación en dispositivo | — |
| INC-12 | P09 (Heurística H6) | Verificación en dispositivo | — |
| INC-13 a INC-16 | Configuración | Verificación en ejecución | — |
| INC-17 a INC-20 | Infraestructura | Suite completa ejecutable | 104 |
| *(cobertura preventiva)* | CU-04 / CU-06 | `Backend/tests/test_alertas_validacion.py` | 23 |

> La cobertura preventiva corresponde a los rangos geográficos de las alertas
> (latitud −90..90, longitud −180..180) y a los estados permitidos de una incidencia.
> No deriva de una incidencia registrada: se incorporó para blindar la función más
> crítica del sistema ante futuras regresiones.

---

## 7. Incidencias Pendientes y Riesgos Aceptados

Se declaran de forma transparente las situaciones no resueltas al cierre de esta versión.

| ID | Descripción | Impacto real | Decisión |
|---|---|---|---|
| **PEN-01** | **Control de acceso por rol en la interfaz web.** El proxy de autenticación de Next.js (`src/proxy.ts`) verifica que exista sesión, pero no valida el **rol** del usuario, por lo que un Comunero autenticado puede cargar las rutas del panel de la Directiva. | **Limitado a la interfaz.** La API sí aplica la restricción y responde **403** a toda operación de Directiva, por lo que **no existe exposición ni alteración de datos**. El usuario únicamente observa una pantalla vacía con un mensaje de error. | Riesgo aceptado para el MVP. Corrección prevista: añadir la validación de rol en el proxy. |
| **PEN-02** | **Sin pruebas de renderizado en el cliente móvil.** `@testing-library/react-native@14.0.1` es incompatible con React 19.1 en el preset utilizado: su función `render` devuelve un objeto vacío. | Las pruebas del móvil cubren lógica y contenido, no el árbol de componentes. | Mitigado con verificación manual documentada en dispositivo físico. Reevaluar al actualizar el SDK. |
| **PEN-03** | **URLs de publicación no permanentes.** La modalidad gratuita de Cloudflare Tunnel asigna un subdominio distinto en cada arranque, lo que obliga a reiniciar el panel web y recompilar la aplicación móvil. | Operativo, no funcional. | Aceptado. Se automatizó mediante el script `iniciar_tuneles.ps1`, que reescribe la configuración de cada servicio. |

---

## 8. Verificación de las Correcciones

La suite completa de pruebas unitarias se ejecuta sin dependencias externas (no
requiere Docker, base de datos ni Keycloak activos), lo que permite validar las
correcciones de forma reproducible:

```powershell
cd Backend ; .\venv\Scripts\Activate.ps1 ; pytest
cd Frontend\cliente_web ; npm test
cd Frontend\cliente_movil ; npm test
```

**Resultado de la última ejecución (22/07/2026):**

| Componente | Pruebas | Resultado | Tiempo |
|---|---|---|---|
| Backend (pytest 9.1) | 53 | 53 correctas | 1.1 s |
| Panel Web (Jest 30) | 22 | 22 correctas | 1.3 s |
| App Móvil (jest-expo 54) | 29 | 29 correctas | 21 s |
| **Total** | **104** | **104 correctas** | |

---

## 9. Conclusiones de Estabilidad

Se registraron y resolvieron **20 incidencias** durante el ciclo de verificación,
distribuidas entre defectos funcionales, hallazgos de usabilidad, configuración de
despliegue e infraestructura de pruebas. Se mantienen **3 situaciones abiertas**,
todas ellas documentadas con su impacto real y su decisión asociada.

Cabe destacar tres aspectos del proceso:

**Las pruebas unitarias demostraron su utilidad desde su implantación.** La incidencia
INC-01 no había sido detectada por ninguna prueba manual ni por la evaluación
heurística, y fue descubierta por una prueba automatizada. Aunque no se manifestaba
con la configuración actual de la base de datos, se habría activado al migrar la
columna a `TIMESTAMPTZ`.

**Los fallos silenciosos resultaron los más peligrosos.** Las incidencias INC-02,
INC-13 e INC-16 compartían la característica de no producir mensaje de error alguno:
el sistema aparentaba funcionar mientras la funcionalidad estaba inoperativa. Su
detección requirió verificación en ejecución, no únicamente revisión de código.

**Las incidencias de usabilidad tuvieron mayor severidad media que los defectos
funcionales.** Los problemas de mayor puntuación en la escala de Nielsen (INC-06 e
INC-07, ambos 3.2) no eran errores de programación, sino decisiones de diseño que
comprometían la función crítica del sistema: la capacidad del comunero de pedir ayuda
y de ser advertido.

Las 104 pruebas unitarias integradas al proyecto previenen la regresión de los
defectos corregidos y constituyen la base para el mantenimiento evolutivo del sistema.

---

## 10. Responsables

**Nombre:** Alex Trejo  
**Rol / Cargo:** Líder de Proyecto / Parte del equipo de desarrollo  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Coordinar el registro y seguimiento de incidencias, priorizar las
acciones correctivas según severidad e impacto, y validar el cierre de cada incidencia
antes de su documentación.  
**Información de Contacto:** aftrejo@espe.edu.ec  

**Nombre:** Alejandro Andrade  
**Rol:** Backend Developer / Database Developer  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Diagnóstico y corrección de las incidencias de la capa backend y
de base de datos, implementación de las pruebas unitarias de validación de esquemas y
verificación de la integridad de los datos tras cada corrección.  
**Información de Contacto:** laandrade9@espe.edu.ec  

**Nombre:** Allan Panchi  
**Rol:** Frontend Developer  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Corrección de las incidencias de interfaz en el panel web y en la
aplicación móvil, aplicación de las mejoras derivadas de la evaluación heurística y
verificación del cumplimiento de los lineamientos de usabilidad.  
**Información de Contacto:** avpanchi@espe.edu.ec  

**Nombre:** Milena Maldonado  
**Rol:** Parte del equipo de desarrollo / Analista  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Verificar que el registro de incidencias cumpla los estándares de
calidad establecidos, comprobar la trazabilidad entre hallazgo, corrección y prueba, y
proponer mejoras continuas en la documentación del proyecto.  
**Información de Contacto:** mvmaldonado3@espe.edu.ec  

---

## 11. Control de Cambios

| Versión | Fecha | Descripción del Cambio | Responsable |
|---|---|---|---|
| 1.0 | 22/07/2026 | Versión inicial. Registro de 20 incidencias con sus acciones correctivas, matriz de trazabilidad y declaración de 3 riesgos aceptados. | Alex Trejo |

---

________________________                             ___________________________________
 Director de Pruebas                                              Firma del Líder de Proyecto
 Alejandro Andrade                                                      Alex Trejo

---

## 12. Anexos

- **Repositorio de GitHub:** `https://github.com/Alex-Trejo/INTER_PROYECTO.git`
- **Detalle de las pruebas unitarias:** `PRUEBAS_UNITARIAS.md`
- **Plan de Pruebas:** `VV-01_Plan_de_Pruebas.md`
- **Resultados de Pruebas:** `VV-03_Resultados_de_Pruebas.md`
- **Evaluación de métricas de usabilidad (SUS, PSSUQ, UEQ):**
  `Tarea_8_7_2026/Informe_Evaluacion_Metricas_ChaskiAlert.pdf`
- **Evidencia visual de las correcciones:** `Tarea_8_7_2026/capturas/`
- **Documentación técnica de las correcciones:**
  `Backend/NOTIFICACIONES_PUSH.md`, `Backend/keycloak/LEEME.md`, `TUNEL_CLOUDFLARE.md`
