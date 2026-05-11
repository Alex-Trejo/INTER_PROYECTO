-- ============================================
-- Chaski Alert - Inicialización de Base de Datos
-- PostGIS + Tablas del Sistema
-- ============================================

-- Extensión espacial para coordenadas geográficas
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de Alertas de Emergencia (CU-04)
CREATE TABLE IF NOT EXISTS alertas (
    id SERIAL PRIMARY KEY,
    usuario_nombre VARCHAR(100) DEFAULT 'Vecino Anónimo',
    coordenadas GEOMETRY(Point, 4326),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Comunicados Oficiales (CU-08/09)
CREATE TABLE IF NOT EXISTS comunicados (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    autor VARCHAR(100) DEFAULT 'Directiva Comunal',
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice espacial para consultas geográficas eficientes
CREATE INDEX IF NOT EXISTS idx_alertas_coordenadas ON alertas USING GIST (coordenadas);

-- Datos de ejemplo para pruebas
INSERT INTO comunicados (titulo, mensaje, autor) VALUES
    ('Minga Comunitaria / Minka Ayllu', 'Se convoca a todos los miembros de la comunidad a la minga del día sábado a las 7:00 AM en la plaza central. Traer herramientas de trabajo.', 'Directiva Comunal'),
    ('Corte de Agua / Yaku Tukuri', 'Se informa que el día lunes habrá corte de agua potable de 8:00 AM a 2:00 PM por mantenimiento del sistema.', 'Junta de Agua');
