import { Injectable } from "@nestjs/common";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";

@Injectable()
export class ObtenerUsuarioSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(id: string){
        
        if (!id || id.trim().length === 0) {
            throw new InvalidRequestError('El identificador es necesarios');
        }
        var usuario = await this._sistema.obtenerUsuario(id)
        usuario.contrasenia = ""
        return usuario
    }
}