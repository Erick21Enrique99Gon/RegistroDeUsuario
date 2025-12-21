SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS ProyectoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ProyectoDB;

-- Tabla pais (padre)
CREATE TABLE IF NOT EXISTS pais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
;

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
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pais_de_emision) REFERENCES pais(id),
    UNIQUE KEY uk_pasaporte_lugar (numero_de_pasaporte, lugar),  -- Evita duplicados por número+lugar
    INDEX idx_usuario (id_usuario),
    INDEX idx_pasaporte_numero (numero_de_pasaporte)
);


DELIMITER $$

-- 1. INSERTAR USUARIO
DROP PROCEDURE IF EXISTS insertar_usuario$$
CREATE PROCEDURE insertar_usuario(
    IN p_id VARCHAR(50),
    IN p_correo VARCHAR(255),
    IN p_telefono VARCHAR(20),
    IN p_nombres VARCHAR(100),
    IN p_apellidos VARCHAR(100),
    IN p_sexo VARCHAR(10),
    IN p_genero VARCHAR(20),
    IN p_pais INT,
    IN p_contrasenia VARBINARY(255),
    IN p_admin BOOLEAN,
    IN p_ciudadano BOOLEAN
)
MODIFIES SQL DATA
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO,
        @text = MESSAGE_TEXT;

        CASE @errno
            WHEN 1062 THEN SELECT 'ERROR_EMAIL_DUPLICADO: Email ya registrado' as resultado;
            WHEN 1452 THEN SELECT 'ERROR_PAIS_INVALIDO: Pais no existe' as resultado;
            WHEN 1364 THEN SELECT 'ERROR_CAMPO_NULL: Campo requerido vacio' as resultado;
            ELSE SELECT CONCAT('ERROR_DB_', @errno, ': ', @text) as resultado;
        END CASE;
    END;

    INSERT INTO usuarios (
        id, correo_electronico, telefono, nombres, apellidos,
        sexo, genero, pais, contrasenia, administrador, ciudadano
    ) VALUES (
        p_id, p_correo, p_telefono, p_nombres, p_apellidos,
        p_sexo, p_genero, p_pais, p_contrasenia, p_admin, p_ciudadano
    );

    SELECT 'SUCCESS' as resultado;
END$$

DELIMITER ;

-- 2. INSERTAR PASAPORTE
DELIMITER $$
DROP PROCEDURE IF EXISTS insertar_pasaporte$$
CREATE PROCEDURE insertar_pasaporte(
    IN p_id_usuario VARCHAR(50),
    IN p_tipo_pasaporte VARCHAR(50),
    IN p_fecha_emision DATETIME,
    IN p_fecha_vencimiento DATETIME,
    IN p_lugar VARCHAR(255),
    IN p_pais_emision INT,
    IN p_numero_de_pasaporte VARCHAR(50)
)
MODIFIES SQL DATA
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO,
        @text = MESSAGE_TEXT;

        -- Manejar errores de Foreign Key (1452) por constraint name
        IF @errno = 1452 THEN
            CASE 
                WHEN @text LIKE '%pasaporte_ibfk_1%' THEN
                    SELECT 'ERROR_USUARIO_INEXISTENTE: Usuario no encontrado' as resultado;
                WHEN @text LIKE '%pasaporte_ibfk_2%' OR @text LIKE '%pais_de_emision%' THEN
                    SELECT 'ERROR_PAIS_EMISION_INVALIDO: Pais de emision no existe' as resultado;
                ELSE
                    SELECT CONCAT('ERROR_FK_', @errno, ': ', @text) as resultado;
            END CASE;
        -- Otros errores específicos
        ELSEIF @errno = 1062 THEN
            SELECT 'ERROR_PASAPORTE_DUPLICADO: Pasaporte ya registrado' as resultado;
        ELSEIF @errno = 1364 THEN
            SELECT 'ERROR_CAMPO_NULL: Campo requerido vacio' as resultado;
        ELSE
            SELECT CONCAT('ERROR_DB_', @errno, ': ', @text) as resultado;
        END IF;
    END;

    INSERT INTO pasaporte (
        id_usuario, tipo_de_pasaporte, fecha_de_emision, fecha_de_vencimiento,
        lugar, pais_de_emision, numero_de_pasaporte, habilitado
    ) VALUES (
        p_id_usuario, p_tipo_pasaporte, p_fecha_emision, p_fecha_vencimiento,
        p_lugar, p_pais_emision, p_numero_de_pasaporte, TRUE
    );

    SELECT 'SUCCESS' as resultado;
END$$
DELIMITER ;


-- 3. CAMBIAR ESTADO USUARIO
DELIMITER $$
DROP PROCEDURE IF EXISTS toggle_estado_usuario$$
CREATE PROCEDURE toggle_estado_usuario(
    IN p_id VARCHAR(50)
)
MODIFIES SQL DATA
BEGIN
    DECLARE filas_afectadas INT DEFAULT 0;
    DECLARE estado_actual BOOLEAN;
    DECLARE nuevo_estado BOOLEAN;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO,
        @text = MESSAGE_TEXT;

        CASE @errno
            WHEN 1451 THEN SELECT 'ERROR_REFERENCIA_ACTIVA: Usuario tiene registros dependientes' as resultado;
            WHEN 1364 THEN SELECT 'ERROR_CAMPO_NULL: Campo requerido vacio' as resultado;
            ELSE SELECT CONCAT('ERROR_DB_', @errno, ': ', @text) as resultado;
        END CASE;
    END;

    SELECT COUNT(*), MAX(habilitado)
    INTO filas_afectadas, estado_actual
    FROM usuarios
    WHERE id = p_id;

    IF filas_afectadas = 0 THEN
        SELECT 'ERROR_USUARIO_INEXISTENTE: Usuario no encontrado' as resultado;
    ELSE
        SET nuevo_estado = NOT estado_actual;  -- Toggle automático
        
        UPDATE usuarios
        SET habilitado = nuevo_estado
        WHERE id = p_id;

        IF ROW_COUNT() = 0 THEN
            SELECT 'ERROR_USUARIO_MODIFICADO: Usuario fue modificado por otro proceso' as resultado;
        ELSE
            SELECT CONCAT('SUCCESS_TOGGLE_', IF(nuevo_estado, 'HABILITADO', 'DESHABILITADO')) as resultado;
        END IF;
    END IF;
END$$
DELIMITER ;

-- 4. ACTUALIZAR USUARIO
DELIMITER $$
DROP PROCEDURE IF EXISTS actualizar_usuario$$
CREATE PROCEDURE actualizar_usuario(
    IN p_id VARCHAR(50),
    IN p_correo VARCHAR(255),
    IN p_telefono VARCHAR(20),
    IN p_nombres VARCHAR(100),
    IN p_apellidos VARCHAR(100),
    IN p_sexo VARCHAR(10),
    IN p_genero VARCHAR(20),
    IN p_pais INT,
    IN p_admin BOOLEAN,
    IN p_ciudadano BOOLEAN,
    IN p_habilitado BOOLEAN
)
MODIFIES SQL DATA
BEGIN
    DECLARE filas_afectadas INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO,
        @text = MESSAGE_TEXT;

        CASE @errno
            WHEN 1062 THEN SELECT 'ERROR_EMAIL_DUPLICADO: Email ya registrado por otro usuario' as resultado;
            WHEN 1452 THEN SELECT 'ERROR_PAIS_INVALIDO: Pais no existe' as resultado;
            WHEN 1364 THEN SELECT 'ERROR_CAMPO_NULL: Campo requerido vacio' as resultado;
            ELSE SELECT CONCAT('ERROR_DB_', @errno, ': ', @text) as resultado;
        END CASE;
    END;

    SELECT COUNT(*) INTO filas_afectadas FROM usuarios WHERE id = p_id;
    IF filas_afectadas = 0 THEN
        SELECT 'ERROR_USUARIO_INEXISTENTE: Usuario no encontrado' as resultado;
    ELSE
        UPDATE usuarios SET
            correo_electronico = p_correo,
            telefono = p_telefono,
            nombres = p_nombres,
            apellidos = p_apellidos,
            sexo = p_sexo,
            genero = p_genero,
            pais = p_pais,
            administrador = p_admin,
            ciudadano = p_ciudadano,
            habilitado = p_habilitado
        WHERE id = p_id;

        IF ROW_COUNT() = 0 THEN
            SELECT 'ERROR_USUARIO_MODIFICADO: Usuario fue modificado por otro proceso' as resultado;
        ELSE
            SELECT 'SUCCESS' as resultado;
        END IF;
    END IF;
END$$
DELIMITER ;

-- 5. CAMBIAR ESTADO PASAPORTE
DELIMITER $$
DROP PROCEDURE IF EXISTS cambiar_estado_pasaporte_habilitado$$
CREATE PROCEDURE cambiar_estado_pasaporte_habilitado(
    IN p_numero_pasaporte VARCHAR(50),
    IN p_habilitado BOOLEAN
)
MODIFIES SQL DATA
BEGIN
    DECLARE filas_afectadas INT DEFAULT 0;
    DECLARE id_usuario_actual VARCHAR(50);
    DECLARE otros_habilitados INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO,
        @text = MESSAGE_TEXT;
        SELECT CONCAT('ERROR_DB_', @errno, ': ', @text) as resultado;
    END;

    SELECT COUNT(*), id_usuario
    INTO filas_afectadas, id_usuario_actual
    FROM pasaporte
    WHERE numero_de_pasaporte = p_numero_pasaporte;

    IF filas_afectadas = 0 THEN
        SELECT 'ERROR_PASAPORTE_INEXISTENTE: Pasaporte no encontrado' as resultado;
    ELSEIF NOT p_habilitado THEN
        UPDATE pasaporte SET habilitado = FALSE
        WHERE numero_de_pasaporte = p_numero_pasaporte;

        IF ROW_COUNT() > 0 THEN
            SELECT 'SUCCESS_DESACTIVADO' as resultado;
        ELSE
            SELECT 'ERROR_PASAPORTE_MODIFICADO: Pasaporte fue modificado por otro proceso' as resultado;
        END IF;
    ELSE
        SELECT COUNT(*)
        INTO otros_habilitados
        FROM pasaporte
        WHERE id_usuario = id_usuario_actual
        AND habilitado = TRUE
        AND numero_de_pasaporte != p_numero_pasaporte;

        IF otros_habilitados > 0 THEN
            SELECT 'ERROR_PASAPORTE_YA_HABILITADO: Ya existe otro pasaporte habilitado para este usuario' as resultado;
        ELSE
            UPDATE pasaporte SET habilitado = TRUE
            WHERE numero_de_pasaporte = p_numero_pasaporte;

            IF ROW_COUNT() > 0 THEN
                SELECT 'SUCCESS_ACTIVADO' as resultado;
            ELSE
                SELECT 'ERROR_PASAPORTE_MODIFICADO: Pasaporte fue modificado por otro proceso' as resultado;
            END IF;
        END IF;
    END IF;
END$$
DELIMITER ;

INSERT INTO pais (nombre) VALUES ('Afghanistan');
INSERT INTO pais (nombre) VALUES ('Albania');
INSERT INTO pais (nombre) VALUES ('Algeria');
INSERT INTO pais (nombre) VALUES ('Andorra');
INSERT INTO pais (nombre) VALUES ('Angola');
INSERT INTO pais (nombre) VALUES ('Antigua and Barbuda');
INSERT INTO pais (nombre) VALUES ('Argentina');
INSERT INTO pais (nombre) VALUES ('Armenia');
INSERT INTO pais (nombre) VALUES ('Australia');
INSERT INTO pais (nombre) VALUES ('Austria');
INSERT INTO pais (nombre) VALUES ('Azerbaijan');
INSERT INTO pais (nombre) VALUES ('Bahamas');
INSERT INTO pais (nombre) VALUES ('Bahrain');
INSERT INTO pais (nombre) VALUES ('Bangladesh');
INSERT INTO pais (nombre) VALUES ('Barbados');
INSERT INTO pais (nombre) VALUES ('Belarus');
INSERT INTO pais (nombre) VALUES ('Belgium');
INSERT INTO pais (nombre) VALUES ('Belize');
INSERT INTO pais (nombre) VALUES ('Benin');
INSERT INTO pais (nombre) VALUES ('Bhutan');
INSERT INTO pais (nombre) VALUES ('Bolivia');
INSERT INTO pais (nombre) VALUES ('Bosnia and Herzegovina');
INSERT INTO pais (nombre) VALUES ('Botswana');
INSERT INTO pais (nombre) VALUES ('Brazil');
INSERT INTO pais (nombre) VALUES ('Brunei');
INSERT INTO pais (nombre) VALUES ('Bulgaria');
INSERT INTO pais (nombre) VALUES ('Burkina Faso');
INSERT INTO pais (nombre) VALUES ('Burundi');
INSERT INTO pais (nombre) VALUES ('Cambodia');
INSERT INTO pais (nombre) VALUES ('Cameroon');
INSERT INTO pais (nombre) VALUES ('Canada');
INSERT INTO pais (nombre) VALUES ('Cape Verde (Cabo Verde)');
INSERT INTO pais (nombre) VALUES ('Central African Republic');
INSERT INTO pais (nombre) VALUES ('Chad');
INSERT INTO pais (nombre) VALUES ('Chile');
INSERT INTO pais (nombre) VALUES ('China');
INSERT INTO pais (nombre) VALUES ('Colombia');
INSERT INTO pais (nombre) VALUES ('Comoros');
INSERT INTO pais (nombre) VALUES ('Congo, Republic of the');
INSERT INTO pais (nombre) VALUES ('Congo, Democratic Republic of the');
INSERT INTO pais (nombre) VALUES ('Costa Rica');
INSERT INTO pais (nombre) VALUES ('Croatia');
INSERT INTO pais (nombre) VALUES ('Cuba');
INSERT INTO pais (nombre) VALUES ('Cyprus');
INSERT INTO pais (nombre) VALUES ('Czech Republic');
INSERT INTO pais (nombre) VALUES ('Denmark');
INSERT INTO pais (nombre) VALUES ('Djibouti');
INSERT INTO pais (nombre) VALUES ('Dominica');
INSERT INTO pais (nombre) VALUES ('Dominican Republic');
INSERT INTO pais (nombre) VALUES ('Ecuador');
INSERT INTO pais (nombre) VALUES ('Egypt');
INSERT INTO pais (nombre) VALUES ('El Salvador');
INSERT INTO pais (nombre) VALUES ('Equatorial Guinea');
INSERT INTO pais (nombre) VALUES ('Eritrea');
INSERT INTO pais (nombre) VALUES ('Estonia');
INSERT INTO pais (nombre) VALUES ('Eswatini');
INSERT INTO pais (nombre) VALUES ('Ethiopia');
INSERT INTO pais (nombre) VALUES ('Fiji');
INSERT INTO pais (nombre) VALUES ('Finland');
INSERT INTO pais (nombre) VALUES ('France');
INSERT INTO pais (nombre) VALUES ('Gabon');
INSERT INTO pais (nombre) VALUES ('Gambia');
INSERT INTO pais (nombre) VALUES ('Georgia');
INSERT INTO pais (nombre) VALUES ('Germany');
INSERT INTO pais (nombre) VALUES ('Ghana');
INSERT INTO pais (nombre) VALUES ('Greece');
INSERT INTO pais (nombre) VALUES ('Grenada');
INSERT INTO pais (nombre) VALUES ('Guatemala');
INSERT INTO pais (nombre) VALUES ('Guinea');
INSERT INTO pais (nombre) VALUES ('Guinea-Bissau');
INSERT INTO pais (nombre) VALUES ('Guyana');
INSERT INTO pais (nombre) VALUES ('Haiti');
INSERT INTO pais (nombre) VALUES ('Honduras');
INSERT INTO pais (nombre) VALUES ('Hungary');
INSERT INTO pais (nombre) VALUES ('Iceland');
INSERT INTO pais (nombre) VALUES ('India');
INSERT INTO pais (nombre) VALUES ('Indonesia');
INSERT INTO pais (nombre) VALUES ('Iran');
INSERT INTO pais (nombre) VALUES ('Iraq');
INSERT INTO pais (nombre) VALUES ('Ireland');
INSERT INTO pais (nombre) VALUES ('Israel');
INSERT INTO pais (nombre) VALUES ('Italy');
INSERT INTO pais (nombre) VALUES ('Jamaica');
INSERT INTO pais (nombre) VALUES ('Japan');
INSERT INTO pais (nombre) VALUES ('Jordan');
INSERT INTO pais (nombre) VALUES ('Kazakhstan');
INSERT INTO pais (nombre) VALUES ('Kenya');
INSERT INTO pais (nombre) VALUES ('Kiribati');
INSERT INTO pais (nombre) VALUES ('Kosovo');
INSERT INTO pais (nombre) VALUES ('Kuwait');
INSERT INTO pais (nombre) VALUES ('Kyrgyzstan');
INSERT INTO pais (nombre) VALUES ('Laos');
INSERT INTO pais (nombre) VALUES ('Latvia');
INSERT INTO pais (nombre) VALUES ('Lebanon');
INSERT INTO pais (nombre) VALUES ('Lesotho');
INSERT INTO pais (nombre) VALUES ('Liberia');
INSERT INTO pais (nombre) VALUES ('Libya');
INSERT INTO pais (nombre) VALUES ('Liechtenstein');
INSERT INTO pais (nombre) VALUES ('Lithuania');
INSERT INTO pais (nombre) VALUES ('Luxembourg');
INSERT INTO pais (nombre) VALUES ('Madagascar');
INSERT INTO pais (nombre) VALUES ('Malawi');
INSERT INTO pais (nombre) VALUES ('Malaysia');
INSERT INTO pais (nombre) VALUES ('Maldives');
INSERT INTO pais (nombre) VALUES ('Mali');
INSERT INTO pais (nombre) VALUES ('Malta');
INSERT INTO pais (nombre) VALUES ('Marshall Islands');
INSERT INTO pais (nombre) VALUES ('Mauritania');
INSERT INTO pais (nombre) VALUES ('Mauritius');
INSERT INTO pais (nombre) VALUES ('Mexico');
INSERT INTO pais (nombre) VALUES ('Micronesia');
INSERT INTO pais (nombre) VALUES ('Moldova');
INSERT INTO pais (nombre) VALUES ('Monaco');
INSERT INTO pais (nombre) VALUES ('Mongolia');
INSERT INTO pais (nombre) VALUES ('Montenegro');
INSERT INTO pais (nombre) VALUES ('Morocco');
INSERT INTO pais (nombre) VALUES ('Mozambique');
INSERT INTO pais (nombre) VALUES ('Myanmar');
INSERT INTO pais (nombre) VALUES ('Namibia');
INSERT INTO pais (nombre) VALUES ('Nauru');
INSERT INTO pais (nombre) VALUES ('Nepal');
INSERT INTO pais (nombre) VALUES ('Netherlands');
INSERT INTO pais (nombre) VALUES ('New Zealand');
INSERT INTO pais (nombre) VALUES ('Nicaragua');
INSERT INTO pais (nombre) VALUES ('Niger');
INSERT INTO pais (nombre) VALUES ('Nigeria');
INSERT INTO pais (nombre) VALUES ('North Korea');
INSERT INTO pais (nombre) VALUES ('North Macedonia');
INSERT INTO pais (nombre) VALUES ('Norway');
INSERT INTO pais (nombre) VALUES ('Oman');
INSERT INTO pais (nombre) VALUES ('Pakistan');
INSERT INTO pais (nombre) VALUES ('Palau');
INSERT INTO pais (nombre) VALUES ('Panama');
INSERT INTO pais (nombre) VALUES ('Papua New Guinea');
INSERT INTO pais (nombre) VALUES ('Paraguay');
INSERT INTO pais (nombre) VALUES ('Peru');
INSERT INTO pais (nombre) VALUES ('Philippines');
INSERT INTO pais (nombre) VALUES ('Poland');
INSERT INTO pais (nombre) VALUES ('Portugal');
INSERT INTO pais (nombre) VALUES ('Qatar');
INSERT INTO pais (nombre) VALUES ('Romania');
INSERT INTO pais (nombre) VALUES ('Russia');
INSERT INTO pais (nombre) VALUES ('Rwanda');
INSERT INTO pais (nombre) VALUES ('Saint Kitts and Nevis');
INSERT INTO pais (nombre) VALUES ('Saint Lucia');
INSERT INTO pais (nombre) VALUES ('Saint Vincent and the Grenadines');
INSERT INTO pais (nombre) VALUES ('Samoa');
INSERT INTO pais (nombre) VALUES ('San Marino');
INSERT INTO pais (nombre) VALUES ('São Tomé and Príncipe');
INSERT INTO pais (nombre) VALUES ('Saudi Arabia');
INSERT INTO pais (nombre) VALUES ('Senegal');
INSERT INTO pais (nombre) VALUES ('Serbia');
INSERT INTO pais (nombre) VALUES ('Seychelles');
INSERT INTO pais (nombre) VALUES ('Sierra Leone');
INSERT INTO pais (nombre) VALUES ('Singapore');
INSERT INTO pais (nombre) VALUES ('Slovakia');
INSERT INTO pais (nombre) VALUES ('Slovenia');
INSERT INTO pais (nombre) VALUES ('Solomon Islands');
INSERT INTO pais (nombre) VALUES ('Somalia');
INSERT INTO pais (nombre) VALUES ('South Africa');
INSERT INTO pais (nombre) VALUES ('South Korea');
INSERT INTO pais (nombre) VALUES ('South Sudan');
INSERT INTO pais (nombre) VALUES ('Spain');
INSERT INTO pais (nombre) VALUES ('Sri Lanka');
INSERT INTO pais (nombre) VALUES ('Sudan');
INSERT INTO pais (nombre) VALUES ('Suriname');
INSERT INTO pais (nombre) VALUES ('Sweden');
INSERT INTO pais (nombre) VALUES ('Switzerland');
INSERT INTO pais (nombre) VALUES ('Syria');
INSERT INTO pais (nombre) VALUES ('Tajikistan');
INSERT INTO pais (nombre) VALUES ('Tanzania');
INSERT INTO pais (nombre) VALUES ('Thailand');
INSERT INTO pais (nombre) VALUES ('Timor-Leste');
INSERT INTO pais (nombre) VALUES ('Togo');
INSERT INTO pais (nombre) VALUES ('Tonga');
INSERT INTO pais (nombre) VALUES ('Trinidad and Tobago');
INSERT INTO pais (nombre) VALUES ('Tunisia');
INSERT INTO pais (nombre) VALUES ('Turkey');
INSERT INTO pais (nombre) VALUES ('Turkmenistan');
INSERT INTO pais (nombre) VALUES ('Tuvalu');
INSERT INTO pais (nombre) VALUES ('Uganda');
INSERT INTO pais (nombre) VALUES ('Ukraine');
INSERT INTO pais (nombre) VALUES ('United Arab Emirates');
INSERT INTO pais (nombre) VALUES ('United Kingdom');
INSERT INTO pais (nombre) VALUES ('United States');
INSERT INTO pais (nombre) VALUES ('Uruguay');
INSERT INTO pais (nombre) VALUES ('Uzbekistan');
INSERT INTO pais (nombre) VALUES ('Vanuatu');
INSERT INTO pais (nombre) VALUES ('Vatican City');
INSERT INTO pais (nombre) VALUES ('Venezuela');
INSERT INTO pais (nombre) VALUES ('Vietnam');
INSERT INTO pais (nombre) VALUES ('Yemen');
INSERT INTO pais (nombre) VALUES ('Zambia');
INSERT INTO pais (nombre) VALUES ('Zimbabwe');

CALL insertar_usuario('user001', 'juan.perez@email.com', '+54123456789', 'Juan', 'Pérez López', 'M', 'Masculino', 1, UNHEX(SHA2('pass123', 256)), TRUE, FALSE);
CALL insertar_usuario('user002', 'maria.gomez@email.com', '+54987654321', 'María', 'Gómez Ruiz', 'F', 'Femenino', 1, UNHEX(SHA2('pass456', 256)), TRUE, FALSE);

CALL insertar_usuario('user003', 'admin1@system.com', '+521234567890', 'Admin', 'Sistema Uno', 'M', 'Masculino', 1, UNHEX(SHA2('adminpass1', 256)), FALSE, TRUE);
CALL insertar_usuario('user004', 'admin2@system.com', '+528765432109', 'Admin', 'Sistema Dos', 'F', 'Femenino', 1, UNHEX(SHA2('adminpass2', 256)), FALSE, TRUE);

CALL insertar_usuario('user005', 'super.admin@email.com', '+55123456789', 'Carlos', 'Rodríguez Silva', 'M', 'Masculino', 1, UNHEX(SHA2('superpass', 256)), TRUE, TRUE);
CALL insertar_usuario('user006', 'super.admin2@email.com', '+557654321', 'Ana', 'Martínez Vargas', 'F', 'Femenino', 1, UNHEX(SHA2('superpass2', 256)), TRUE, TRUE);
