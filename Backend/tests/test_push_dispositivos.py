"""
Pruebas del subsistema de notificaciones push (problema P05).

No se contacta con Firebase: se comprueba la lógica propia, que es donde
estuvieron los errores reales durante el desarrollo.
"""

import pytest
from pydantic import ValidationError

from routers.dispositivos import TokenRegistro
from core import push


# ── Registro del dispositivo ───────────────────────────────────

def test_acepta_un_token_fcm_realista():
    """Formato parecido al token que emite Firebase en Android."""
    t = TokenRegistro(token="dYGnk9EsQ9eIjYAq5yTOKENdeprueba1234567890")
    assert t.plataforma == "android"


def test_rechaza_token_demasiado_corto():
    """Un token de pocos caracteres es un error de programacion, no un token."""
    with pytest.raises(ValidationError):
        TokenRegistro(token="abc")


def test_token_es_obligatorio():
    with pytest.raises(ValidationError):
        TokenRegistro(plataforma="android")


def test_plataforma_se_puede_especificar():
    t = TokenRegistro(token="token_de_prueba_suficientemente_largo", plataforma="ios")
    assert t.plataforma == "ios"


# ── Registro seguro en consola ─────────────────────────────────
# El envio real llego a fallar porque los titulos llevan emoji (🚨 / 📢) y la
# consola de Windows usa cp1252: el print lanzaba UnicodeEncodeError y tumbaba
# la tarea en segundo plano. La notificacion ya habia salido, pero el error
# hacia creer que no.

def test_el_log_no_falla_con_emojis(capsys):
    push._log("[PUSH] 📢 Comunicado con emoji")
    salida = capsys.readouterr().out
    assert "[PUSH]" in salida


def test_el_log_no_falla_con_consola_cp1252(monkeypatch):
    """Simula una consola que no admite emojis y comprueba que no revienta."""
    llamadas = []

    def print_que_rechaza_emojis(texto, *a, **k):
        texto.encode("cp1252")   # lanza UnicodeEncodeError con emoji
        llamadas.append(texto)

    monkeypatch.setattr("builtins.print", print_que_rechaza_emojis)
    push._log("[PUSH] 🚨 ALERTA SOS / Yanapaway")   # no debe propagar excepcion

    assert llamadas, "el mensaje debio escribirse en su version sin emojis"
    assert "?" in llamadas[-1]


def test_el_log_conserva_el_texto_sin_emojis(capsys):
    push._log("[PUSH] Firebase inicializado")
    assert "Firebase inicializado" in capsys.readouterr().out


# ── Estado del servicio ────────────────────────────────────────

def test_disponible_es_booleano():
    assert isinstance(push.disponible(), bool)


def test_la_ruta_de_la_credencial_apunta_al_backend():
    """La clave vive fuera del control de versiones, junto al backend."""
    assert push.RUTA_CREDENCIAL.endswith("firebase-service-account.json")


def test_existen_las_funciones_de_notificacion():
    """Contrato publico que consumen los routers de alertas y comunicados."""
    assert callable(push.notificar_alerta_sos)
    assert callable(push.notificar_comunicado)
    assert callable(push.enviar_a_todos)


@pytest.mark.asyncio
async def test_sin_dispositivos_registrados_no_intenta_enviar(monkeypatch):
    """Si nadie tiene la app instalada, el envio se omite sin error."""
    async def sin_tokens(excluir_keycloak_id=None):
        return []

    monkeypatch.setattr(push, "_tokens_activos", sin_tokens)
    resultado = await push.enviar_a_todos("Titulo", "Cuerpo")

    assert resultado["enviados"] == 0
    assert resultado["motivo"] == "sin_dispositivos"


@pytest.mark.asyncio
async def test_sin_firebase_configurado_no_rompe_el_sistema(monkeypatch):
    """Sin credencial, el aviso se simula y la app sigue operativa."""
    async def con_un_token(excluir_keycloak_id=None):
        return ["token_de_prueba_largo_1234567890"]

    monkeypatch.setattr(push, "_tokens_activos", con_un_token)
    monkeypatch.setattr(push, "disponible", lambda: False)
    resultado = await push.enviar_a_todos("Titulo", "Cuerpo")

    assert resultado["motivo"] == "firebase_no_configurado"
