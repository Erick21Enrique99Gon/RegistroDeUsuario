# Diagrama Conceptual

![Diagrama de Base de datos](./IBD/Diagrama-Diagrama%20Logico.drawio.svg)


# Base de dato en Database Markup Language

```bash
table usuarios{
  id varchar2 [pk, not null]
  correo_electronico varchar2 [not null,unique]
  telefono varchar2 [not null]
  nombres varchar2 [not null]
  apellidos varchar2 [not null]
  sexo varchar2 [not null]
  genero varchar2 [not null]
  pais integer [not null]
  contraseña varbinary [not null]
  administrador boolean [not null]
  ciudadano boolean [not null]
  habilitado boolean [not null]
}


table pasaporte{
  id_usuario varchar2 [not null]
  tipo_de_pasaporte varchar2 [not null]
  fecha_de_emision datetime [not null]
  fecha_de_vencimiento datetime [not null]
  lugar varchar [not null]
  pais_de_emision integer [not null]
  numero_de_pasaporte varchar [not null]
  activo boolean [not null]
}

table pais{
  id integer [pk, not null]
  nombre varchar [not null]
}

Ref: "pais"."id" < "pasaporte"."pais_de_emision"

Ref: "pais"."id" < "usuarios"."pais"

Ref: "usuarios"."id" < "pasaporte"."id_usuario"
```

