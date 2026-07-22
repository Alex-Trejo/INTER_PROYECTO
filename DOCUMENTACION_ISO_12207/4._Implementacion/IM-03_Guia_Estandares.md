# Guía de Estándares y Buenas Prácticas

**CHASKI ALERTA - Sistema Integrado de Emergencias Comunitarias**

**Código:** Doc-EST-001  
**Versión:** 1.5  
**Fecha de Emisión:** 22/07/2026  
**Elaborado por:** Milena Maldonado, Alex Trejo, Alejandro Andrade, Allan Panchi  
**Aprobado por:** Ing. Dalton Arévalo  

---

## Contenido
1. Introducción
2. Estándares Generales
3. Buenas Prácticas Backend (FastAPI)
4. Buenas Prácticas Frontend Web (Next.js)
5. Buenas Prácticas Frontend Móvil (React Native Expo)
6. Beneficios de la Guía
7. Conclusiones
8. Responsables
9. Control de Cambios
10. Anexos

---

## 1. Introducción
La presente guía establece los estándares y buenas prácticas de desarrollo adoptados para el proyecto **Chaski Alert**. Su objetivo es asegurar que todos los miembros del equipo trabajen de manera consistente, siguiendo lineamientos claros que permitan mantener la calidad del software, facilitar el mantenimiento, promover la escalabilidad y asegurar la trazabilidad de los desarrollos realizados.

Esta guía es aplicable a:
- **Backend:** Python con FastAPI
- **Frontend web:** Next.js (React)
- **Frontend móvil:** React Native con Expo

---

## 2. Estándares Generales

### 2.1. Control de versiones:
- Uso de Git para todo el código fuente.
- Commits descriptivos bajo la convención de *Conventional Commits* (feat, fix, docs).
- Branch principal `main` como rama estable de producción.

### 2.2. Documentación del código:
- Comentarios claros en clases, métodos y esquemas.
- Documentación de propósito y parámetros utilizando docstrings (PEP-257 en Python) y JSDoc en TypeScript.
- Archivos README raíz con instrucciones de ejecución de Docker e instalación de librerías.

### 2.3. Formato y nomenclatura:
- Archivos organizados por funcionalidad (routers, schemas, core, screens, components).
- Uso estricto de `snake_case` para variables y funciones en Python (Backend).
- Uso de `camelCase` para variables y `PascalCase` para componentes en TypeScript (Frontend Web y Móvil).

### 2.4. Pruebas y verificación (Calidad y UX):
- **Pruebas unitarias:** Implementadas y verificadas en todos los clientes, sumando un total de **104 pruebas reales** para proteger el sistema de las incidencias documentadas en la evaluación heurística:
  - **Backend (FastAPI)**: pytest 9.1 (*53 pruebas*). Validando rangos geográficos permitidos, prevención de comunicados triviales (Incidencia P02) y registro seguro FCM (Incidencia P05).
  - **Panel web (Next.js)**: Jest 30 + Testing Library (*22 pruebas*). Cubriendo acciones del muro de comunicados y visualización asíncrona (timeSince) de incidentes (Incidencia P03).
  - **App móvil (Expo)**: jest-expo 54 (*29 pruebas*). Cubriendo componentes del onboarding y la asignación nativa de permisos para notificaciones Android 13+ (Incidencias P05 y P07).
- **Pruebas de Usabilidad y Experiencia de Usuario (UX):** Se aplicaron métricas reconocidas como **PSSUQ v3** (para medir la usabilidad post-estudio) y **UEQ** (para medir la experiencia de usuario integral pragmática y hedónica), contrastado con la escala **SUS** y la **Evaluación Heurística de Jakob Nielsen**. Estas validaciones se enfocaron en la adopción intercultural (bilingüismo Kichwa-Español) y la accesibilidad de las alertas SOS y flujos del sistema.

---

## 3. Buenas Prácticas Backend (FastAPI)
- **Arquitectura Limpia y Modular:** Separación en sub-módulos `routers` (controladores), `models` (esquemas Pydantic), y `database` (conexión).
- **Validación de datos y Serialización:** Uso de Pydantic v2 estricto para asegurar los tipos y estructuras JSON (`AlertaCreate`, `ComunicadoBase`).
- **Seguridad y Tokens:** Autenticación centralizada gestionada por Keycloak usando roles (Directiva y Comunero), validando tokens JWT. Restricción absoluta de credenciales hardcodeadas (uso de variables `.env`).
- **Persistencia Asíncrona:** Uso de `asyncpg` y PostgreSQL/PostGIS para realizar consultas SQL asíncronas no bloqueantes.
- **Documentación de Endpoints:** Autogeneración de documentación OpenAPI/Swagger en el endpoint `/docs`.

---

## 4. Buenas Prácticas Frontend Web (Next.js)
- **Componentización:** Creación de componentes reutilizables (e.g. `ComunicadoCard.tsx`, `MapView.tsx`) y envoltorios (Providers).
- **Consumo Asíncrono y Proxies:** Uso de clientes HTTP y *Server Actions* de Next.js, con soporte de rutas API y re-validación.
- **Estilos y Tailwind CSS:** Utilización de Tailwind para una consistencia visual ágil, manteniendo un archivo `globals.css` mínimo.
- **Tipado Fuerte:** Uso de TypeScript estricto, creando interfaces para toda estructura de datos recibida desde el backend.
- **Formateo de Código:** Integración de ESLint y configuración en `eslint.config.mjs` para prevenir anti-patrones.

---

## 5. Buenas Prácticas Frontend Móvil (React Native Expo)
- **Modularización del Proyecto:** Separación en `screens` (vistas), `components` (botones y modales), `contexts` (estados globales) y `services` (lógica de API).
- **Gestión de Estado Centralizada:** Uso de Context API (`AuthContext`, `ComunicadosContext`) para administrar información global y persistencia segura de la sesión.
- **Manejo de Contingencias (Offline):** Soporte de funcionalidad core SMS en caso de caída de internet durante emergencias.
- **Permisos Sensibles y Tiempos de Espera (Hold-to-activate):** Prevención de falsos positivos en el botón SOS mediante validaciones condicionales y temporizadores.
- **Geolocalización Asíncrona:** Uso preciso del SDK de Expo-Location capturando las coordenadas en background y foreground.

---

## 6. Beneficios de la Guía
- Mejora la coherencia y mantenibilidad del código entre distintos repositorios (Web, API, Mobile).
- Facilita la integración continua entre frontend y backend asegurando validación tipada.
- Reduce errores y retrabajos mediante pruebas automatizadas y evaluación heurística de diseño constante.
- Garantiza calidad y trazabilidad según los objetivos de gestión de calidad del proyecto ISO/IEC 12207.

---

## 7. Conclusiones
La adopción de estos estándares y buenas prácticas permite al equipo del proyecto Chaski Alert mantener la calidad técnica del sistema, optimizar tiempos de desarrollo, facilitar la colaboración y asegurar la entrega de un producto seguro y altamente escalable en la nube. Este documento servirá como referencia para futuras etapas de mantenimiento, ampliaciones del ecosistema de alertas (integración con sirenas IoT o nuevas app) y auditorías internas de calidad.

---

## 8. Responsables

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

## 9. Control de Cambios

| Versión | Fecha | Descripción del Cambio | Responsable |
|---|---|---|---|
| 1.0 | 13/08/2025 | Versión inicial de la Guía de Estándares | Milena Maldonado |
| 1.5 | 22/07/2026 | Adaptación de estándares a tecnologías actuales, agregando métricas UX y 104 pruebas unitarias formales. | Alex Trejo |

---

________________________                             ___________________________________
  Desarrolladora y Analista                                     Firma del Líder de Proyecto
      Milena Maldonado                                                     Alex Trejo

---

## 10. Anexos
- **Repositorio de Github:** `https://github.com/Alex-Trejo/INTER_PROYECTO.git`
- **Resultados completos de pruebas:** Archivo `PRUEBAS_UNITARIAS.md` del repositorio.
