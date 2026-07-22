"""
Configuración compartida de las pruebas unitarias del backend.

Las pruebas de este paquete son UNITARIAS: no tocan la base de datos, no
levantan la API y no consultan Keycloak. Por eso corren en milisegundos y
no exigen tener Docker encendido.
"""

import os
import sys

# Permite importar los modulos del backend (models, core, routers) sin
# necesidad de instalar el proyecto como paquete.
RAIZ_BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if RAIZ_BACKEND not in sys.path:
    sys.path.insert(0, RAIZ_BACKEND)
