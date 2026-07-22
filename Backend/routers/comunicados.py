"""
Chaski Alert — Router de Comunicados Oficiales.
POST protegido por rol 'Directiva'. GET público para el muro.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from database.connection import database
from core.security import get_current_user, require_role
from core import push
from models.schemas import ComunicadoCreate, ComunicadoResponse, ComunicadoUpdate

router = APIRouter(prefix="/api/comunicados", tags=["Comunicados / Willaykuna"])


@router.post(
    "",
    response_model=ComunicadoResponse,
    status_code=201,
    summary="Publicar Comunicado Oficial",
)
async def crear_comunicado(
    comunicado: ComunicadoCreate,
    background_tasks: BackgroundTasks,
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
        # Notificacion push: el aviso llega aunque el comunero tenga la app cerrada (P05)
        background_tasks.add_task(
            push.notificar_comunicado, row["titulo"], row["mensaje"], row["id"]
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


@router.put(
    "/{comunicado_id}",
    response_model=ComunicadoResponse,
    summary="Corregir Comunicado Publicado",
)
async def actualizar_comunicado(
    comunicado_id: int,
    comunicado: ComunicadoUpdate,
    token_info: dict = Depends(require_role("Directiva")),
):
    """
    Corrige el título o el mensaje de un comunicado ya publicado.

    **Requiere rol: Directiva** 🔒
    """
    query = """
        UPDATE comunicados
        SET titulo = :titulo, mensaje = :mensaje
        WHERE id = :id
        RETURNING id, titulo, mensaje, autor, fecha_publicacion
    """
    try:
        row = await database.fetch_one(
            query=query,
            values={
                "id": comunicado_id,
                "titulo": comunicado.titulo,
                "mensaje": comunicado.mensaje,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar comunicado: {str(e)}")

    if row is None:
        raise HTTPException(status_code=404, detail="Comunicado no encontrado / Mana tarishka.")

    return ComunicadoResponse(
        id=row["id"],
        titulo=row["titulo"],
        mensaje=row["mensaje"],
        autor=row["autor"],
        fecha_publicacion=row["fecha_publicacion"],
    )


@router.delete(
    "/{comunicado_id}",
    status_code=200,
    summary="Retirar Comunicado del Muro",
)
async def eliminar_comunicado(
    comunicado_id: int,
    token_info: dict = Depends(require_role("Directiva")),
):
    """
    Retira del muro un comunicado publicado por error.

    **Requiere rol: Directiva** 🔒
    """
    query = "DELETE FROM comunicados WHERE id = :id RETURNING id"
    try:
        row = await database.fetch_one(query=query, values={"id": comunicado_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar comunicado: {str(e)}")

    if row is None:
        raise HTTPException(status_code=404, detail="Comunicado no encontrado / Mana tarishka.")

    return {"mensaje": "Comunicado retirado del muro", "id": row["id"]}
