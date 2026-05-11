-- Habilitar extensión espacial para coordenadas
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. TABLA: ROLES (Para diferenciar al Vecino del Administrador/Directiva)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Ej: 'VECINO', 'DIRECTIVA_CABILDO'
    descripcion TEXT
);

-- 2. TABLA: SECTORES_COMUNALES (Para organizar geográficamente la parroquia)
CREATE TABLE sectores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- Ej: 'Sector Norte', 'Barrio Central', 'Comuna Alta'
    area_geografica GEOMETRY(Polygon, 4326) -- (Opcional) El perímetro del sector
);

-- 3. TABLA: USUARIOS (El core del sistema, soporta el CU de "Aprobación Jerárquica")
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(15) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    clave_hash VARCHAR(255) NOT NULL, -- Contraseña encriptada
    id_rol INTEGER REFERENCES roles(id),
    id_sector INTEGER REFERENCES sectores(id),
    -- estado_membresia es vital para la interculturalidad: 'PENDIENTE', 'APROBADO', 'RECHAZADO'
    estado_membresia VARCHAR(20) DEFAULT 'PENDIENTE', 
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: ALERTAS (Actualizada con relaciones)
CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id), -- Quién apretó el botón
    coordenadas GEOMETRY(Point, 4326) NOT NULL, -- Lat/Lon exactas
    estado_incidencia VARCHAR(30) DEFAULT 'ACTIVA', -- 'ACTIVA', 'RESUELTA', 'FALSA ALARMA'
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    id_admin_resolutor INTEGER REFERENCES usuarios(id) -- Qué directivo cerró la emergencia
);

-- 5. TABLA: COMUNICADOS (Para el muro de noticias de la directiva)
CREATE TABLE comunicados (
    id SERIAL PRIMARY KEY,
    id_autor INTEGER REFERENCES usuarios(id), -- Solo usuarios con rol 'DIRECTIVA'
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);