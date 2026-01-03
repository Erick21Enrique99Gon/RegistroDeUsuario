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

-- 5. Habilitar solo un pasaport

DELIMITER $$

DROP PROCEDURE IF EXISTS habilitar_pasaporte$$

CREATE PROCEDURE habilitar_pasaporte(
    IN p_id_usuario VARCHAR(50),
    IN p_numero_pasaporte VARCHAR(50),
    IN p_lugar VARCHAR(255)
)
MODIFIES SQL DATA
BEGIN
    DECLARE pasaporte_existe INT DEFAULT 0;
    DECLARE filas_afectadas INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'ERROR_INTERNO: No se pudo completar la operación' AS resultado;
    END;

    START TRANSACTION;

    -- 1. Verificar que el pasaporte existe (LOCK)
    SELECT COUNT(*) INTO pasaporte_existe
    FROM pasaporte
    WHERE id_usuario = p_id_usuario
      AND numero_de_pasaporte = p_numero_pasaporte
      AND lugar = p_lugar
    FOR UPDATE;

    IF pasaporte_existe = 0 THEN
        ROLLBACK;
        SELECT 'ERROR_PASAPORTE_INEXISTENTE: Pasaporte no encontrado' AS resultado;
    ELSE
        -- 2. ✅ AUTO-DESHABILITAR TODOS los otros y habilitar este
        UPDATE pasaporte SET habilitado = FALSE WHERE id_usuario = p_id_usuario;
        SET filas_afectadas = ROW_COUNT();

        UPDATE pasaporte SET habilitado = TRUE 
        WHERE id_usuario = p_id_usuario
          AND numero_de_pasaporte = p_numero_pasaporte
          AND lugar = p_lugar;
        SET filas_afectadas = filas_afectadas + ROW_COUNT();

        IF filas_afectadas > 0 THEN
            COMMIT;
            SELECT 'SUCCESS_HABILITADO: Pasaporte habilitado (otros desactivados automáticamente)' AS resultado;
        ELSE
            ROLLBACK;
            SELECT 'ERROR_PASAPORTE_MODIFICADO: Pasaporte fue modificado por otro proceso' AS resultado;
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

CALL insertar_usuario('user007', 'lucia.lopez@example.com', '+50212340001', 'Lucía', 'López Hernández', 'F', 'Femenino', 94, UNHEX(SHA2('Lucia2024!', 256)), FALSE, TRUE);
CALL insertar_usuario('user008', 'carlos.mendez@example.com', '+50212340002', 'Carlos', 'Méndez Ruiz', 'M', 'Masculino', 94, UNHEX(SHA2('CarMend#45', 256)), FALSE, TRUE);
CALL insertar_usuario('user009', 'sofia.ramirez@example.com', '+50212340003', 'Sofía', 'Ramírez Soto', 'F', 'Femenino', 94, UNHEX(SHA2('Sofi*890', 256)), FALSE, TRUE);
CALL insertar_usuario('user010', 'jose.martinez@example.com', '+50212340004', 'José', 'Martínez Pérez', 'M', 'Masculino', 94, UNHEX(SHA2('JoseMP_123', 256)), FALSE, TRUE);
CALL insertar_usuario('user011', 'andrea.garcia@example.com', '+50212340005', 'Andrea', 'García López', 'F', 'Femenino', 94, UNHEX(SHA2('AndGarc!55', 256)), FALSE, TRUE);

CALL insertar_usuario('user012', 'admin.guate1@example.com', '+50212340006', 'Admin', 'Guatemala Uno', 'M', 'Masculino', 94, UNHEX(SHA2('AdmGua1$', 256)), TRUE, TRUE);
CALL insertar_usuario('user013', 'admin.guate2@example.com', '+50212340007', 'Admin', 'Guatemala Dos', 'F', 'Femenino', 94, UNHEX(SHA2('AdmGua2$', 256)), TRUE, TRUE);
CALL insertar_usuario('user014', 'ciudadano1@example.com', '+50212340008', 'Luis', 'Pérez Díaz', 'M', 'Masculino', 94, UNHEX(SHA2('LuisP#2024', 256)), FALSE, TRUE);
CALL insertar_usuario('user015', 'ciudadano2@example.com', '+50212340009', 'María', 'Fernández Solís', 'F', 'Femenino', 94, UNHEX(SHA2('MarFer_77', 256)), FALSE, TRUE);
CALL insertar_usuario('user016', 'ciudadano3@example.com', '+50212340010', 'Diego', 'Castillo Torres', 'M', 'Masculino', 94, UNHEX(SHA2('DieCast!9', 256)), FALSE, TRUE);

CALL insertar_usuario('user017', 'no.binario1@example.com', '+50212340011', 'Alex', 'Guzmán López', 'X', 'No Binario', 94, UNHEX(SHA2('AlexNB_01', 256)), FALSE, TRUE);
CALL insertar_usuario('user018', 'funcionario1@example.com', '+50212340012', 'Ricardo', 'Santos Mejía', 'M', 'Masculino', 94, UNHEX(SHA2('Func1Ric$', 256)), TRUE, FALSE);
CALL insertar_usuario('user019', 'funcionario2@example.com', '+50212340013', 'Patricia', 'Vargas León', 'F', 'Femenino', 94, UNHEX(SHA2('Func2Pat#', 256)), TRUE, FALSE);
CALL insertar_usuario('user020', 'user.exterior1@example.com', '+34900123456', 'Javier', 'Ortiz Gómez', 'M', 'Masculino', 179, UNHEX(SHA2('JavOrt!23', 256)), FALSE, TRUE);
CALL insertar_usuario('user021', 'user.exterior2@example.com', '+12025550111', 'Emily', 'Johnson', 'F', 'Femenino', 195, UNHEX(SHA2('EmilyUSA_5', 256)), FALSE, TRUE);

CALL insertar_usuario('user022', 'superadmin1@example.com', '+50212340014', 'Super', 'Admin Uno', 'M', 'Masculino', 94, UNHEX(SHA2('SupAdm1!!', 256)), TRUE, TRUE);
CALL insertar_usuario('user023', 'superadmin2@example.com', '+50212340015', 'Super', 'Admin Dos', 'F', 'Femenino', 94, UNHEX(SHA2('SupAdm2!!', 256)), TRUE, TRUE);
CALL insertar_usuario('user024', 'test.duplicado@example.com', '+50212340016', 'Prueba', 'Duplicado Uno', 'M', 'Masculino', 94, UNHEX(SHA2('TestDup1%', 256)), FALSE, TRUE);
CALL insertar_usuario('user025', 'test.duplicado@example.com', '+50212340017', 'Prueba', 'Duplicado Dos', 'F', 'Femenino', 94, UNHEX(SHA2('TestDup2%', 256)), FALSE, TRUE); -- ERROR_EMAIL_DUPLICADO
CALL insertar_usuario('user026', 'pais.invalido@example.com', '+50212340018', 'Pais', 'Invalido', 'M', 'Masculino', 999, UNHEX(SHA2('PaisInv#1', 256)), FALSE, TRUE); -- ERROR_PAIS_INVALIDO

-- Para user001 (Juan Pérez - Argentina país 1)
CALL insertar_pasaporte('user001', 'Ordinario', '2020-01-15 00:00:00', '2030-01-15 00:00:00', 'Buenos Aires', 1, 'AB123456');
CALL insertar_pasaporte('user001', 'Emergencia', '2023-06-10 00:00:00', '2026-06-10 00:00:00', 'Córdoba', 1, 'CD789012');
CALL insertar_pasaporte('user001', 'Diplomático', '2021-03-20 00:00:00', '2031-03-20 00:00:00', 'Rosario', 1, 'EF345678');

-- Para user002 (María Gómez - Argentina país 1)
CALL insertar_pasaporte('user002', 'Ordinario', '2019-11-05 00:00:00', '2029-11-05 00:00:00', 'Mendoza', 1, 'GH901234');
CALL insertar_pasaporte('user002', 'Turista', '2024-02-14 00:00:00', '2027-02-14 00:00:00', 'Salta', 1, 'IJ567890');

-- Para user003 (Admin Sistema - México país 140)
CALL insertar_pasaporte('user003', 'Oficial', '2022-08-01 00:00:00', '2032-08-01 00:00:00', 'Ciudad de México', 140, 'KL123456');
CALL insertar_pasaporte('user003', 'Ordinario', '2021-05-12 00:00:00', '2031-05-12 00:00:00', 'Guadalajara', 140, 'MN789012');
CALL insertar_pasaporte('user003', 'Temporal', '2023-12-20 00:00:00', '2028-12-20 00:00:00', 'Monterrey', 140, 'OP345678');
CALL insertar_pasaporte('user003', 'Emergencia', '2024-01-15 00:00:00', '2026-01-15 00:00:00', 'Puebla', 140, 'QR901234');

-- Para user007 (Lucía López - Guatemala 94) - 6 pasaportes
CALL insertar_pasaporte('user007', 'Ordinario', '2022-04-10 00:00:00', '2032-04-10 00:00:00', 'Guatemala City', 94, 'GT00123456');
CALL insertar_pasaporte('user007', 'Duplicado', '2020-09-15 00:00:00', '2030-09-15 00:00:00', 'Quetzaltenango', 94, 'GT78901234');
CALL insertar_pasaporte('user007', 'Temporal', '2023-07-22 00:00:00', '2028-07-22 00:00:00', 'Antigua Guatemala', 94, 'GT34567890');
CALL insertar_pasaporte('user007', 'Emergencia', '2024-03-05 00:00:00', '2026-03-05 00:00:00', 'Escuintla', 94, 'GT90123456');
CALL insertar_pasaporte('user007', 'Oficial', '2021-11-30 00:00:00', '2031-11-30 00:00:00', 'Cobán', 94, 'GT56789012');
CALL insertar_pasaporte('user007', 'Turista', '2022-12-18 00:00:00', '2027-12-18 00:00:00', 'Puerto Barrios', 94, 'GT23456789');

-- Para user012 (Admin Guatemala - Guatemala 94) - 4 pasaportes
CALL insertar_pasaporte('user012', 'Administrativo', '2023-01-01 00:00:00', '2033-01-01 00:00:00', 'Ministerio Guatemala', 94, 'ADM001234');
CALL insertar_pasaporte('user012', 'Ordinario', '2021-06-15 00:00:00', '2031-06-15 00:00:00', 'Guatemala City', 94, 'ADM567890');
CALL insertar_pasaporte('user012', 'Temporal', '2024-05-20 00:00:00', '2029-05-20 00:00:00', 'Zacapa', 94, 'ADM123789');
CALL insertar_pasaporte('user012', 'Duplicado', '2019-10-10 00:00:00', '2029-10-10 00:00:00', 'Chiquimula', 94, 'ADM456012');

-- Para user020 (Javier Ortiz - España 179) - 3 pasaportes
CALL insertar_pasaporte('user020', 'Ordinario', '2021-02-28 00:00:00', '2031-02-28 00:00:00', 'Madrid', 179, 'ES1234567Z');
CALL insertar_pasaporte('user020', 'Duplicado', '2018-07-12 00:00:00', '2028-07-12 00:00:00', 'Barcelona', 179, 'ES8901234X');
CALL insertar_pasaporte('user020', 'Temporal', '2023-11-05 00:00:00', '2028-11-05 00:00:00', 'Valencia', 179, 'ES5678901W');

-- Para user022 (Superadmin1 - Guatemala 94) - 2 pasaportes
CALL insertar_pasaporte('user022', 'Especial SuperAdmin', '2024-01-01 00:00:00', '2040-01-01 00:00:00', 'SuperAdmin HQ', 94, 'SUP001234');
CALL insertar_pasaporte('user022', 'Backup', '2023-06-01 00:00:00', '2033-06-01 00:00:00', 'Guatemala City', 94, 'SUP567890');

-- user001 (Juan Pérez)
CALL insertar_pasaporte('user001', 'Ordinario', '2020-01-15 00:00:00', '2030-01-15 00:00:00', 'Buenos Aires', 1, 'AB123456');
CALL habilitar_pasaporte('user001', 'AB123456', 'Buenos Aires');

-- user002 (María Gómez)
CALL insertar_pasaporte('user002', 'Ordinario', '2019-11-05 00:00:00', '2029-11-05 00:00:00', 'Mendoza', 1, 'GH901234');
CALL habilitar_pasaporte('user002', 'GH901234', 'Mendoza');

-- user003 (Admin Sistema)
CALL insertar_pasaporte('user003', 'Oficial', '2022-08-01 00:00:00', '2032-08-01 00:00:00', 'Ciudad de México', 140, 'KL123456');
CALL habilitar_pasaporte('user003', 'KL123456', 'Ciudad de México');

-- user004 (Admin Sistema Dos)
CALL insertar_pasaporte('user004', 'Oficial', '2022-09-01 00:00:00', '2032-09-01 00:00:00', 'Monterrey', 140, 'MN789012');
CALL habilitar_pasaporte('user004', 'MN789012', 'Monterrey');

-- user005 (Carlos SuperAdmin)
CALL insertar_pasaporte('user005', 'SuperAdmin', '2023-01-01 00:00:00', '2040-01-01 00:00:00', 'Brasilia', 1, 'SUP001234');
CALL habilitar_pasaporte('user005', 'SUP001234', 'Brasilia');

-- user006 (Ana SuperAdmin)
CALL insertar_pasaporte('user006', 'SuperAdmin', '2023-02-01 00:00:00', '2040-02-01 00:00:00', 'Rio de Janeiro', 1, 'SUP567890');
CALL habilitar_pasaporte('user006', 'SUP567890', 'Rio de Janeiro');

-- user007 (Lucía Guatemala) ★
CALL insertar_pasaporte('user007', 'Ordinario', '2022-04-10 00:00:00', '2032-04-10 00:00:00', 'Guatemala City', 94, 'GT00123456');
CALL habilitar_pasaporte('user007', 'GT00123456', 'Guatemala City');

-- user008 (Carlos Méndez Guatemala)
CALL insertar_pasaporte('user008', 'Ordinario', '2023-05-20 00:00:00', '2033-05-20 00:00:00', 'Antigua Guatemala', 94, 'GT23456789');
CALL habilitar_pasaporte('user008', 'GT23456789', 'Antigua Guatemala');

-- user009 (Sofía Guatemala)
CALL insertar_pasaporte('user009', 'Temporal', '2021-08-15 00:00:00', '2031-08-15 00:00:00', 'Quetzaltenango', 94, 'GT34567890');
CALL habilitar_pasaporte('user009', 'GT34567890', 'Quetzaltenango');

-- user010 (José Guatemala)
CALL insertar_pasaporte('user010', 'Ordinario', '2020-12-01 00:00:00', '2030-12-01 00:00:00', 'Cobán', 94, 'GT45678901');
CALL habilitar_pasaporte('user010', 'GT45678901', 'Cobán');

-- user011 (Andrea Guatemala)
CALL insertar_pasaporte('user011', 'Turista', '2023-03-10 00:00:00', '2028-03-10 00:00:00', 'Puerto Barrios', 94, 'GT56789012');
CALL habilitar_pasaporte('user011', 'GT56789012', 'Puerto Barrios');

-- user012 (Admin Guatemala)
CALL insertar_pasaporte('user012', 'Administrativo', '2023-01-01 00:00:00', '2033-01-01 00:00:00', 'Ministerio Guatemala', 94, 'ADM001234');
CALL habilitar_pasaporte('user012', 'ADM001234', 'Ministerio Guatemala');

-- user013 (Admin Guatemala Dos)
CALL insertar_pasaporte('user013', 'Administrativo', '2023-01-02 00:00:00', '2033-01-02 00:00:00', 'Dirección General', 94, 'ADM567890');
CALL habilitar_pasaporte('user013', 'ADM567890', 'Dirección General');

-- user014 (Luis Guatemala)
CALL insertar_pasaporte('user014', 'Ordinario', '2022-07-25 00:00:00', '2032-07-25 00:00:00', 'Escuintla', 94, 'GT67890123');
CALL habilitar_pasaporte('user014', 'GT67890123', 'Escuintla');

-- user015 (María Fernández Guatemala)
CALL insertar_pasaporte('user015', 'Ordinario', '2021-10-30 00:00:00', '2031-10-30 00:00:00', 'Zacapa', 94, 'GT78901234');
CALL habilitar_pasaporte('user015', 'GT78901234', 'Zacapa');

-- user016 (Diego Guatemala)
CALL insertar_pasaporte('user016', 'Temporal', '2023-04-12 00:00:00', '2028-04-12 00:00:00', 'Chiquimula', 94, 'GT89012345');
CALL habilitar_pasaporte('user016', 'GT89012345', 'Chiquimula');

-- user017 (Alex No Binario Guatemala)
CALL insertar_pasaporte('user017', 'Ordinario', '2022-11-18 00:00:00', '2032-11-18 00:00:00', 'Huehuetenango', 94, 'GT90123456');
CALL habilitar_pasaporte('user017', 'GT90123456', 'Huehuetenango');

-- user018 (Ricardo Guatemala)
CALL insertar_pasaporte('user018', 'Funcionario', '2023-02-15 00:00:00', '2033-02-15 00:00:00', 'Jutiapa', 94, 'FUNC001234');
CALL habilitar_pasaporte('user018', 'FUNC001234', 'Jutiapa');

-- user019 (Patricia Guatemala)
CALL insertar_pasaporte('user019', 'Funcionario', '2023-02-16 00:00:00', '2033-02-16 00:00:00', 'Santa Rosa', 94, 'FUNC567890');
CALL habilitar_pasaporte('user019', 'FUNC567890', 'Santa Rosa');

-- user020 (Javier España)
CALL insertar_pasaporte('user020', 'Ordinario', '2021-02-28 00:00:00', '2031-02-28 00:00:00', 'Madrid', 179, 'ES1234567Z');
CALL habilitar_pasaporte('user020', 'ES1234567Z', 'Madrid');

-- user021 (Emily USA)
CALL insertar_pasaporte('user021', 'Turista', '2022-05-10 00:00:00', '2032-05-10 00:00:00', 'New York', 195, 'US9012345A');
CALL habilitar_pasaporte('user021', 'US9012345A', 'New York');

-- user022 (Superadmin1 Guatemala)
CALL insertar_pasaporte('user022', 'SuperAdmin', '2024-01-01 00:00:00', '2040-01-01 00:00:00', 'SuperAdmin HQ', 94, 'SUP001234');
CALL habilitar_pasaporte('user022', 'SUP001234', 'SuperAdmin HQ');

-- user023 (Superadmin2 Guatemala)
CALL insertar_pasaporte('user023', 'SuperAdmin', '2024-01-02 00:00:00', '2040-01-02 00:00:00', 'Backup HQ', 94, 'SUP567890');
CALL habilitar_pasaporte('user023', 'SUP567890', 'Backup HQ');

-- user024 (Prueba Guatemala)
CALL insertar_pasaporte('user024', 'Test', '2024-01-03 00:00:00', '2029-01-03 00:00:00', 'Test City', 94, 'TEST001234');
CALL habilitar_pasaporte('user024', 'TEST001234', 'Test City');
