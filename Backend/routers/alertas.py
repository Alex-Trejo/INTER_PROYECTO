"""
Chaski Alert — Router de Alertas de Emergencia.
Endpoints protegidos para emitir y consultar alertas SOS.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from database.connection import database
from core.security import get_current_user, require_role
from models.schemas import AlertaCreate, AlertaResponse, AlertaEstadoUpdate
from core.config import settings
from core import push
import httpx

router = APIRouter(prefix="/api/alertas", tags=["Alertas / Yanapaway"])


async def notificar_telegram_background(lat: float, lng: float, usuario_nombre: str):
    """Tarea en segundo plano para enviar la alerta a Telegram."""
    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_ids_str = settings.TELEGRAM_CHAT_ID
    
    mensaje = (
        f"🚨 *ALERTA CHASKI SOS* 🚨\n\n"
        f"👤 *Comunero:* {usuario_nombre}\n"
        f"📍 *Ubicación:* [Ver en Google Maps](https://maps.google.com/?q={lat},{lng})\n"
        f"⚠️ *Atención inmediata requerida (Yanapaway)*"
    )

    if not bot_token or not chat_ids_str:
        print(f"[SIMULACIÓN TELEGRAM] Mensaje: \n{mensaje}")
        return

    chat_ids = [cid.strip() for cid in str(chat_ids_str).split(",") if cid.strip()]
    telegram_api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    async with httpx.AsyncClient() as client:
        for chat_id in chat_ids:
            try:
                await client.post(
                    telegram_api_url,
                    json={"chat_id": chat_id, "text": mensaje, "parse_mode": "Markdown"}
                )
            except Exception as e:
                print(f"Error enviando telegram al chat {chat_id}: {e}")

@router.post(
    "",
    response_model=AlertaResponse,
    status_code=201,
    summary="Emitir Alerta de Emergencia",
)
async def crear_alerta(
    alerta: AlertaCreate, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    **CU-04: Emitir Alerta de Emergencia**

    Registra una nueva alerta SOS con coordenadas GPS del dispositivo.
    Las coordenadas se almacenan como geometría PostGIS (SRID 4326).

    > **Nota:** Este endpoint se mantiene público temporalmente para
    > compatibilidad con la app móvil durante la transición a auth.
    > En FASE 2 se protegerá con token JWT.

    - **lat**: Latitud del dispositivo (-90 a 90)
    - **lng**: Longitud del dispositivo (-180 a 180)
    - **usuario_nombre**: Nombre opcional del usuario
    """
    query = """
        INSERT INTO alertas (usuario_nombre, coordenadas, estado_incidencia, fecha_emision)
        VALUES (
            :usuario_nombre,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326),
            'ACTIVA',
            NOW() AT TIME ZONE 'America/Guayaquil'
        )
        RETURNING id, usuario_nombre,
                  ST_X(coordenadas) as lng,
                  ST_Y(coordenadas) as lat,
                  estado_incidencia,
                  fecha_emision as fecha_hora
    """
    try:
        # Extraer el nombre real desde Keycloak
        nombre_real = f"{current_user.get('given_name', '')} {current_user.get('family_name', '')}".strip()
        if not nombre_real:
            nombre_real = current_user.get("preferred_username", "Comunero")
            
        row = await database.fetch_one(
            query=query,
            values={
                "usuario_nombre": nombre_real,
                "lng": alerta.lng,
                "lat": alerta.lat,
            },
        )
        # Delegar la llamada a Telegram en segundo plano para no bloquear al usuario
        background_tasks.add_task(notificar_telegram_background, alerta.lat, alerta.lng, nombre_real)

        # Notificacion push a la comunidad: llega aunque la app este cerrada (P05).
        # Se excluye al propio emisor, que ya ve la confirmacion en su pantalla.
        background_tasks.add_task(
            push.notificar_alerta_sos,
            nombre_real,
            alerta.lat,
            alerta.lng,
            row["id"],
            current_user.get("sub"),
        )

        return AlertaResponse(
            id=row["id"],
            lat=row["lat"],
            lng=row["lng"],
            usuario_nombre=row["usuario_nombre"],
            estado_incidencia=row["estado_incidencia"],
            fecha_hora=row["fecha_hora"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar alerta: {str(e)}")


@router.get(
    "/historial",
    response_model=list[AlertaResponse],
    summary="Consultar Historial de Alertas",
)
async def obtener_historial_alertas():
    """
    **CU-05: Consultar Historial de Incidencias**
    
    Retorna TODAS las alertas de la base de datos (ACTIVAS, RESUELTAS, FALSAS ALARMAS)
    ordenadas por fecha descendente para la trazabilidad en el panel web.
    """
    query = """
        SELECT id, usuario_nombre,
               ST_X(coordenadas) as lng,
               ST_Y(coordenadas) as lat,
               estado_incidencia,
               fecha_emision as fecha_hora
        FROM alertas
        ORDER BY fecha_emision DESC
    """
    try:
        rows = await database.fetch_all(query=query)
        return [
            AlertaResponse(
                id=row["id"],
                lat=row["lat"],
                lng=row["lng"],
                usuario_nombre=row["usuario_nombre"],
                estado_incidencia=row["estado_incidencia"],
                fecha_hora=row["fecha_hora"],
            )
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener historial de alertas: {str(e)}")


@router.get(
    "",
    response_model=list[AlertaResponse],
    summary="Consultar Alertas para Mapa",
)
async def obtener_alertas():
    """
    **CU-05: Consultar Mapa de Incidencias**

    Retorna las alertas ACTIVAS con sus coordenadas para el mapa de monitoreo.
    Solo se muestran alertas con estado 'ACTIVA' (las resueltas/falsas alarmas se ocultan).

    > **Nota:** Endpoint público para compatibilidad con el polling del mapa web.
    """
    query = """
        SELECT id, usuario_nombre,
               ST_X(coordenadas) as lng,
               ST_Y(coordenadas) as lat,
               estado_incidencia,
               fecha_emision as fecha_hora
        FROM alertas
        WHERE estado_incidencia = 'ACTIVA'
        ORDER BY fecha_emision DESC
    """
    try:
        rows = await database.fetch_all(query=query)
        return [
            AlertaResponse(
                id=row["id"],
                lat=row["lat"],
                lng=row["lng"],
                usuario_nombre=row["usuario_nombre"],
                estado_incidencia=row["estado_incidencia"],
                fecha_hora=row["fecha_hora"],
            )
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener alertas: {str(e)}")

@router.put(
    "/{alerta_id}/estado",
    response_model=dict,
    summary="Actualizar Estado de Alerta",
    dependencies=[Depends(require_role("Directiva"))]
)
async def actualizar_estado_alerta(alerta_id: int, payload: AlertaEstadoUpdate):
    """
    **CU-06: Atender Incidencia**
    
    Permite a la Directiva cambiar el estado de una alerta activa.
    Estados válidos: 'RESUELTA' o 'FALSA_ALARMA'.
    Al actualizar, se registra la fecha de resolución.
    """
    # Verificar que la alerta existe y está ACTIVA
    check_query = "SELECT estado_incidencia FROM alertas WHERE id = :id"
    row = await database.fetch_one(query=check_query, values={"id": alerta_id})
    if not row:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    if row["estado_incidencia"] != "ACTIVA":
        raise HTTPException(status_code=400, detail="La alerta ya no está activa")

    # Actualizar estado
    update_query = """
        UPDATE alertas 
        SET estado_incidencia = :estado,
            fecha_resolucion = NOW() AT TIME ZONE 'America/Guayaquil'
        WHERE id = :id
    """
    try:
        await database.execute(query=update_query, values={
            "estado": payload.estado,
            "id": alerta_id
        })
        return {"mensaje": f"Alerta marcada como {payload.estado}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar la alerta: {str(e)}")
