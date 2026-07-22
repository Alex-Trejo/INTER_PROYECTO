# Resultados de Pruebas

**Sistema de Alerta Comunitaria Intercultural**
**CHASKI ALERT**

**Código:** Doc-RP-001  
**Versión:** 1.5  
**Fecha de Emisión:** 22/07/2026  
**Elaborado por:** Milena Maldonado, Alex Trejo, Alejandro Andrade, Allan Panchi  

---

## Contenido
1. Introducción
2. Información General
3. Objetivos
   - Objetivo General
   - Objetivos Específicos
4. Alcance
5. Metodología
6. Resumen de Resultados por Módulo
7. Observaciones Generales
8. Problemas Detectados y Acciones Correctivas
9. Conclusiones
10. Recomendaciones
11. Responsables
12. Control de Cambios
13. Anexos

---

## 1. Introducción
El presente informe detalla los resultados obtenidos en la fase de pruebas del proyecto Chaski Alert, desarrollado para optimizar la gestión de emergencias, comunicación comunitaria y geolocalización en tiempo real.
Las pruebas se llevaron a cabo con el objetivo de verificar que las funcionalidades implementadas cumplan con los requisitos establecidos en la fase de análisis y diseño (DRS), asegurando la correcta operación, integridad de los datos espaciales, seguridad y la usabilidad (UX) bilingüe.
Este documento recopila los hallazgos, métricas (incluyendo UEQ, SUS y PSSUQ), incidencias y conclusiones derivadas de la ejecución de 104 pruebas unitarias y 25 casos de pruebas funcionales en todos los módulos del sistema. Constituye una herramienta clave para garantizar la calidad del producto antes de su puesta en producción.

---

## 2. Información General
- **Proyecto:** Chaski Alert – Sistema de Alerta Comunitaria Intercultural
- **Fecha de pruebas:** 01/06/2026 – 22/07/2026
- **Responsables:** Equipo de Desarrollo, Control de Calidad y Analistas UX
- **Entornos de prueba:**
  - **Backend:** Python con FastAPI (local y Docker)
  - **Frontend Web:** Next.js (React 19)
  - **Frontend Móvil:** React Native con Expo SDK 54
  - **Base de datos:** PostgreSQL 16 con PostGIS 3.4
  - **Gestor de Identidades:** Keycloak 24

---

## 3. Objetivos

### Objetivo General
Evaluar el correcto funcionamiento del sistema Chaski Alert mediante la ejecución de pruebas planificadas unitarias y de usuario, garantizando la confiabilidad de las alertas, la pertinencia cultural y el cumplimiento de los requisitos del proyecto.

### Objetivos Específicos
- Verificar que cada módulo (SOS, Mapa, Muro) opere de acuerdo con los criterios definidos.
- Identificar y corregir defectos de validación de datos en el backend y problemas visuales en el frontend.
- Evaluar la experiencia de usuario (UX) en interfaces móviles a través de pruebas de usabilidad guiadas.
- Validar la contingencia y el envío de alertas SMS cuando el usuario carece de internet.
- Confirmar la seguridad JWT basada en roles mediante Keycloak.

---

## 4. Alcance
Las pruebas abarcan la lógica de negocio implementada en el backend y los componentes del frontend web y móvil:
- **Módulo de Emergencias (Móvil/Web):** Emisión del SOS con *hold-to-activate*, geolocalización asíncrona, y visualización en tiempo real en el mapa Leaflet.
- **Módulo de Autenticación (Keycloak):** Flujos de login, refresh tokens y roles (Directiva y Comunero).
- **Módulo de Comunicados:** Creación de avisos (Willaykuna), validaciones de título y recepción de Push Notifications (FCM).
- **Módulo UX/UI:** Adopción del bilingüismo (Kichwa-Español) y métricas de usabilidad.

*Fuera del alcance:* Integración técnica con sirenas de terceros o ECU911.

---

## 5. Metodología
- **Pruebas Unitarias:** Se utilizaron tests en `Pytest` (Backend), `Jest` (Web) y `jest-expo` (Móvil) ejecutados en 1.3s y 21s respectivamente, garantizando comportamiento de schemas y lógica sin dependencias. Total: 104 pruebas reales.
- **Pruebas Funcionales:** Ejecución manual en dispositivos físicos usando Expo CLI y Postman.
- **Pruebas de Usabilidad (UX):** Aplicación de encuestas SUS, PSSUQ v3 y UEQ a 15 participantes externos (comuneros), logrando un SUS global de 80.2/100 ("Bueno").
- **Criterios de aceptación:**
  - Emisión de alerta efectiva < 5s.
  - Generación de JWT válida y autorización por rol.
  - Interfaces andinas y traducidas aprobadas por la evaluación heurística.

---

## 6. Resumen de Resultados por Módulo

| Módulo | Funcionalidades Probadas | Total Casos | Exitosos | Fallidos | Observaciones |
|---|---|---|---|---|---|
| Autenticación | Login, persistencia, verificación tokens Keycloak | 3 | 3 | 0 | Tokens generados y flujos seguros de roles |
| Emergencias | Emisión SOS, Geolocalización, Fallback a SMS | 4 | 4 | 0 | Precisión de coordenadas PostGIS, SMS funciona offline |
| Muro Avisos | Publicar comunicado, listar, validar vacíos | 6 | 6 | 0 | Prevención de spam activa (tests P02 superados) |
| Mapa Web | WebSockets en Leaflet, resolver falsas alarmas | 2 | 2 | 0 | Rendering fluido, estado de alertas actualizado en vivo |
| Evaluaciones UX | UX/UI SUS, UEQ y PSSUQ, 10 heurísticas Nielsen | 10 | 10 | 0 | Diseño atractivo (+1.66 UEQ) e identidad lograda |
| Pruebas Unitarias | Jest / Pytest lógicas de control | 104 | 104 | 0 | Cubrimiento completo en los 3 clientes. 100% OK. |

**Porcentaje de éxito global:** 100%

---

## 7. Observaciones Generales
- Todos los módulos funcionan correctamente en términos de seguridad (RBAC) y asincronismo (FastAPI).
- Los tests unitarios cubren los flujos críticos documentados en la evaluación de usabilidad, mitigando el riesgo de regresiones futuras.
- Las validaciones de rangos geográficos permitidos (-90 a 90) funcionan según lo esperado.
- Las evaluaciones UX confirman una alta adopción cultural de la herramienta por parte de los comuneros.

---

## 8. Problemas Detectados y Acciones Correctivas

**8.1. Fallo en el cálculo asíncrono de timeSince()**
- **Detección:** Una prueba en Next.js detectó que un huso horario `-05:00` en la base de datos producía que la UI mostrara "hace NaNd".
- **Acción Correctiva:** Se implementó una Regex `/(?:Z|[+-]\d{2}:?\d{2})$/` en el componente para prevenir el doble offset. Solucionado y cubierto por prueba unitaria.

**8.2. Publicación de comunicados triviales (P02 Heurística)**
- **Detección:** Los usuarios podían enviar alertas con texto 'aq' o 'test'.
- **Acción Correctiva:** El Backend FastAPI ahora rechaza peticiones cortas. Se agregó `test_comunicados_validacion.py` para bloquear este escenario permanentemente.

**8.3. Disparo accidental de la alerta SOS (P04 Heurística)**
- **Detección:** El botón rojo se disparaba con un toque accidental, causando pánico.
- **Acción Correctiva:** Se integró un temporizador (*Hold-to-Activate* de 3 segundos) con animación visual en el frontend móvil, validado funcionalmente.

---

## 9. Conclusiones
- El sistema Chaski Alert está preparado en su totalidad para despliegue productivo y uso por la directiva comunal.
- Las funcionalidades críticas de seguridad ciudadana (Alerta y Muro) se encuentran estables.
- La identidad cultural (diseño y bilingüismo) probó ser un factor determinante y altamente positivo en la aceptación de la aplicación (UEQ Atractivo +1.66).

---

## 10. Recomendaciones
- Mantener en ejecución las 104 pruebas unitarias base antes de integrar nuevas funciones (CI/CD).
- Escalar el servidor de base de datos si la cantidad de dispositivos conectados supera los 10,000 activos debido a WebSockets y peticiones espaciales concurrentes.
- Ejecutar un simulacro de emergencia real en campo posterior a la capacitación de la directiva.

---

## 11. Responsables

**Nombre:** Milena Maldonado  
**Rol:** Parte del equipo de desarrollo / Analista  
**Categoría:** Ing. Software  
**Responsabilidad:** Verificación y validación de la documentación.  
**Correo:** mvmaldonado3@espe.edu.ec  

**Nombre:** Alex Trejo  
**Rol:** Líder de Proyecto / Parte del equipo de desarrollo  
**Categoría:** Ing. Software  
**Responsabilidad:** Coordinación general y ejecución.  
**Correo:** aftrejo@espe.edu.ec  

**Nombre:** Alejandro Andrade  
**Rol:** Backend Developer  
**Categoría:** Ing. Software  
**Responsabilidad:** Control de bases de datos y ejecución backend.  
**Correo:** laandrade9@espe.edu.ec  

**Nombre:** Allan Panchi  
**Rol:** Frontend Developer  
**Categoría:** Ing. Software  
**Responsabilidad:** Revisión UX, evaluación SUS/UEQ y validación móvil.  
**Correo:** avpanchi@espe.edu.ec  

---

## 12. Control de Cambios

| Versión | Fecha | Descripción del Cambio | Responsable |
|---|---|---|---|
| 1.0 | 13/08/2025 | Versión inicial | Alejandro Andrade |
| 1.5 | 22/07/2026 | Integración de 104 pruebas unitarias, UX y adecuación a Chaski Alert | Alex Trejo |

---

________________________                             ___________________________________
 Evaluador UX / Pruebas                                      Firma del Líder de Proyecto
 Alejandro Andrade                                                    Alex Trejo

---

## 13. Anexos
- **Resultados completos de UX:** Archivo `Informe_Evaluacion_Metricas_ChaskiAlert.md`.
- **Resultados unitarios:** Archivo `PRUEBAS_UNITARIAS.md` con 104 test ejecutables.
- **Repositorio de Github:** `https://github.com/Alex-Trejo/INTER_PROYECTO.git`
