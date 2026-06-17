"""
Chaski Alert — Configuración centralizada.
Todas las variables de entorno del sistema se leen aquí.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Configuración centralizada del sistema Chaski Alert."""

    # ─── Servidor ─────────────────────────
    SERVER_HOST: str = os.getenv("SERVER_HOST", "localhost")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))

    # ─── Base de Datos ────────────────────
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://admin:password123@localhost:5433/chaski_alerta"
    )

    # ─── Keycloak ─────────────────────────
    KEYCLOAK_SERVER_URL: str = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
    KEYCLOAK_REALM: str = os.getenv("KEYCLOAK_REALM", "chaski-realm")
    KEYCLOAK_CLIENT_ID: str = os.getenv("KEYCLOAK_CLIENT_ID", "fastapi-backend")
    KEYCLOAK_CLIENT_SECRET: str = os.getenv("KEYCLOAK_CLIENT_SECRET", "fastapi-backend-secret")
    KEYCLOAK_ADMIN_USER: str = os.getenv("KEYCLOAK_ADMIN_USER", "admin")
    KEYCLOAK_ADMIN_PASSWORD: str = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin")

    # ─── Telegram Notificaciones (FASE 4) ─────────────
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")


settings = Settings()
