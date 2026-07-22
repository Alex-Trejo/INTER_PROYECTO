-- ═══════════════════════════════════════════════════════════════
-- Chaski Alert — Migración 001
-- Tokens de notificaciones push (FCM) por dispositivo.
--
-- Resuelve el problema P05 de la evaluación: sin push, un comunero
-- con la aplicación cerrada no se entera de las alertas ni avisos.
--
-- Aplicar con:
--   docker exec -i chaski_db psql -U admin -d chaski_alerta \
--       < Backend/migraciones/001_dispositivos_push.sql
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS dispositivos (
    id             SERIAL PRIMARY KEY,
    keycloak_id    VARCHAR(36)  NOT NULL,
    token          TEXT         NOT NULL UNIQUE,
    plataforma     VARCHAR(20)  NOT NULL DEFAULT 'android',
    nombre_usuario VARCHAR(150),
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP    NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Guayaquil'),
    ultima_conexion TIMESTAMP   NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Guayaquil')
);

-- Un usuario puede tener varios dispositivos; se consulta por usuario y por estado.
CREATE INDEX IF NOT EXISTS idx_dispositivos_keycloak ON dispositivos (keycloak_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_activo   ON dispositivos (activo) WHERE activo;

COMMENT ON TABLE  dispositivos IS 'Tokens FCM para enviar notificaciones push a la app movil';
COMMENT ON COLUMN dispositivos.token IS 'Token nativo de Firebase Cloud Messaging del dispositivo';
COMMENT ON COLUMN dispositivos.activo IS 'Se marca FALSE cuando FCM informa que el token ya no es valido';
