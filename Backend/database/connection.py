"""
Chaski Alert — Conexión a la Base de Datos PostGIS.
"""

import databases
from core.config import settings

database = databases.Database(settings.DATABASE_URL)
