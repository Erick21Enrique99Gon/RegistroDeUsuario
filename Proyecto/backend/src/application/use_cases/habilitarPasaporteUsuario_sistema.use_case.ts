import { Injectable } from "@nestjs/common";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";

@Injectable()
export class HabilitarPasaporteUsuarioSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(id_usuario:string,numero_de_pasaporte:string,lugar:string){
        if (!id_usuario || id_usuario.trim().length === 0) {
            throw new InvalidRequestError('El identificador es necesarios');
        }
        
        if (!numero_de_pasaporte || numero_de_pasaporte.trim().length === 0) {
            throw new InvalidRequestError('El numero de pasaporte es necesarios');
        }
        
        if (!lugar || lugar.trim().length === 0) {
            throw new InvalidRequestError('El lugar es necesarios');
        }
        
        await this._sistema.habilitarPasaporteUsuario(id_usuario,numero_de_pasaporte,lugar)
        return { ok: true };
    }
}