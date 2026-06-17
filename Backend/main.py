"""
╔══════════════════════════════════════════════════════════════╗
║               CHASKI ALERT - Backend API                     ║
║       Sistema de Alerta Comunitaria Intercultural            ║
║            FastAPI + PostGIS + Keycloak                       ║
╚══════════════════════════════════════════════════════════════╝

Arquitectura modular:
  core/config.py      → Configuración centralizada (env vars)
  core/security.py    → Integración Keycloak (python-keycloak)
  database/           → Conexión PostGIS
  models/schemas.py   → Modelos Pydantic
  routers/            → Endpoints REST organizados por dominio

Endpoints:
  GET  /api/auth/config     → Config pública de Keycloak (sin auth)
  GET  /api/auth/me         → Datos del usuario autenticado
  POST /api/alertas         → Registrar alerta SOS (CU-04)
  GET  /api/alertas         → Consultar alertas activas (CU-05)
  POST /api/comunicados     → Publicar comunicado [Directiva] (CU-08)
  GET  /api/comunicados     → Leer comunicados del muro (CU-09)
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from database.connection import database
from routers import auth, alertas, comunicados, membresia, sectores, notificaciones, perfil

# ── Aplicación FastAPI ───────────────────────────────────────
app = FastAPI(
    title="Chaski Alert API",
    description="API del Sistema de Alerta Comunitaria Intercultural Andina. "
                "Autenticación via Keycloak. Permite emitir alertas de emergencia "
                "con geolocalización y gestionar comunicados oficiales.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"http://{settings.SERVER_HOST}:3000",   # Next.js dev
        f"http://{settings.SERVER_HOST}:8080",   # Keycloak
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:19006",                 # Expo web
        "http://localhost:8081",                  # Expo dev
        "exp://localhost:19000",                  # Expo Go
        "*",                                      # Dev — restringir en prod
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Eventos de ciclo de vida ─────────────────────────────────
@app.on_event("startup")
async def startup():
    """Conectar a la base de datos al iniciar el servidor."""
    await database.connect()
    print(f"[OK] Conectado a PostGIS: {settings.DATABASE_URL.split('@')[1]}")
    print(f"[OK] Keycloak configurado: {settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}")


@app.on_event("shutdown")
async def shutdown():
    """Desconectar la base de datos al apagar el servidor."""
    await database.disconnect()
    print("[OFF] Desconectado de la base de datos")


# ── Registrar Routers ────────────────────────────────────────
app.include_router(auth.router)
app.include_router(alertas.router)
app.include_router(comunicados.router)
app.include_router(membresia.router)
app.include_router(notificaciones.router)
app.include_router(sectores.router)
app.include_router(perfil.router)


# ── Health Check ─────────────────────────────────────────────
@app.get("/", summary="Estado del servidor", tags=["Sistema"])
async def root():
    """Verifica que el servidor está activo."""
    return {
        "sistema": "Chaski Alert",
        "estado": "✅ Activo / Kawsashka",
        "version": "2.0.0",
        "descripcion": "Sistema de Alerta Comunitaria Intercultural Andina",
        "seguridad": "Keycloak habilitado",
        "keycloak": f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}",
    }


# ── Punto de entrada ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
