-- ============================================
-- Chaski Alert - Inicialización de Base de Datos
-- PostGIS + Esquema Completo del Sistema
-- ============================================

-- Extensión espacial para coordenadas geográficas
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── 1. TABLA: ROLES ────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- ─── 2. TABLA: SECTORES COMUNALES ───────────────────
CREATE TABLE IF NOT EXISTS sectores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    area_geografica GEOMETRY(Polygon, 4326)
);

-- ─── 3. TABLA: USUARIOS (vinculado a Keycloak) ─────
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    keycloak_id VARCHAR(36) UNIQUE,
    cedula VARCHAR(15) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    id_rol INTEGER REFERENCES roles(id),
    id_sector INTEGER REFERENCES sectores(id),
    estado_membresia VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── 4. TABLA: ALERTAS DE EMERGENCIA (CU-04/05/06) ─
CREATE TABLE IF NOT EXISTS alertas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id),
    usuario_nombre VARCHAR(100) DEFAULT 'Vecino Anónimo',
    coordenadas GEOMETRY(Point, 4326) NOT NULL,
    estado_incidencia VARCHAR(30) DEFAULT 'ACTIVA',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    id_admin_resolutor INTEGER REFERENCES usuarios(id)
);

-- ─── 5. TABLA: COMUNICADOS OFICIALES (CU-08/09) ────
CREATE TABLE IF NOT EXISTS comunicados (
    id SERIAL PRIMARY KEY,
    id_autor INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    autor VARCHAR(100) DEFAULT 'Directiva Comunal',
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── ÍNDICES ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alertas_coordenadas ON alertas USING GIST (coordenadas);
CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas (estado_incidencia);
CREATE INDEX IF NOT EXISTS idx_usuarios_keycloak ON usuarios (keycloak_id);

-- ─── DATOS SEMILLA ──────────────────────────────────
INSERT INTO roles (nombre, descripcion) VALUES
    ('DIRECTIVA', 'Directiva del Cabildo Comunal / Pushak Ayllu'),
    ('COMUNERO', 'Miembro aprobado de la comunidad / Ayllu Runa');

INSERT INTO sectores (nombre) VALUES
    ('Sector Norte / Hawa Llakta'),
    ('Sector Central / Chawpi Llakta'),
    ('Sector Sur / Uray Llakta');

INSERT INTO comunicados (titulo, mensaje, autor) VALUES
    ('Minga Comunitaria / Minka Ayllu', 'Se convoca a todos los miembros de la comunidad a la minga del día sábado a las 7:00 AM en la plaza central. Traer herramientas de trabajo.', 'Directiva Comunal'),
    ('Corte de Agua / Yaku Tukuri', 'Se informa que el día lunes habrá corte de agua potable de 8:00 AM a 2:00 PM por mantenimiento del sistema.', 'Junta de Agua');
