import { Usuario, Pasaporte } from "../interfaces/sistema.interfaces";

export abstract class AdministracionContract{
    public abstract registrarUsuario(usuario:Usuario):Promise<void>;
}