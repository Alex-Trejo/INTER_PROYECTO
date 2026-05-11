"""
╔══════════════════════════════════════════════════════════════╗
║               CHASKI ALERT - Backend API                     ║
║       Sistema de Alerta Comunitaria Intercultural            ║
║                  FastAPI + PostGIS                            ║
╚══════════════════════════════════════════════════════════════╝

Endpoints:
  POST /api/alertas      → Registrar alerta de emergencia (CU-04)
  GET  /api/alertas      → Consultar alertas para mapa (CU-05)
  POST /api/comunicados  → Publicar comunicado oficial (CU-08)
  GET  /api/comunicados  → Leer comunicados (CU-09)
"""

import os
from datetime import datetime, timezone, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import databases
import asyncpg

# ── Cargar variables de entorno ──────────────────────────────
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password123@localhost:5432/chaski_alerta")

# ── Conexión a la base de datos ──────────────────────────────
database = databases.Database(DATABASE_URL)

# ── Aplicación FastAPI ───────────────────────────────────────
app = FastAPI(
    title="Chaski Alert API",
    description="API del Sistema de Alerta Comunitaria Intercultural Andina. "
                "Permite emitir alertas de emergencia con geolocalización y "
                "gestionar comunicados oficiales de la directiva comunal.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost:19006",    # Expo web
        "http://localhost:8081",     # Expo dev
        "exp://localhost:19000",     # Expo Go
        "*",                         # Para desarrollo - restringir en producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════
# MODELOS PYDANTIC (Validación de datos)
# ══════════════════════════════════════════════════════════════

class AlertaCreate(BaseModel):
    """Datos para crear una alerta de emergencia."""
    lat: float = Field(..., ge=-90, le=90, description="Latitud GPS")
    lng: float = Field(..., ge=-180, le=180, description="Longitud GPS")
    usuario_nombre: Optional[str] = Field(
        default="Vecino Anónimo",
        max_length=100,
        description="Nombre del usuario que emite la alerta"
    )

class AlertaResponse(BaseModel):
    """Respuesta de una alerta registrada."""
    id: int
    lat: float
    lng: float
    usuario_nombre: str
    fecha_hora: datetime

class ComunicadoCreate(BaseModel):
    """Datos para crear un comunicado oficial."""
    titulo: str = Field(..., min_length=1, max_length=200, description="Título del comunicado")
    mensaje: str = Field(..., min_length=1, description="Contenido del comunicado")
    autor: Optional[str] = Field(
        default="Directiva Comunal",
        max_length=100,
        description="Autor del comunicado"
    )

class ComunicadoResponse(BaseModel):
    """Respuesta de un comunicado."""
    id: int
    titulo: str
    mensaje: str
    autor: str
    fecha_publicacion: datetime


# ══════════════════════════════════════════════════════════════
# EVENTOS DE CICLO DE VIDA
# ══════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup():
    """Conectar a la base de datos al iniciar el servidor."""
    await database.connect()
    print("[OK] Conectado a la base de datos PostGIS")

@app.on_event("shutdown")
async def shutdown():
    """Desconectar la base de datos al apagar el servidor."""
    await database.disconnect()
    print("[OFF] Desconectado de la base de datos")


# ══════════════════════════════════════════════════════════════
# ENDPOINTS - ALERTAS (CU-04 y CU-05)
# ══════════════════════════════════════════════════════════════

@app.post("/api/alertas", response_model=AlertaResponse, status_code=201,
          summary="Emitir Alerta de Emergencia",
          tags=["Alertas / Yanapaway"])
async def crear_alerta(alerta: AlertaCreate):
    """
    **CU-04: Emitir Alerta de Emergencia**

    Registra una nueva alerta SOS con coordenadas GPS del dispositivo.
    Las coordenadas se almacenan como geometría PostGIS (SRID 4326).

    - **lat**: Latitud del dispositivo (-90 a 90)
    - **lng**: Longitud del dispositivo (-180 a 180)
    - **usuario_nombre**: Nombre opcional del usuario
    """
    query = """
        INSERT INTO alertas (usuario_nombre, coordenadas, fecha_hora)
        VALUES (:usuario_nombre, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), NOW() AT TIME ZONE 'America/Guayaquil')
        RETURNING id, usuario_nombre, 
                  ST_X(coordenadas) as lng, 
                  ST_Y(coordenadas) as lat,
                  fecha_hora
    """
    try:
        row = await database.fetch_one(
            query=query,
            values={
                "usuario_nombre": alerta.usuario_nombre or "Vecino Anónimo",
                "lng": alerta.lng,
                "lat": alerta.lat,
            }
        )
        return AlertaResponse(
            id=row["id"],
            lat=row["lat"],
            lng=row["lng"],
            usuario_nombre=row["usuario_nombre"],
            fecha_hora=row["fecha_hora"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar alerta: {str(e)}")


@app.get("/api/alertas", response_model=list[AlertaResponse],
         summary="Consultar Alertas para Mapa",
         tags=["Alertas / Yanapaway"])
async def obtener_alertas():
    """
    **CU-05: Consultar Mapa de Incidencias**

    Retorna todas las alertas registradas con sus coordenadas
    para ser representadas en el mapa de monitoreo.
    """
    query = """
        SELECT id, usuario_nombre,
               ST_X(coordenadas) as lng,
               ST_Y(coordenadas) as lat,
               fecha_hora
        FROM alertas
        ORDER BY fecha_hora DESC
    """
    try:
        rows = await database.fetch_all(query=query)
        return [
            AlertaResponse(
                id=row["id"],
                lat=row["lat"],
                lng=row["lng"],
                usuario_nombre=row["usuario_nombre"],
                fecha_hora=row["fecha_hora"],
            )
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener alertas: {str(e)}")


# ══════════════════════════════════════════════════════════════
# ENDPOINTS - COMUNICADOS (CU-08 y CU-09)
# ══════════════════════════════════════════════════════════════

@app.post("/api/comunicados", response_model=ComunicadoResponse, status_code=201,
          summary="Publicar Comunicado Oficial",
          tags=["Comunicados / Willaykuna"])
async def crear_comunicado(comunicado: ComunicadoCreate):
    """
    **CU-08: Publicar Comunicado Oficial**

    La directiva comunal publica un nuevo aviso o comunicado
    que será visible para todos los comuneros en el muro.

    - **titulo**: Título del comunicado
    - **mensaje**: Contenido completo del aviso
    - **autor**: Autor opcional (default: "Directiva Comunal")
    """
    query = """
        INSERT INTO comunicados (titulo, mensaje, autor, fecha_publicacion)
        VALUES (:titulo, :mensaje, :autor, NOW() AT TIME ZONE 'America/Guayaquil')
        RETURNING id, titulo, mensaje, autor, fecha_publicacion
    """
    try:
        row = await database.fetch_one(
            query=query,
            values={
                "titulo": comunicado.titulo,
                "mensaje": comunicado.mensaje,
                "autor": comunicado.autor or "Directiva Comunal",
            }
        )
        return ComunicadoResponse(
            id=row["id"],
            titulo=row["titulo"],
            mensaje=row["mensaje"],
            autor=row["autor"],
            fecha_publicacion=row["fecha_publicacion"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear comunicado: {str(e)}")


@app.get("/api/comunicados", response_model=list[ComunicadoResponse],
         summary="Leer Comunicados del Muro",
         tags=["Comunicados / Willaykuna"])
async def obtener_comunicados():
    """
    **CU-09: Leer Comunicados Oficiales**

    Retorna todos los comunicados publicados, ordenados del
    más reciente al más antiguo, para el muro de avisos.
    """
    query = """
        SELECT id, titulo, mensaje, autor, fecha_publicacion
        FROM comunicados
        ORDER BY fecha_publicacion DESC
    """
    try:
        rows = await database.fetch_all(query=query)
        return [
            ComunicadoResponse(
                id=row["id"],
                titulo=row["titulo"],
                mensaje=row["mensaje"],
                autor=row["autor"],
                fecha_publicacion=row["fecha_publicacion"],
            )
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener comunicados: {str(e)}")


# ══════════════════════════════════════════════════════════════
# ENDPOINT RAÍZ (Health Check)
# ══════════════════════════════════════════════════════════════

@app.get("/", summary="Estado del servidor", tags=["Sistema"])
async def root():
    """Verifica que el servidor está activo."""
    return {
        "sistema": "Chaski Alert",
        "estado": "✅ Activo / Kawsashka",
        "version": "1.0.0",
        "descripcion": "Sistema de Alerta Comunitaria Intercultural Andina"
    }


# ══════════════════════════════════════════════════════════════
# PUNTO DE ENTRADA
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
