"""
Pruebas de la validación de comunicados.

Cubren el problema P02 de la evaluación de usabilidad: "Se publican comunicados
triviales sin confirmación previa". El muro llegó a acumular avisos como 'aq',
'ss' o 'test' que se enviaban a toda la comunidad. Estas pruebas garantizan que
esa basura no pueda volver a entrar.
"""

import pytest
from pydantic import ValidationError

from models.schemas import ComunicadoCreate, ComunicadoUpdate

MENSAJE_VALIDO = "Se convoca a la minga del sabado a las 7 de la manana."


# ── Rechazo de contenido trivial (P02) ─────────────────────────

@pytest.mark.parametrize("titulo_basura", ["aq", "ss", "test", "eee", "a"])
def test_rechaza_titulos_basura_reales(titulo_basura):
    """Los títulos que contaminaron el muro real deben ser rechazados."""
    with pytest.raises(ValidationError):
        ComunicadoCreate(titulo=titulo_basura, mensaje=MENSAJE_VALIDO)


def test_rechaza_mensaje_demasiado_corto():
    """Un mensaje de menos de 10 caracteres no aporta información util."""
    with pytest.raises(ValidationError) as error:
        ComunicadoCreate(titulo="Asamblea general", mensaje="ok")
    assert "mensaje" in str(error.value)


def test_titulo_de_exactamente_5_caracteres_es_valido():
    """El limite inferior es inclusivo: 5 caracteres deben pasar."""
    c = ComunicadoCreate(titulo="Minga", mensaje=MENSAJE_VALIDO)
    assert c.titulo == "Minga"


def test_titulo_de_4_caracteres_es_rechazado():
    """Un caracter por debajo del limite debe fallar."""
    with pytest.raises(ValidationError):
        ComunicadoCreate(titulo="Ming", mensaje=MENSAJE_VALIDO)


def test_mensaje_de_exactamente_10_caracteres_es_valido():
    c = ComunicadoCreate(titulo="Aviso importante", mensaje="1234567890")
    assert len(c.mensaje) == 10


def test_rechaza_titulo_mas_largo_que_200():
    """Evita que un titulo desmedido rompa la maquetacion de las tarjetas."""
    with pytest.raises(ValidationError):
        ComunicadoCreate(titulo="A" * 201, mensaje=MENSAJE_VALIDO)


# ── Comportamiento normal ──────────────────────────────────────

def test_acepta_comunicado_realista():
    c = ComunicadoCreate(
        titulo="Corte de agua / Yaku Tukuri",
        mensaje="Manana no habra servicio de agua entre las 8 y las 14 horas.",
    )
    assert c.titulo.startswith("Corte")
    assert c.autor == "Directiva Comunal"


def test_autor_por_defecto_es_la_directiva():
    """Si no se envia autor, el comunicado se atribuye a la Directiva."""
    c = ComunicadoCreate(titulo="Reunion mensual", mensaje=MENSAJE_VALIDO)
    assert c.autor == "Directiva Comunal"


def test_autor_personalizado_se_respeta():
    c = ComunicadoCreate(
        titulo="Reunion mensual", mensaje=MENSAJE_VALIDO, autor="Presidente Comunal"
    )
    assert c.autor == "Presidente Comunal"


def test_titulo_es_obligatorio():
    with pytest.raises(ValidationError):
        ComunicadoCreate(mensaje=MENSAJE_VALIDO)


def test_mensaje_es_obligatorio():
    with pytest.raises(ValidationError):
        ComunicadoCreate(titulo="Asamblea general")


# ── La correccion usa las mismas reglas (P03) ──────────────────

def test_actualizar_aplica_las_mismas_reglas_minimas():
    """Editar un comunicado no puede ser una via para colar basura."""
    with pytest.raises(ValidationError):
        ComunicadoUpdate(titulo="aq", mensaje="aq")


def test_actualizar_acepta_correccion_valida():
    u = ComunicadoUpdate(
        titulo="Asamblea general (corregida)",
        mensaje="La asamblea se traslada al domingo a las 9 de la manana.",
    )
    assert "corregida" in u.titulo


def test_actualizar_no_admite_campo_autor():
    """El autor original no debe poder falsearse al editar."""
    u = ComunicadoUpdate(
        titulo="Asamblea general",
        mensaje=MENSAJE_VALIDO,
    )
    assert not hasattr(u, "autor")
