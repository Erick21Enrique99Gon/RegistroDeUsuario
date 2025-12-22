create data base ProyectoDB;

use ProyectoDB;

CREATE TABLE `usuarios` (
  `id` varchar2 PRIMARY KEY NOT NULL,
  `correo_electronico` varchar2 NOT NULL,
  `telefono` varchar2 NOT NULL,
  `nombres` varchar2 NOT NULL,
  `apellidos` varchar2 NOT NULL,
  `sexo` varchar2 NOT NULL,
  `genero` varchar2 NOT NULL,
  `pais` integer NOT NULL,
  `contrasenia` varbinary NOT NULL,
  `administrador` boolean NOT NULL,
  `ciudadano` boolean NOT NULL,
  `habilitado` boolean NOT NULL
);

CREATE TABLE `pasaporte` (
  `tipo_de_pasaporte` varchar2 NOT NULL,
  `fecha_de_emision` datetime NOT NULL,
  `fecha_de_vencimiento` datetime NOT NULL,
  `lugar` varchar(255) NOT NULL,
  `pais_de_emision` integer NOT NULL,
  `numero_de_pasaporte` varchar(255) NOT NULL,
  `activo` boolean NOT NULL
);

CREATE TABLE `pais` (
  `id` integer PRIMARY KEY NOT NULL,
  `nombre` varchar(255) NOT NULL
);

ALTER TABLE `pasaporte` ADD FOREIGN KEY (`pais_de_emision`) REFERENCES `pais` (`id`);

ALTER TABLE `usuarios` ADD FOREIGN KEY (`pais`) REFERENCES `pais` (`id`);
