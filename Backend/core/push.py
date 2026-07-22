"""
Chaski Alert — Envío de notificaciones push (Firebase Cloud Messaging).

Resuelve el problema P05 de la evaluación de usabilidad: con la aplicación
cerrada, el comunero no recibía ningún aviso. FCM entrega la notificación
aunque la app no esté abierta y aunque el teléfono esté en reposo (Doze).

El servicio se degrada con elegancia: si no existe la credencial de Firebase,
el sistema sigue funcionando y solo registra los envíos por consola.
"""

import os
from typing import Iterable

import firebase_admin
from firebase_admin import credentials, messaging

from database.connection import database

# Ruta de la clave de cuenta de servicio (fuera del control de versiones)
RUTA_CREDENCIAL = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "firebase-service-account.json",
)

_app_firebase = None


def _log(mensaje: str) -> None:
    """Imprime sin romperse en consolas Windows (cp1252) que no admiten emojis."""
    try:
        print(mensaje)
    except UnicodeEncodeError:
        print(mensaje.encode("ascii", "replace").decode("ascii"))


def inicializar() -> bool:
    """Prepara el SDK de Firebase. Devuelve False si no hay credencial."""
    global _app_firebase

    if _app_firebase is not None:
        return True

    if not os.path.exists(RUTA_CREDENCIAL):
        _log(
            "[PUSH] Sin firebase-service-account.json: las notificaciones "
            "push quedan desactivadas (el resto del sistema no se ve afectado)."
        )
        return False

    try:
        cred = credentials.Certificate(RUTA_CREDENCIAL)
        _app_firebase = firebase_admin.initialize_app(cred)
        _log("[PUSH] Firebase Cloud Messaging inicializado correctamente.")
        return True
    except Exception as e:
        _log(f"[PUSH] No se pudo inicializar Firebase: {e}")
        return False


def disponible() -> bool:
    return _app_firebase is not None


async def _tokens_activos(excluir_keycloak_id: str | None = None) -> list[str]:
    """Tokens de todos los dispositivos activos, opcionalmente sin el emisor."""
    if excluir_keycloak_id:
        query = "SELECT token FROM dispositivos WHERE activo AND keycloak_id <> :kid"
        filas = await database.fetch_all(query=query, values={"kid": excluir_keycloak_id})
    else:
        filas = await database.fetch_all(query="SELECT token FROM dispositivos WHERE activo")
    return [f["token"] for f in filas]


async def _desactivar_tokens(tokens: Iterable[str]) -> None:
    """Marca como inactivos los tokens que FCM rechaza (app desinstalada, etc.)."""
    for t in tokens:
        await database.execute(
            query="UPDATE dispositivos SET activo = FALSE WHERE token = :t",
            values={"t": t},
        )


async def enviar_a_todos(
    titulo: str,
    cuerpo: str,
    datos: dict | None = None,
    excluir_keycloak_id: str | None = None,
) -> dict:
    """
    Envía una notificación a todos los dispositivos registrados.

    Se usa prioridad alta y canal 'emergencias' para que Android la muestre
    aunque el dispositivo esté en modo de ahorro de batería.
    """
    tokens = await _tokens_activos(excluir_keycloak_id)

    if not tokens:
        _log(f"[PUSH] Sin dispositivos registrados. Aviso omitido: {titulo}")
        return {"enviados": 0, "fallidos": 0, "motivo": "sin_dispositivos"}

    if not disponible():
        _log(f"[PUSH SIMULADO] {titulo} - {cuerpo} ({len(tokens)} dispositivos)")
        return {"enviados": 0, "fallidos": 0, "motivo": "firebase_no_configurado"}

    mensaje = messaging.MulticastMessage(
        notification=messaging.Notification(title=titulo, body=cuerpo),
        data={k: str(v) for k, v in (datos or {}).items()},
        tokens=tokens,
        android=messaging.AndroidConfig(
            priority="high",
            notification=messaging.AndroidNotification(
                channel_id="emergencias",
                sound="default",
                color="#0D7377",
                icon="notification_icon",
            ),
        ),
    )

    try:
        respuesta = messaging.send_each_for_multicast(mensaje)
    except Exception as e:
        _log(f"[PUSH] Error enviando la notificacion: {e}")
        return {"enviados": 0, "fallidos": len(tokens), "motivo": str(e)}

    # Retira los tokens que ya no sirven para no reintentar indefinidamente:
    # app desinstalada (Unregistered), otro proyecto (SenderIdMismatch) o
    # token con formato incorrecto (InvalidArgument sobre ese destinatario).
    TOKEN_MUERTO = (
        messaging.UnregisteredError,
        messaging.SenderIdMismatchError,
        messaging.ThirdPartyAuthError,
    )
    invalidos = []
    for i, r in enumerate(respuesta.responses):
        if r.success:
            continue
        exc = r.exception
        es_invalido = isinstance(exc, TOKEN_MUERTO) or (
            exc is not None and "registration token" in str(exc).lower()
        )
        if es_invalido:
            invalidos.append(tokens[i])
        else:
            _log(f"[PUSH] Fallo no recuperable en un destinatario: {exc}")

    if invalidos:
        await _desactivar_tokens(invalidos)
        _log(f"[PUSH] {len(invalidos)} token(s) dados de baja por invalidos.")

    _log(
        f"[PUSH] '{titulo}' -> {respuesta.success_count} entregados, "
        f"{respuesta.failure_count} fallidos."
    )
    return {"enviados": respuesta.success_count, "fallidos": respuesta.failure_count}


async def notificar_alerta_sos(nombre: str, lat: float, lng: float, alerta_id: int,
                               keycloak_id: str | None = None) -> dict:
    """Aviso de emergencia SOS a toda la comunidad."""
    return await enviar_a_todos(
        titulo="🚨 ALERTA SOS / Yanapaway",
        cuerpo=f"{nombre} necesita ayuda urgente. Toca para ver la ubicación.",
        datos={"tipo": "alerta", "id": alerta_id, "lat": lat, "lng": lng},
        excluir_keycloak_id=keycloak_id,
    )


async def notificar_comunicado(titulo: str, mensaje: str, comunicado_id: int) -> dict:
    """Aviso de un nuevo comunicado de la directiva."""
    resumen = mensaje if len(mensaje) <= 120 else mensaje[:117] + "..."
    return await enviar_a_todos(
        titulo=f"📢 {titulo}",
        cuerpo=resumen,
        datos={"tipo": "comunicado", "id": comunicado_id},
    )
