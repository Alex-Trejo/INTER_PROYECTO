"""
Chaski Alert — Router de Autenticación.
Endpoints públicos para configuración de Keycloak y datos del usuario.
"""

from fastapi import APIRouter, Depends
from core.config import settings
from core.security import get_current_user
from models.schemas import AuthConfigResponse, UserInfoResponse

router = APIRouter(prefix="/api/auth", tags=["Autenticación / Yaykuy"])


@router.get(
    "/config",
    response_model=AuthConfigResponse,
    summary="Configuración pública de Keycloak",
)
async def get_auth_config():
    """
    Endpoint **público** (sin autenticación).
    Retorna la URL y realm de Keycloak para que los frontends (web y móvil)
    sepan dónde redirigir al usuario para iniciar sesión.
    """
    return AuthConfigResponse(
        keycloak_url=settings.KEYCLOAK_SERVER_URL,
        realm=settings.KEYCLOAK_REALM,
        client_id_web="web-admin",
        client_id_mobile="mobile-app",
    )


@router.get(
    "/me",
    response_model=UserInfoResponse,
    summary="Datos del usuario autenticado",
)
async def get_current_user_info(token_info: dict = Depends(get_current_user)):
    """
    **CU-02: Autenticarse**

    Retorna los datos del usuario autenticado extraídos del token JWT.
    Requiere un token Bearer válido en el header Authorization.
    """
    given = token_info.get("given_name", "")
    family = token_info.get("family_name", "")
    nombre_completo = f"{given} {family}".strip() or token_info.get("preferred_username", "Usuario")

    roles = token_info.get("realm_access", {}).get("roles", [])
    # Filtrar roles internos de Keycloak
    roles_filtrados = [r for r in roles if r not in (
        "offline_access", "uma_authorization", "default-roles-chaski-realm"
    )]

    return UserInfoResponse(
        sub=token_info.get("sub", ""),
        email=token_info.get("email"),
        nombre_completo=nombre_completo,
        roles=roles_filtrados,
    )
