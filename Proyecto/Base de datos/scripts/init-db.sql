-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS ProyectoDB;
USE ProyectoDB;

-- Tabla pais (padre)
CREATE TABLE IF NOT EXISTS pais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(50) PRIMARY KEY,
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    sexo VARCHAR(10) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    pais INT NOT NULL,
    contrasenia VARBINARY(255) NOT NULL,
    administrador BOOLEAN NOT NULL DEFAULT FALSE,
    ciudadano BOOLEAN NOT NULL DEFAULT TRUE,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (pais) REFERENCES pais(id),
    INDEX idx_correo (correo_electronico),
    INDEX idx_pais (pais)
);

-- Tabla pasaporte (1:N con usuarios)
CREATE TABLE IF NOT EXISTS pasaporte (
    id_usuario VARCHAR(50) NOT NULL,
    tipo_de_pasaporte VARCHAR(50) NOT NULL,
    fecha_de_emision DATETIME NOT NULL,
    fecha_de_vencimiento DATETIME NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    pais_de_emision INT NOT NULL,
    numero_de_pasaporte VARCHAR(50) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (numero_de_pasaporte),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pais_de_emision) REFERENCES pais(id),
    INDEX idx_usuario (id_usuario),
    INDEX idx_pasaporte_numero (numero_de_pasaporte)
);


DELIMITER $$

DROP FUNCTION IF EXISTS insertar_usuario $$

CREATE FUNCTION insertar_usuario(
    p_id VARCHAR(50),
    p_correo VARCHAR(255),
    p_telefono VARCHAR(20),
    p_nombres VARCHAR(100),
    p_apellidos VARCHAR(100),
    p_sexo VARCHAR(10),
    p_genero VARCHAR(20),
    p_pais INT,
    p_contraseña VARBINARY(255),
    p_admin BOOLEAN,
    p_ciudadano BOOLEAN
) 
RETURNS VARCHAR(200)
MODIFIES SQL DATA
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        GET DIAGNOSTICS CONDITION 1 
        @sqlstate = RETURNED_SQLSTATE, 
        @errno = MYSQL_ERRNO, 
        @text = MESSAGE_TEXT;
        
        CASE @errno
            WHEN 1062 THEN RETURN 'ERROR_EMAIL_DUPLICADO: Email ya registrado';
            WHEN 1452 THEN RETURN 'ERROR_PAIS_INVALIDO: País no existe';
            WHEN 1364 THEN RETURN 'ERROR_CAMPO_NULL: Campo requerido vacío';
            ELSE RETURN CONCAT('ERROR_DB_', @errno, ': ', @text);
        END CASE;
    END;
    
    -- INSERT atómico (UNIQUE + FK validan automáticamente)
    INSERT INTO usuarios (
        id, correo_electronico, telefono, nombres, apellidos, 
        sexo, genero, pais, contraseña, administrador, ciudadano
    ) VALUES (
        p_id, p_correo, p_telefono, p_nombres, p_apellidos,
        p_sexo, p_genero, p_pais, p_contraseña, p_admin, p_ciudadano
    );
    
    RETURN 'SUCCESS';
END$$

DELIMITER ;


DELIMITER $$

DROP FUNCTION IF EXISTS insertar_pasaporte$$

CREATE FUNCTION insertar_pasaporte(
    p_id_usuario VARCHAR(50),
    p_tipo_pasaporte VARCHAR(50),
    p_fecha_emision DATETIME,
    p_fecha_vencimiento DATETIME,
    p_lugar VARCHAR(255),
    p_pais_emision INT,
    p_numero_pasaporte VARCHAR(50)
)
RETURNS VARCHAR(200)
DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        IF @errno = 1452 THEN
            RETURN CASE WHEN @text LIKE '%id_usuario%' THEN 'ERROR_USUARIO_INEXISTENTE: Usuario no encontrado'
                        WHEN @text LIKE '%pais_de_emision%' THEN 'ERROR_PAIS_EMISION_INVALIDO: País de emisión no existe'
                   END;
        ELSEIF @errno = 1364 THEN
            RETURN 'ERROR_CAMPO_NULL: Campo requerido vacío';
        ELSE
            RETURN CONCAT('ERROR_DB_', @errno, ': ', @text);
        END IF;
    END;

    INSERT INTO pasaporte (id_usuario, tipo_de_pasaporte, fecha_de_emision, fecha_de_vencimiento, 
                          lugar, pais_de_emision, numero_de_pasaporte, habilitado)
    VALUES (p_id_usuario, p_tipo_pasaporte, p_fecha_emision, p_fecha_vencimiento, 
            p_lugar, p_pais_emision, p_numero_pasaporte, TRUE);
    RETURN 'SUCCESS';
END$$

DELIMITER ;


DELIMITER $$

DROP FUNCTION IF EXISTS cambiar_estado_usuario $$

CREATE FUNCTION cambiar_estado_usuario(
    p_id VARCHAR(50),
    p_habilitado BOOLEAN  -- TRUE=habilitar, FALSE=deshabilitar
) 
RETURNS VARCHAR(100)
DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE filas_afectadas INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        GET DIAGNOSTICS CONDITION 1 
        @sqlstate = RETURNED_SQLSTATE, 
        @errno = MYSQL_ERRNO, 
        @text = MESSAGE_TEXT;
        RETURN CONCAT('ERROR_DB_', @errno, ': ', @text);
    END;
    
    -- 1. Verificar que usuario existe
    SELECT COUNT(*) INTO filas_afectadas FROM usuarios WHERE id = p_id;
    IF filas_afectadas = 0 THEN
        RETURN 'ERROR_USUARIO_INEXISTENTE: Usuario no encontrado';
    END IF;
    
    -- 2. Ya está en ese estado (no hacer nada)
    IF (SELECT habilitado FROM usuarios WHERE id = p_id) = p_habilitado THEN
        RETURN CONCAT('INFO_YA_ESTABA: Usuario ya está ', 
                     IF(p_habilitado, 'habilitado', 'deshabilitado'));
    END IF;
    
    -- 3. UPDATE estado
    UPDATE usuarios SET
        habilitado = p_habilitado
    WHERE id = p_id;
    
    RETURN IF(p_habilitado, 'SUCCESS_HABILITADO', 'SUCCESS_DESHABILITADO');
END$$

DELIMITER ;

DELIMITER $$

DROP FUNCTION IF EXISTS actualizar_usuario$$

CREATE FUNCTION actualizar_usuario(
    p_id VARCHAR(50), p_correo VARCHAR(255), p_telefono VARCHAR(20), p_nombres VARCHAR(100),
    p_apellidos VARCHAR(100), p_sexo VARCHAR(10), p_genero VARCHAR(20), p_pais INT,
    p_contrasenia VARBINARY(255), p_admin BOOLEAN, p_ciudadano BOOLEAN, p_habilitado BOOLEAN
)
RETURNS VARCHAR(200)
DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE filas_afectadas INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        IF @errno = 1062 THEN RETURN 'ERROR_EMAIL_DUPLICADO: Email ya registrado por otro usuario';
        ELSEIF @errno = 1452 THEN RETURN 'ERROR_PAIS_INVALIDO: País no existe';
        ELSEIF @errno = 1364 THEN RETURN 'ERROR_CAMPO_NULL: Campo requerido vacío';
        ELSE RETURN CONCAT('ERROR_DB_', @errno, ': ', @text);
        END IF;
    END;

    SELECT COUNT(*) INTO filas_afectadas FROM usuarios WHERE id = p_id;
    IF filas_afectadas = 0 THEN RETURN 'ERROR_USUARIO_INEXISTENTE: Usuario no encontrado'; END IF;

    IF p_correo != (SELECT correo_electronico FROM usuarios WHERE id = p_id) AND
       EXISTS (SELECT 1 FROM usuarios WHERE correo_electronico = p_correo AND id != p_id) THEN
        RETURN 'ERROR_EMAIL_DUPLICADO: Email ya registrado por otro usuario';
    END IF;

    UPDATE usuarios SET correo_electronico = p_correo, telefono = p_telefono, nombres = p_nombres,
        apellidos = p_apellidos, sexo = p_sexo, genero = p_genero, pais = p_pais,
        contrasenia = p_contrasenia, administrador = p_admin, ciudadano = p_ciudadano,
        habilitado = p_habilitado WHERE id = p_id;
    RETURN 'SUCCESS';
END$$

DELIMITER ;

DELIMITER $$

DROP FUNCTION IF EXISTS cambiar_estado_pasaporte_habilitado $$

CREATE FUNCTION cambiar_estado_pasaporte_habilitado(
    p_numero_pasaporte VARCHAR(50),
    p_habilitado BOOLEAN  -- TRUE=activar, FALSE=desactivar
)
RETURNS VARCHAR(200)
DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE filas_afectadas INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        RETURN CONCAT('ERROR_DB_', @errno, ': ', @text);
    END;

    -- 1. Verificar que pasaporte existe
    SELECT COUNT(*) INTO filas_afectadas FROM pasaporte WHERE numero_de_pasaporte = p_numero_pasaporte;
    IF filas_afectadas = 0 THEN
        RETURN 'ERROR_PASAPORTE_INEXISTENTE: Pasaporte no encontrado';
    END IF;

    -- 2. Si se quiere DESACTIVAR, hacerlo directamente
    IF NOT p_habilitado THEN
        UPDATE pasaporte SET habilitado = FALSE WHERE numero_de_pasaporte = p_numero_pasaporte;
        RETURN 'SUCCESS_DESACTIVADO';
    END IF;

    -- 3. Si se quiere ACTIVAR, verificar que no hay otro habilitado del mismo usuario
    IF EXISTS (
        SELECT 1 FROM pasaporte 
        WHERE id_usuario = (SELECT id_usuario FROM pasaporte WHERE numero_de_pasaporte = p_numero_pasaporte)
        AND habilitado = TRUE 
        AND numero_de_pasaporte != p_numero_pasaporte
    ) THEN
        RETURN 'ERROR_PASAPORTE_YA_HABILITADO: Ya existe otro pasaporte habilitado para este usuario';
    END IF;

    -- 4. ACTIVAR (es seguro, no hay otro habilitado)
    UPDATE pasaporte SET habilitado = TRUE WHERE numero_de_pasaporte = p_numero_pasaporte;
    RETURN 'SUCCESS_ACTIVADO';
END$$

DELIMITER ;


INSERT INTO pais (nombre) VALUES 
('México'), ('Estados Unidos'), ('Canadá'), ('España'), ('Argentina'),
('Colombia'), ('Chile'), ('Perú'), ('Brasil'), ('Venezuela'),
('Ecuador'), ('Uruguay'), ('Paraguay'), ('Bolivia'), ('Guatemala'),
('Honduras'), ('El Salvador'), ('Nicaragua'), ('Costa Rica'), ('Panamá');

INSERT INTO usuarios (id, correo_electronico, telefono, nombres, apellidos, sexo, genero, pais, contrasenia, administrador, ciudadano, habilitado) VALUES
('USR001', 'juan.perez@ejemplo.com', '+521234567890', 'Juan', 'Pérez López', 'M', 'Masculino', 1, AES_ENCRYPT('clave123', 'saltykey'), FALSE, TRUE, TRUE),
('USR002', 'maria.gomez@ejemplo.com', '+521987654321', 'María', 'Gómez Ruiz', 'F', 'Femenino', 4, AES_ENCRYPT('clave456', 'saltykey'), FALSE, TRUE, TRUE),
('USR003', 'carlos.lopez@ejemplo.com', '+525512345678', 'Carlos', 'López García', 'M', 'Masculino', 5, AES_ENCRYPT('clave789', 'saltykey'), FALSE, TRUE, TRUE),
('USR004', 'ana.martin@ejemplo.com', '+57123456789', 'Ana', 'Martín Soto', 'F', 'Femenino', 6, AES_ENCRYPT('claveabc', 'saltykey'), FALSE, TRUE, TRUE),
('USR005', 'diego.silva@ejemplo.com', '+551199887766', 'Diego', 'Silva Santos', 'M', 'Masculino', 9, AES_ENCRYPT('claved12', 'saltykey'), FALSE, TRUE, TRUE);

SELECT insertar_pasaporte('USR001', 'Ordinario', '2023-01-15', '2033-01-15', 'CDMX', 1, 'MXA123456');
SELECT insertar_pasaporte('USR002', 'Ordinario', '2023-03-20', '2033-03-20', 'Madrid', 4, 'ESA765432');
SELECT insertar_pasaporte('USR003', 'Ordinario', '2022-11-10', '2032-11-10', 'Buenos Aires', 5, 'ARA987654');
SELECT insertar_pasaporte('USR004', 'Ordinario', '2024-02-01', '2034-02-01', 'Bogotá', 6, 'COA111222');
SELECT insertar_pasaporte('USR005', 'Ordinario', '2023-07-12', '2033-07-12', 'São Paulo', 9, 'BRA333444');

INSERT INTO usuarios (id, correo_electronico, telefono, nombres, apellidos, sexo, genero, pais, contrasenia, administrador, ciudadano, habilitado) VALUES
('ADMIN001', 'admin1@proyecto.com', '+521555123456', 'Admin', 'Sistema Uno', 'M', 'Masculino', 1, AES_ENCRYPT('admin123', 'saltykey'), TRUE, FALSE, TRUE),
('ADMIN002', 'admin2@proyecto.com', '+521555654321', 'Admin', 'Sistema Dos', 'F', 'Femenino', 2, AES_ENCRYPT('admin456', 'saltykey'), TRUE, FALSE, TRUE);

-- Pasaporte 1 (HABILITADO)
SELECT insertar_pasaporte('ADMIN001', 'Diplomatico', '2024-01-01', '2034-01-01', 'CDMX', 1, 'MXD001234');

-- Pasaporte 2 (INHABILITADO)
SELECT insertar_pasaporte('ADMIN001', 'Emergencia', '2023-06-15', '2028-06-15', 'Guadalajara', 1, 'MXE005678');

-- Pasaporte 3 (INHABILITADO)
SELECT insertar_pasaporte('ADMIN001', 'Ordinario', '2022-09-10', '2032-09-10', 'Monterrey', 1, 'MXO009ABC');

