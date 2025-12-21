import { Usuario, Pasaporte } from "../interfaces/sistema.interfaces";

export abstract class AdministracionContract{
    public abstract registrarUsuario(usuario:Usuario):Promise<void>;
    public abstract obtenerUsuario(id:string):Promise<Usuario>;
    public abstract modificarUsuario(usuario:Usuario):Promise<void>;
    public abstract deshabilitarUsuario(id:string):Promise<void>;
    public abstract habilitarUsuario(id:string):Promise<void>;
    public abstract autenticarUsuario(contrasenia:string):Promise<void>;
    public abstract listarUsuario():Promise<Usuario[]>;
    public abstract registrarPasaporte(pasaporte:Pasaporte):Promise<void>;
    public abstract obtenerPasaporte(id_usuario:string,numero_de_pasaporte:string):Promise<Pasaporte>
    public abstract habilitarPasaporteUsuario(id_usuario:string,numero_de_pasaporte:string):Promise<void>;
    public abstract deshabilitarPasaporteUsuario(id_usuario:string,numero_de_pasaporte:string):Promise<void>;
    public abstract listarPasaportes():Promise<Pasaporte[]>
    public abstract listarPasaportesUsuario(id_usuario:string):Promise<Pasaporte[]>
}