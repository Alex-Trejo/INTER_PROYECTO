"""
Chaski Alert — Registro de dispositivos para notificaciones push.

La aplicación móvil envía aquí su token de Firebase (FCM) tras iniciar
sesión, para poder recibir alertas SOS y comunicados con la app cerrada.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.security import get_current_user
from database.connection import database

router = APIRouter(prefix="/api/dispositivos", tags=["Dispositivos / Push"])


class TokenRegistro(BaseModel):
    token: str = Field(..., min_length=10, description="Token FCM del dispositivo")
    plataforma: str = Field(default="android", max_length=20)


@router.post("/token", status_code=200, summary="Registrar dispositivo para notificaciones")
async def registrar_token(
    datos: TokenRegistro,
    current_user: dict = Depends(get_current_user),
):
    """
    Guarda (o actualiza) el token de notificaciones del dispositivo.

    Es idempotente: si el mismo token vuelve a enviarse solo se refresca la
    fecha; si el teléfono cambia de dueño, el token se reasigna al nuevo usuario.
    """
    keycloak_id = current_user.get("sub")
    if not keycloak_id:
        raise HTTPException(status_code=401, detail="Token de sesión inválido.")

    nombre = f"{current_user.get('given_name','')} {current_user.get('family_name','')}".strip()
    nombre = nombre or current_user.get("preferred_username", "Comunero")

    query = """
        INSERT INTO dispositivos (keycloak_id, token, plataforma, nombre_usuario)
        VALUES (:kid, :token, :plataforma, :nombre)
        ON CONFLICT (token) DO UPDATE
            SET keycloak_id     = EXCLUDED.keycloak_id,
                nombre_usuario  = EXCLUDED.nombre_usuario,
                plataforma      = EXCLUDED.plataforma,
                activo          = TRUE,
                ultima_conexion = NOW() AT TIME ZONE 'America/Guayaquil'
        RETURNING id
    """
    try:
        fila = await database.fetch_one(
            query=query,
            values={
                "kid": keycloak_id,
                "token": datos.token,
                "plataforma": datos.plataforma,
                "nombre": nombre,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registrando el dispositivo: {e}")

    return {"mensaje": "Dispositivo registrado / Alli willay", "id": fila["id"]}


@router.delete("/token", status_code=200, summary="Dar de baja el dispositivo")
async def eliminar_token(
    datos: TokenRegistro,
    current_user: dict = Depends(get_current_user),
):
    """Desactiva el token al cerrar sesión, para no seguir notificando el teléfono."""
    await database.execute(
        query="UPDATE dispositivos SET activo = FALSE WHERE token = :token",
        values={"token": datos.token},
    )
    return {"mensaje": "Dispositivo dado de baja"}
