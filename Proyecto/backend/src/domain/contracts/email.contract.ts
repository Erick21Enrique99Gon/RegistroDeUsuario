import { Usuario } from "../interfaces/sistema.interfaces";

export interface EmailContract {
  sendWelcomeEmail(Usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
  }): Promise<void>;
}