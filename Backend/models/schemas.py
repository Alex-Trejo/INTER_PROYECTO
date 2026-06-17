"""
Chaski Alert — Modelos Pydantic (esquemas de validación).
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


# ══════════════════════════════════════════════════════════════
# ALERTAS (CU-04 / CU-05 / CU-06)
# ══════════════════════════════════════════════════════════════

class AlertaCreate(BaseModel):
    """Datos para crear una alerta de emergencia."""
    lat: float = Field(..., ge=-90, le=90, description="Latitud GPS")
    lng: float = Field(..., ge=-180, le=180, description="Longitud GPS")
    usuario_nombre: Optional[str] = Field(
        default="Vecino Anónimo",
        max_length=100,
        description="Nombre del usuario que emite la alerta",
    )


class AlertaResponse(BaseModel):
    """Respuesta de una alerta registrada."""
    id: int
    lat: float
    lng: float
    usuario_nombre: str
    estado_incidencia: str = "ACTIVA"
    fecha_hora: datetime


class AlertaEstadoUpdate(BaseModel):
    """Actualización del estado de una alerta (CU-06)."""
    estado: Literal["RESUELTA", "FALSA_ALARMA"] = Field(
        ..., description="Nuevo estado de la incidencia"
    )


# ══════════════════════════════════════════════════════════════
# COMUNICADOS (CU-08 / CU-09)
# ══════════════════════════════════════════════════════════════

class ComunicadoCreate(BaseModel):
    """Datos para crear un comunicado oficial."""
    titulo: str = Field(..., min_length=1, max_length=200, description="Título del comunicado")
    mensaje: str = Field(..., min_length=1, description="Contenido del comunicado")
    autor: Optional[str] = Field(
        default="Directiva Comunal",
        max_length=100,
        description="Autor del comunicado",
    )


class ComunicadoResponse(BaseModel):
    """Respuesta de un comunicado."""
    id: int
    titulo: str
    mensaje: str
    autor: str
    fecha_publicacion: datetime


# ══════════════════════════════════════════════════════════════
# AUTENTICACIÓN / USUARIOS
# ══════════════════════════════════════════════════════════════

class AuthConfigResponse(BaseModel):
    """Configuración pública de Keycloak para frontends."""
    keycloak_url: str
    realm: str
    client_id_web: str = "web-admin"
    client_id_mobile: str = "mobile-app"


class UserInfoResponse(BaseModel):
    """Información del usuario autenticado (desde JWT)."""
    sub: str
    email: Optional[str] = None
    nombre_completo: str
    roles: list[str] = []


# ══════════════════════════════════════════════════════════════
# MEMBRESÍA (CU-01 / CU-07) — Se usará en FASE 2
# ══════════════════════════════════════════════════════════════

class UsuarioPendiente(BaseModel):
    """Usuario pendiente de aprobación."""
    keycloak_id: str
    email: str
    nombres: str
    cedula: str
    telefono: Optional[str] = None
    sector: Optional[str] = None
    estado_membresia: str = "PENDIENTE"
    fecha_registro: Optional[datetime] = None


class MembresiaAction(BaseModel):
    """Acción sobre la membresía de un usuario."""
    accion: Literal["APROBAR", "RECHAZAR"]
    cedula: Optional[str] = Field(None, description="Cédula del usuario")
    telefono: Optional[str] = Field(None, description="Teléfono del usuario")
    id_sector: Optional[int] = Field(None, description="Sector a asignar al aprobar")
    nombre_sector: Optional[str] = Field(None, description="Nombre del sector para Keycloak")
