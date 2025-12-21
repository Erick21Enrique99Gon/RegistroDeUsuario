export class ModificarUsuarioUseCaseRequest{
    id:string;
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