"""
Chaski Alert — Seguridad y Autenticación con Keycloak.
Usa python-keycloak para validación de tokens JWT y Admin API.
"""


from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from keycloak import KeycloakOpenID, KeycloakAdmin
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError

from core.config import settings

# ══════════════════════════════════════════════════════════════
# Esquema de seguridad HTTP Bearer para Swagger/OpenAPI
# ══════════════════════════════════════════════════════════════

security_scheme = HTTPBearer(
    scheme_name="Bearer JWT",
    description="Token JWT obtenido de Keycloak. Usar el flujo de login para obtenerlo."
)

# ══════════════════════════════════════════════════════════════
# Cliente Keycloak OpenID (validación de tokens)
# ══════════════════════════════════════════════════════════════

keycloak_openid = KeycloakOpenID(
    server_url=f"{settings.KEYCLOAK_SERVER_URL}/",
    client_id=settings.KEYCLOAK_CLIENT_ID,
    realm_name=settings.KEYCLOAK_REALM,
    client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
)


def get_keycloak_admin() -> KeycloakAdmin:
    """
    Crea una instancia de KeycloakAdmin para operaciones administrativas.
    Se crea por cada llamada para garantizar un token admin fresco.
    """
    return KeycloakAdmin(
        server_url=f"{settings.KEYCLOAK_SERVER_URL}/",
        username=settings.KEYCLOAK_ADMIN_USER,
        password=settings.KEYCLOAK_ADMIN_PASSWORD,
        realm_name=settings.KEYCLOAK_REALM,
        user_realm_name="master",
        verify=True,
    )


# ══════════════════════════════════════════════════════════════
# Dependencias FastAPI para autenticación y autorización
# ══════════════════════════════════════════════════════════════

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """
    Dependencia FastAPI: extrae y valida el token JWT del header Authorization.
    Usa python-keycloak (jwcrypto) para validación completa del JWT
    contra las claves públicas JWKS del realm de Keycloak.
    Retorna el payload decodificado del token con info del usuario y roles.
    """
    token = credentials.credentials
    try:
        # python-keycloak v4.x maneja JWKS internamente via jwcrypto
        token_info = keycloak_openid.decode_token(token, validate=True)
        return token_info
    except KeycloakAuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token JWT inválido o expirado. Inicie sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error de autenticación: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(required_role: str):
    """
    Fábrica de dependencias: valida que el usuario autenticado tenga un rol específico.
    Uso: Depends(require_role("Directiva"))
    """
    async def role_checker(
        token_info: dict = Depends(get_current_user),
    ) -> dict:
        roles = token_info.get("realm_access", {}).get("roles", [])
        if required_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere el rol '{required_role}' / Mana chaski.",
            )
        return token_info
    return role_checker
