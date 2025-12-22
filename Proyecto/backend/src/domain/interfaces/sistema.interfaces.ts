export interface Usuario{
    id: string;
    correo_electronico:string;
    telefono:string;
    nombres:string;
    apellidos:string;
    sexo:string;
    genero:string;
    pais:number;
    contrasenia:string;
    administrador:boolean;
    ciudadano:boolean;
    habilitado:boolean;
}

export interface Pasaporte{
    id_usuario:string;
    tipo_de_pasaporte:string;
    fecha_de_emision:Date;
    fecha_de_vencimiento:Date;
    lugar:string;
    pais_de_emision:number;
    numero_de_pasaporte:string;
    habilitado:boolean;
}

export interface Pais{
    id:number;
    nombre:string;
}