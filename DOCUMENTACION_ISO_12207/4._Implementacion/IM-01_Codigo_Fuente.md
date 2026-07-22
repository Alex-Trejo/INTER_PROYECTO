# Informe de Código Fuente
**CHASKI ALERTA — Sistema Integrado de Emergencias Comunitarias**  
**Código:** Doc-CF-001  
**Versión:** 1.4  
**Fecha de Emisión:** 22/07/2026  
**Elaborado por:** Milena Maldonado, Alex Trejo, Alejandro Andrade, Allan Panchi  
**Aprobado por:** Ing. Dalton Arévalo  

---

## Contenido
- 1. Introducción
- 2. Estructura del Código Fuente
  - 2.1 Backend — FastAPI & Python
  - 2.2 Frontend Web — Next.js & React
  - 2.3 Frontend Móvil — React Native & Expo
- 3. Estándares y Buenas Prácticas
- 4. Conclusiones
- 5. Responsables
- 6. Control de Cambios
- 7. Anexos y Evidencias Visuales

---

## 1. Introducción
El presente informe documenta detalladamente el código fuente del sistema **Chaski Alert (Chaski Alerta)**, incluyendo el backend API RESTful, el frontend web de administración comunal y el cliente móvil nativo para dispositivos Android.

La documentación tiene como objetivo principal:
- Facilitar la comprensión de la estructura del proyecto y de sus capas arquitectónicas.
- Asegurar la trazabilidad completa entre los requerimientos del sistema, la pertinencia intercultural bilingüe (Español – Kichwa) y los módulos de código implementados.
- Servir como referencia técnica oficial para el mantenimiento, la escalabilidad y las auditorías de calidad bajo la norma **ISO/IEC 12207**.
- Cumplir rigurosamente con los estándares de codificación, seguridad OAuth2/JWT con Keycloak y resiliencia en contingencias de red.

---

## 2. Estructura del Código Fuente

### 2.1 Backend — FastAPI & Python
El backend fue desarrollado utilizando el framework FastAPI (Python 3.11/3.13), aplicando una arquitectura limpia dividida en controladores (Routers), modelos de datos (Pydantic schemas), capa de seguridad (Keycloak OAuth2/JWT) y persistencia asíncrona mediante AsyncPG y Databases sobre una base de datos PostgreSQL con extensión espacial PostGIS.

#### Dependencias y Librerías Principales (`requirements.txt`):
```text
fastapi==0.115.12
uvicorn[standard]==0.34.2
asyncpg==0.30.0
databases==0.9.0
python-dotenv==1.1.0
pydantic==2.11.3
python-keycloak==4.7.3
httpx==0.28.1
```

#### Árbol de Directorios del Backend:
```text
Backend/
├── core/
│   ├── config.py           # Variables de entorno (DB_URL, KEYCLOAK_URL, SECRET_KEY)
│   └── security.py         # Verificación y decodificación de tokens JWT Bearer
├── database/
│   ├── connection.py       # Pool de conexiones asíncronas con AsyncPG
│   ├── init.sql            # Script DDL de tablas iniciales (usuarios, sectores)
│   └── final.sql           # Script completo PostGIS con funciones espaciales
├── models/
│   ├── alerta.py           # Esquemas Pydantic para creación y respuesta SOS
│   ├── comunicado.py       # Esquemas Pydantic para el muro de avisos comunitarios
│   └── usuario.py          # Esquemas Pydantic para perfil de comunero y directiva
├── routers/
│   ├── alertas.py          # GET /alertas, POST /alertas/sos, PUT /alertas/{id}/atender
│   ├── comunicados.py      # GET, POST, PUT, DELETE /comunicados
│   ├── directiva.py        # GET /directiva/solicitudes, PUT /directiva/aprobar
│   ├── usuarios.py         # GET, PUT /usuarios/perfil
│   └── auth.py             # Proxy de inicio de sesión OIDC con Keycloak
├── venv/                   # Entorno virtual aislado de Python
├── main.py                 # Instancia principal de FastAPI, CORS y registro de routers
└── requirements.txt        # Dependencias de paquetes PyPI
```

---

### 2.2 Frontend Web — Next.js & React
El frontend web fue desarrollado utilizando Next.js 16 (React 19) en TypeScript, con renderizado híbrido y componentes estilizados con Tailwind CSS. Proporciona el panel administrativo para la Directiva Comunal con mapa Leaflet interactivo en tiempo real y gestión de comunicados.

#### Árbol de Directorios del Frontend Web:
```text
cliente_web/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── alertas/
│   │   │   │   └── page.tsx        # Panel del mapa espacial Leaflet en vivo
│   │   │   ├── comunicados/
│   │   │   │   └── page.tsx        # Muro administrativo con SWR polling (10s)
│   │   │   └── miembros/
│   │   │       └── page.tsx        # Gestión del Ayllu y solicitudes de ingreso
│   │   ├── favicon.ico
│   │   ├── globals.css             # Estilos globales y tokens CSS Tailwind
│   │   ├── layout.tsx              # Layout raíz con proveedores de contexto
│   │   └── page.tsx                # Landing page intercultural
│   ├── components/
│   │   ├── Map.tsx                 # Componente interactivo Leaflet React
│   │   ├── Navbar.tsx              # Barra de navegación bilingüe
│   │   ├── Sidebar.tsx             # Menú lateral del dashboard
│   │   └── ModalConfirm.tsx        # Diálogo modal de confirmación
│   └── lib/
│       ├── api.ts                  # Instancia Axios con interceptores JWT
│       └── auth.ts                 # Helpers de sesión y roles de Keycloak
├── public/                         # Assets estáticos y logotipos
├── next.config.js                  # Configuración de compilación Next.js
├── package.json                    # Dependencias Node.js
└── tsconfig.json                   # Configuración de TypeScript estricto
```

---

### 2.3 Frontend Móvil — React Native & Expo
El frontend móvil fue desarrollado con React Native y Expo SDK 54, utilizando un Custom Client compilado para Android. Se conecta al backend mediante HTTP/JSON y ofrece soporte para geolocalización GPS precisa, contingencia sin internet mediante SMS y activación de SOS asistida por gestos.

#### Árbol de Directorios del Frontend Móvil:
```text
cliente_movil/
├── screens/
│   ├── YanapawayScreen.tsx         # Botón SOS con Hold-to-activate (3s) y GPS
│   ├── WillaykunaScreen.tsx        # Muro de avisos comunitarios
│   ├── AylluScreen.tsx             # Credencial comunitaria del comunero
│   ├── InfoScreen.tsx              # Información del sistema y modo dev (7 taps)
│   └── LoginScreen.tsx             # Inicio de sesión Keycloak bilingüe
├── components/
│   ├── OnboardingModal.tsx         # Guía tutorial interactiva en Kichwa/Español
│   └── EmergencyButton.tsx         # Componente circular animado SOS
├── assets/                         # Iconografía andina y recursos gráficos
├── .env                            # Variables de entorno (API_URL, KEYCLOAK_URL)
├── build-android.bat               # Script de montaje SUBST Z: y build Gradle
├── app.json                        # Configuración del manifiesto Expo SDK 54
├── index.ts                        # Registro del componente raíz
└── package.json                    # Dependencias NPM de React Native
```

---

## 3. Estándares y Buenas Prácticas
- **Comentarios y documentación**: Cada clase, función y módulo está documentado con autor, fecha, propósito y descripción de parámetros.
- **Consistencia de nombres**: Se aplican nombres descriptivos y coherentes (`snake_case` en Python/FastAPI, `camelCase`/`PascalCase` en React y TypeScript).
- **Control de versiones**: Uso estricto de Git y GitHub para seguimiento de cambios, con mensajes de commit claros estructurados por módulos.
- **Pruebas y resiliencia**: Pruebas unitarias de endpoints en FastAPI y pruebas funcionales en dispositivos móviles físicos Android.

---

## 4. Conclusiones
- La documentación del código fuente facilita la comprensión, mantenimiento y escalabilidad del sistema Chaski Alert.
- Se asegura que el código cumpla con los estándares de calidad definidos bajo la norma **ISO/IEC 12207**.
- El registro de cambios y la arquitectura bien modularizada permiten realizar auditorías internas y futuras integraciones de manera segura y trazable.

---

## 5. Responsables
A continuación, se detallan los responsables de este documento, sus roles dentro del proyecto y las funciones específicas asignadas en el marco del Sistema de Gestión de Calidad:

**Nombre:** Milena Maldonado  
**Rol / Cargo:** Líder de Proyecto / Product Owner / Frontend Developer  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Coordinar el proyecto, liderar el diseño de interfaces accesibles, validar requerimientos y ejecutar pruebas funcionales y de usabilidad.  
**Información de Contacto:** mvmaldonado3@espe.edu.ec  

**Nombre:** Alex Trejo  
**Rol / Cargo:** Scrum Master / Backend Developer / QA  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Gestionar la planificación técnica del proyecto, desarrollar APIs y coordinar pruebas técnicas y de rendimiento.  
**Información de Contacto:** lanchado10@gmail.com  

**Nombre:** Alejandro Andrade  
**Rol / Cargo:** Backend Developer / Database Developer  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Diseñar y administrar la base de datos relacional y espacial, desarrollar servicios backend y gestionar notificaciones en tiempo real.  
**Información de Contacto:** aandrade@espe.edu.ec  

**Nombre:** Allan Panchi  
**Rol / Cargo:** Frontend Developer  
**Categoría profesional:** Ing. Software  
**Responsabilidad:** Desarrollar las interfaces cliente en aplicaciones web y móviles e integrar el consumo de APIs del sistema.  
**Información de Contacto:** avpanchi@espe.edu.ec  

**Nombre:** Patricia Córdova  
**Rol / Cargo:** Secretaria de Junta Barrial  
**Categoría profesional:** Representante Comunitario  
**Responsabilidad:** Proporcionar información sobre las necesidades comunitarias, validar requerimientos funcionales y colaborar en la evaluación del sistema durante el piloto.  
**Información de Contacto:** N/D  

---

________________________                             ___________________________________
   Firma del Gerente de TI				    Firma del Líder de Proyecto
   Ing. Dalton Arévalo                                                               Milena Maldonado

---

## 6. Control de Cambios

| Versión | Fecha | Descripción del Cambio | Responsable |
|---|---|---|---|
| 1.0 | 10/05/2026 | Versión inicial de arquitectura y repositorio de código | Alex Trejo |
| 1.1 | 25/05/2026 | Desarrollo de Endpoints Backend y Schemas Pydantic | Allan Panchi |
| 1.2 | 12/06/2026 | Implementación de Interfaces Web (Dashboard, Leaflet) | Milena Maldonado |
| 1.3 | 28/06/2026 | Desarrollo de Cliente Móvil React Native / Expo | Alejandro Andrade |
| 1.4 | 22/07/2026 | Integración de correcciones (Hold SOS, SWR polling, PUT/DELETE comunicados) | Alex Trejo |

---

## 7. Anexos y Evidencias Visuales

### Repositorio de GitHub
**Enlace oficial:** [https://github.com/Alex-Trejo/INTER_PROYECTO.git](https://github.com/Alex-Trejo/INTER_PROYECTO.git)

### Evidencias del Código e Interfaces Implementadas

![Documentación interactiva Swagger UI de la API FastAPI (web/13_swagger_api.png)](web/13_swagger_api.png)

![Backend y visualización de mapa de alertas activas (web/15_backend_mapa_alerta.png)](web/15_backend_mapa_alerta.png)

![Panel Web con mapa espacial Leaflet en tiempo real (web/03_mapa.png)](web/03_mapa.png)

![Muro de comunicados comunitarios en la plataforma Web (web/04_avisos_muro.png)](web/04_avisos_muro.png)

![Inicio de sesión bilingüe con Keycloak en el cliente móvil (movil/01_01_login_keycloak.png.jpeg)](movil/01_01_login_keycloak.png.jpeg)

![Pantalla del botón SOS Yanapaway en la aplicación móvil (movil/02_sos.png.jpeg)](movil/02_sos.png.jpeg)

![Muro de comunicados Willaykuna en la aplicación móvil (movil/04_comunicados.png.jpeg)](movil/04_comunicados.png.jpeg)
