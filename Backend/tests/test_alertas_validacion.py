"""
Pruebas de la validación de alertas SOS.

Una alerta con coordenadas imposibles colocaría un marcador erróneo en el mapa
de la Directiva durante una emergencia real, o rompería el renderizado del mapa.
Estas pruebas fijan los rangos geográficos válidos.
"""

import pytest
from pydantic import ValidationError

from models.schemas import AlertaCreate, AlertaEstadoUpdate

# Coordenadas reales usadas en las pruebas del sistema (sector de la comunidad)
LAT_REAL = -0.31827
LNG_REAL = -78.44179


# ── Rangos geograficos ─────────────────────────────────────────

def test_acepta_coordenadas_reales_de_la_comunidad():
    a = AlertaCreate(lat=LAT_REAL, lng=LNG_REAL)
    assert a.lat == LAT_REAL
    assert a.lng == LNG_REAL


@pytest.mark.parametrize("lat_invalida", [91, 999, -91, -1000])
def test_rechaza_latitud_fuera_de_rango(lat_invalida):
    """La latitud solo existe entre -90 y 90 grados."""
    with pytest.raises(ValidationError):
        AlertaCreate(lat=lat_invalida, lng=LNG_REAL)


@pytest.mark.parametrize("lng_invalida", [181, -181, -500, 360])
def test_rechaza_longitud_fuera_de_rango(lng_invalida):
    """La longitud solo existe entre -180 y 180 grados."""
    with pytest.raises(ValidationError):
        AlertaCreate(lat=LAT_REAL, lng=lng_invalida)


@pytest.mark.parametrize("lat,lng", [(90, 180), (-90, -180), (0, 0)])
def test_acepta_los_extremos_del_rango(lat, lng):
    """Los limites son inclusivos: los polos y el meridiano son validos."""
    a = AlertaCreate(lat=lat, lng=lng)
    assert a.lat == lat and a.lng == lng


# ── Campos obligatorios ────────────────────────────────────────

def test_latitud_es_obligatoria():
    with pytest.raises(ValidationError):
        AlertaCreate(lng=LNG_REAL)


def test_longitud_es_obligatoria():
    with pytest.raises(ValidationError):
        AlertaCreate(lat=LAT_REAL)


def test_rechaza_coordenadas_no_numericas():
    """Un texto en el campo de coordenadas no debe llegar a la base de datos."""
    with pytest.raises(ValidationError):
        AlertaCreate(lat="abc", lng=LNG_REAL)


def test_nombre_por_defecto_cuando_no_se_envia():
    a = AlertaCreate(lat=LAT_REAL, lng=LNG_REAL)
    assert a.usuario_nombre == "Vecino Anónimo"


def test_acepta_coordenadas_enteras():
    """El movil puede enviar enteros; deben convertirse a float sin fallar."""
    a = AlertaCreate(lat=0, lng=0)
    assert isinstance(a.lat, float)


# ── Cambio de estado de la incidencia (CU-06) ──────────────────

@pytest.mark.parametrize("estado", ["RESUELTA", "FALSA_ALARMA"])
def test_estados_validos_de_una_alerta(estado):
    e = AlertaEstadoUpdate(estado=estado)
    assert e.estado == estado


@pytest.mark.parametrize("estado_invalido", ["ACTIVA", "resuelta", "CERRADA", ""])
def test_rechaza_estados_no_permitidos(estado_invalido):
    """Solo se permite cerrar una alerta como resuelta o falsa alarma."""
    with pytest.raises(ValidationError):
        AlertaEstadoUpdate(estado=estado_invalido)
