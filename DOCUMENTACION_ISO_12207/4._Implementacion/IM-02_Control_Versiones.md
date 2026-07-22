# Control de Versiones
**CHASKI ALERTA - Sistema Integrado de Emergencias Comunitarias**  
**Código:** Doc-CV-001  
**Versión:** 1.5  
**Fecha de Emisión:** 22/07/2026  
**Elaborado por:** Milena Maldonado, Alex Trejo, Alejandro Andrade, Allan Panchi  
**Aprobado por:** Ing. Dalton Arévalo  

---

## Contenido
- 1. Introducción
- 2. Objetivo del Control de Versiones
- 3. Herramientas y Procedimientos Utilizados
- 4. Procedimiento de Versionado
- 5. Historial de Versiones (Estado Actual Git)
- 6. Reglas de Commits
- 7. Conclusiones
- 8. Responsables
- 9. Control de Cambios
- 10. Anexos

---

## 1. Introducción
El control de versiones es una práctica esencial en la ingeniería de software que permite registrar, organizar y supervisar los cambios en el código fuente a lo largo del ciclo de vida del sistema. Para el proyecto **Chaski Alert (Chaski Alerta)**, se implementó un sistema estricto de control de versiones utilizando **Git** y repositorios en **GitHub**, asegurando trazabilidad, colaboración eficiente y recuperación ante errores o conflictos en la integración continua.

---

## 2. Objetivo del Control de Versiones
- Mantener un historial completo y auditable de los cambios realizados en el backend (FastAPI), frontend web (Next.js) y frontend móvil (React Native Expo).
- Facilitar la colaboración simultánea entre los miembros del equipo sin sobrescribir avances.
- Garantizar la trazabilidad de los commits con las tareas y requisitos del estándar ISO/IEC 12207.

---

## 3. Herramientas y Procedimientos Utilizados

| Herramienta | Función | Observaciones |
|---|---|---|
| Git 2.4x | Control de versiones distribuido | Base del control de código fuente |
| GitHub | Repositorio centralizado | Hospeda el código oficial del proyecto |

---

## 4. Procedimiento de Versionado
Se emplea un modelo basado en desarrollo sobre la rama principal (**main**), dado el tamaño del equipo. El procedimiento incluye:
1. **Desarrollo Local:** Cada desarrollador actualiza su repositorio local (`git pull`).
2. **Implementación de Cambios:** Se realizan las modificaciones del código.
3. **Commit Local:** Una vez probados los cambios, se empaquetan en commits atómicos descriptivos.
4. **Push a Remoto:** Los cambios se suben a GitHub (`git push`).
*Ramas actuales en el repositorio:* `main` (única rama activa detectada mediante `git branch`).

---

## 5. Historial de Versiones (Estado Actual Git)

Con base en el historial real del repositorio, las versiones e integraciones más significativas han sido:

| Versión | Fecha | Módulo / Área | Responsable | Descripción de Cambios |
|---|---|---|---|---|
| `5995e54` | 22/07/2026 | General | Equipo | update |
| `9d306be` | 22/07/2026 | Documentación | Milena Maldonado | docs: add comprehensive project status report, root READMEs, and dev scripts |
| `8287a05` | 20/07/2026 | Móvil | Alejandro Andrade | feat(mobile): add offline SMS contingency, global push notifications, and release builds |
| `3010a00` | 18/07/2026 | Frontend Web | Allan Panchi | feat(web): implement Next.js dashboard, membership management, and secure auth |
| `4767429` | 15/07/2026 | Backend | Alex Trejo | feat(backend): implement enterprise Keycloak auth, routers and database integration |
| `0d250a0` | 10/06/2026 | General | Equipo | Proyecto MVP v 1.0.0 |
| `d006360` | 05/05/2026 | Repositorio | Alex Trejo | Initial commit |

---

## 6. Reglas de Commits
Se estandarizó el uso de Conventional Commits para asegurar legibilidad en el historial. Los prefijos utilizados son:
- **feat:** Una nueva característica (e.g. `feat(backend): implement enterprise Keycloak auth`).
- **fix:** Una corrección de errores (bug fix).
- **docs:** Cambios únicamente en la documentación (e.g. `docs: add comprehensive project status report`).
- **update:** Actualizaciones menores generales.

---

## 7. Conclusiones
El control de versiones mediante Git ha sido el pilar fundamental para garantizar un desarrollo ordenado, seguro y auditable en **Chaski Alert**. Como se evidencia en el historial real del repositorio, la separación clara de los commits para el *backend*, *frontend web* y *móvil* ha permitido un seguimiento exacto de cada incremento funcional, logrando un flujo robusto y alineado con los estándares de gestión de la configuración (ISO/IEC 12207).

---

## 8. Responsables

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
| 1.0 | 13/08/2025 | Estructuración del plan inicial de versionado | Allan Panchi |
| 1.1 | 22/05/2026 | Documentación del commit 0d250a0 (MVP) | Alex Trejo |
| 1.2 | 10/06/2026 | Documentación integraciones feat(backend) y feat(web) | Alejandro Andrade |
| 1.3 | 28/06/2026 | Documentación integración feat(mobile) | Milena Maldonado |
| 1.5 | 22/07/2026 | Inserción de tabla de Responsables y validación de reglas de commit reales | Alex Trejo |

---

## 10. Anexos
- **Enlace URL**: `https://github.com/Alex-Trejo/INTER_PROYECTO.git`
- **Rama Principal (Producción)**: `main`
