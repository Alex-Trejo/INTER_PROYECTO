"""
Chaski Alert — Router de Comunicados Oficiales.
POST protegido por rol 'Directiva'. GET público para el muro.
"""

from fastapi import APIRouter, HTTPException, Depends
from database.connection import database
from core.security import get_current_user, require_role
from models.schemas import ComunicadoCreate, ComunicadoResponse

router = APIRouter(prefix="/api/comunicados", tags=["Comunicados / Willaykuna"])


@router.post(
    "",
    response_model=ComunicadoResponse,
    status_code=201,
    summary="Publicar Comunicado Oficial",
)
async def crear_comunicado(
    comunicado: ComunicadoCreate,
    token_info: dict = Depends(require_role("Directiva")),
):
    """
    **CU-08: Publicar Comunicado Oficial**

    La directiva comunal publica un nuevo aviso o comunicado
    que será visible para todos los comuneros en el muro.

    **Requiere rol: Directiva** 🔒

    El nombre del autor se extrae automáticamente del token JWT.
    """
    # Extraer nombre del autor desde el token JWT
    given = token_info.get("given_name", "")
    family = token_info.get("family_name", "")
    autor_verificado = f"{given} {family}".strip() or comunicado.autor or "Directiva Comunal"

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
                "autor": autor_verificado,
            },
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


@router.get(
    "",
    response_model=list[ComunicadoResponse],
    summary="Leer Comunicados del Muro",
)
async def obtener_comunicados():
    """
    **CU-09: Leer Comunicados Oficiales**

    Retorna todos los comunicados publicados, ordenados del
    más reciente al más antiguo, para el muro de avisos.

    > **Nota:** Endpoint público para la app móvil y panel web.
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
