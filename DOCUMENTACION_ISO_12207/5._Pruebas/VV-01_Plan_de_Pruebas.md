# Plan de Pruebas de Software

**CHASKI ALERT — Sistema de Alerta Comunitaria Intercultural**  
**Código:** Doc-PP-001  
**Versión:** 1.5  
**Fecha de Emisión:** 22/07/2026  
**Elaborado por:** Alejandro Andrade, Milena Maldonado, Allan Panchi, Alex Trejo  

---

## Contenido
1. Introducción
2. Objetivo de las Pruebas
3. Alcance
4. Tipos de Prueba
5. Configuración de Entorno de Pruebas
6. Estrategia de Pruebas
7. Plan de Casos de Prueba General
8. Criterios de Aceptación
9. Documentación de Resultados
10. Responsables
11. Control de Cambios
12. Anexos

---

## 1. Introducción
El presente Plan de Pruebas establece la estrategia, el alcance, los criterios y los procedimientos necesarios para garantizar que Chaski Alert cumpla con los requisitos funcionales, de calidad, de usabilidad intercultural y de desempeño definidos en el proyecto.
El plan asegura que los módulos backend, frontend web y frontend móvil sean evaluados exhaustivamente antes de la entrega a la directiva comunal y la puesta en producción.

---

## 2. Objetivo de las Pruebas
- Verificar que todas las funcionalidades definidas en el Documento de Requisitos estén implementadas correctamente (SOS, Muro, Mapa, Membresías).
- Detectar y corregir errores o inconsistencias en la lógica de georreferenciación y en la interfaz de usuario bilingüe.
- Validar la seguridad, integridad y confiabilidad de los datos manejados por el sistema (Keycloak y PostGIS).
- Evaluar el desempeño de la contingencia de alertas (SMS offline).
- Garantizar la compatibilidad y el correcto funcionamiento en el panel web administrativo y en smartphones Android.

---

## 3. Alcance
Define el conjunto de actividades, módulos y componentes del sistema que serán evaluados para garantizar que el proyecto cumpla con los requisitos funcionales, de calidad, rendimiento y seguridad.

### 3.1 Módulos Incluidos en las Pruebas
- **Backend (FastAPI):**
  - Autenticación y autorización mediante Keycloak (roles: Directiva y Comunero).
  - Recepción, validación espacial (PostGIS) y broadcast de alertas SOS.
  - Gestión de comunicados (Willaykuna).
  - Envío de notificaciones Push (Firebase Cloud Messaging).
- **Frontend Web (Next.js):**
  - Panel administrativo con Mapa Leaflet en tiempo real.
  - Interfaces de la directiva: registro de comunicados, gestión de falsas alarmas y revisión de membresías.
- **Frontend Móvil (React Native Expo):**
  - Emisión de alerta SOS con hold-to-activate (3s) y geolocalización.
  - Recepción de push notifications y fallback a SMS sin internet.
  - Visualización del perfil y estado de conexión al servidor.

### 3.2 Tipos de Pruebas Cubiertas
- **Pruebas Unitarias:** Evaluación aislada de lógicas de negocio con Jest, PyTest y jest-expo.
- **Pruebas Funcionales:** Confirmación de que los flujos de usuario (emitir SOS, ver mapa) se cumplen.
- **Pruebas de Usabilidad e Interculturalidad (UX):** Uso de métricas (PSSUQ, UEQ, SUS) para validar la comprensión del bilingüismo (Kichwa).
- **Pruebas de Seguridad:** Validación de roles JWT en endpoints restringidos.

### 3.3 Módulos y Actividades Fuera del Alcance
- Integraciones con sistemas de emergencia estatales (ECU911) no contemplados en este MVP.
- Pruebas de estrés de hardware de infraestructura externa.

### 3.4 Nivel de Cobertura y Criterios
- **Cobertura funcional:** 100% de los requerimientos críticos (Alertas y Mapa).
- **Cobertura unitaria:** 104 pruebas unitarias documentadas (53 Backend, 22 Web, 29 Móvil).

---

## 4. Tipos de Prueba

| Tipo de Prueba | Descripción | Herramientas |
|---|---|---|
| Unitarias | Verificación de funciones individuales en cada capa del sistema | PyTest (Backend), Jest (Web), jest-expo (Móvil) |
| Integración | Evaluación de la comunicación HTTP/WebSocket entre capas | Postman, Swagger UI, FastAPI TestClient |
| Funcionales | Validación de flujos de usuario (ej. Emisión SOS a Mapa) | Dispositivos Físicos, Chrome DevTools |
| Usabilidad | Evaluación de la experiencia, identidad cultural y facilidad | Cuestionarios SUS, PSSUQ v3, UEQ |
| Seguridad | Validación de acceso JWT, Keycloak y prevención de ataques | Keycloak Console, Pytest |

---

## 5. Configuración de Entorno de Pruebas

### 5.1. Componentes del Entorno
| Componente | Descripción | Versiones / Requisitos |
|---|---|---|
| Backend | API RESTful asíncrona | Python 3.11+, FastAPI, Uvicorn |
| Base de Datos | Base de datos espacial de pruebas | PostgreSQL 16, PostGIS 3.4 (`chaski_db`) |
| Frontend Web | Panel administrativo React | Node.js 20, Next.js 16, TailwindCSS |
| Frontend Móvil | Aplicación móvil nativa | Expo SDK 54, React Native |
| IAM / Seguridad | Servidor de identidades | Keycloak 24+ (`chaski-realm`) |

### 5.2. Preparación del Entorno
- **Backend:** Instalar Python 3.11+, crear `venv`, instalar `requirements.txt` y definir `.env`.
- **Base de Datos y Keycloak:** Levantar contenedores Docker definidos en `docker-compose.yml`, ejecutando `init.sql`.
- **Frontend Web y Móvil:** Instalar dependencias con `npm install`. Configurar variables `EXPO_PUBLIC_API_URL` apuntando a la IP local del backend de pruebas.

---

## 6. Estrategia de Pruebas
1. **Planificación:** Definición de la matriz de casos de prueba críticos (SOS y Comunicados).
2. **Ejecución Unitaria:** Ejecución de las 104 pruebas (vía `pytest` y `npm test`) protegiendo el sistema de regresiones.
3. **Pruebas de Usabilidad en Terreno:** Evaluación real con 15 comuneros para validar el entendimiento de la UI bilingüe (Kichwa-Español).
4. **Validación de Fallbacks:** Desactivación de datos/Wi-Fi en el dispositivo móvil para forzar y validar el envío de alerta vía SMS.

---

## 7. Plan de Casos de Prueba General

| ID | Módulo | Funcionalidad | Descripción de la prueba | Datos de prueba / Escenario |
|---|---|---|---|---|
| CP-01 | Autenticación | Login Keycloak (Móvil/Web) | Inicio de sesión con credenciales válidas generadas en Keycloak. | User: `admin`, Pass: `admin` (Role: Directiva) |
| CP-02 | Alertas (Móvil) | Emisión de SOS | Presionar botón SOS por 3s y comprobar geolocalización. | GPS Activo, Conexión a Internet: OK |
| CP-03 | Alertas (Móvil) | Fallback a SMS | Intentar emitir SOS sin conexión a internet. | Wi-Fi/Datos: OFF. Permiso SMS otorgado. |
| CP-04 | Mapa (Web) | Recepción en Tiempo Real | Verificar que el SOS emitido (CP-02) aparezca en el mapa de Directiva en <5s. | Interfaz de Directiva Activa |
| CP-05 | Mapa (Web) | Descartar Alerta | Directiva marca alerta como "Falsa Alarma". | Alerta ID existente. Estado -> Resuelta |
| CP-06 | Comunicados | Publicar Aviso | Directiva publica un comunicado y verifica validación de títulos vacíos o triviales. | Título: `aq` (Debe fallar), Título: `Asamblea` (OK) |
| CP-07 | Comunicados | Recepción Push (Móvil) | El móvil recibe el comunicado vía FCM y auto-actualiza el muro (10s polling). | Dispositivo registrado con Token FCM válido |
| CP-08 | Membresía | Solicitar Ingreso | Comunero nuevo solicita unirse al sector "Uray Llakta". | ID Comunero, Barrio: Uray Llakta |

---

## 8. Criterios de Aceptación
- Todos los casos de prueba (CP-01 a CP-08) deben ejecutarse con resultados exitosos.
- Ejecución limpia y sin errores de las 104 pruebas unitarias base.
- Las pruebas de seguridad (Keycloak) deben rechazar solicitudes sin token JWT con código 401.
- La aceptación final se realiza con la validación de las métricas de Usabilidad.

---

## 9. Documentación de Resultados
- Los resultados unitarios están documentados en `PRUEBAS_UNITARIAS.md`.
- Las incidencias y hallazgos de usabilidad (P01-P10) están centralizados en los reportes de Evaluación de Métricas (PSSUQ/UEQ).
- Se anexa evidencia visual (capturas) de la efectividad del sistema.

---

## 10. Responsables

A continuación, se detallan los responsables de este documento, sus roles dentro del proyecto y las funciones específicas asignadas en el marco del Sistema de Gestión de Calidad:

**Nombre:** Milena Maldonado  
**Rol:** Parte del equipo de desarrollo / Analista  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Verificar que la planificación cumpla con los estándares de calidad establecidos, supervisar el cumplimiento de los procesos definidos y proponer mejoras continuas en la documentación del proyecto.  
**Información de Contacto:** mvmaldonado3@espe.edu.ec  

**Nombre:** Alex Trejo  
**Rol / Cargo:** Líder de Proyecto / Parte del equipo de desarrollo  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Coordinar de manera general la planificación del proyecto, organizar las actividades por etapas, controlar su ejecución y asegurar el cumplimiento del cronograma y objetivos establecidos.  
**Información de Contacto:** aftrejo@espe.edu.ec  

**Nombre:** Alejandro Andrade  
**Rol:** Backend Developer / Database Developer  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Desarrollo de soluciones backend, arquitectura de sistema y control de bases de datos.  
**Información de Contacto:** laandrade9@espe.edu.ec  

**Nombre:** Allan Panchi  
**Rol:** Frontend Developer  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Desarrollo integral de Frontend, revisión, planificación y diseño de interfaces para usuario; siguiendo lineamientos y demás reglas usabilidad.  
**Información de Contacto:** avpanchi@espe.edu.ec  

---

## 11. Control de Cambios

| Versión | Fecha | Descripción del Cambio | Responsable |
|---|---|---|---|
| 1.0 | 13/08/2025 | Versión inicial del Plan de Pruebas | Alejandro Andrade |
| 1.5 | 22/07/2026 | Refactorización de casos de prueba adaptados a FastAPI, Expo y Next.js. Adición de matriz real. | Alex Trejo |

---

________________________                             ___________________________________
 Director de Pruebas                                              Firma del Líder de Proyecto
 Alejandro Andrade                                                      Alex Trejo

---

## 12. Anexos
- **Repositorio de Github:** `https://github.com/Alex-Trejo/INTER_PROYECTO.git`
- **Resultados Completos:** Archivo `PRUEBAS_UNITARIAS.md`
