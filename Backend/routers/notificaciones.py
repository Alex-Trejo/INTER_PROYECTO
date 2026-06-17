import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from core.security import get_current_user
from core.config import settings

router = APIRouter(prefix="/api/notificaciones", tags=["Notificaciones (Telegram)"])

class AlertaPayload(BaseModel):
    lat: float
    lng: float

@router.post("/alerta")
async def enviar_alerta_telegram(payload: AlertaPayload, current_user: dict = Depends(get_current_user)):
    """
    Envía un mensaje de emergencia a la directiva utilizando un Bot de Telegram.
    Requiere TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en .env.
    """
    bot_token = settings.TELEGRAM_BOT_TOKEN or os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = settings.TELEGRAM_CHAT_ID or os.getenv("TELEGRAM_CHAT_ID")

    # Extraer el nombre de quien envía la alerta desde el token JWT
    nombre_usuario = f"{current_user.get('given_name', '')} {current_user.get('family_name', '')}".strip()
    if not nombre_usuario:
        nombre_usuario = current_user.get("preferred_username", "Un Comunero")

    mensaje = (
        f"🚨 *ALERTA CHASKI SOS* 🚨\n\n"
        f"👤 *Comunero:* {nombre_usuario}\n"
        f"📍 *Ubicación:* [Ver en Google Maps](https://maps.google.com/?q={payload.lat},{payload.lng})\n"
        f"⚠️ *Atención inmediata requerida (Yanapaway)*"
    )

    if not bot_token or not chat_id:
        print(f"[SIMULACIÓN TELEGRAM] Enviando mensaje a CHAT_ID '{chat_id}': \n{mensaje}")
        return {"status": "success", "message": "Telegram simulado con éxito (Credenciales no configuradas)"}

    telegram_api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                telegram_api_url,
                json={
                    "chat_id": chat_id,
                    "text": mensaje,
                    "parse_mode": "Markdown"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error en Telegram API: {response.text}"
                )
            
            return {"status": "success", "message": "Alerta enviada por Telegram exitosamente"}
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión con Telegram: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")
