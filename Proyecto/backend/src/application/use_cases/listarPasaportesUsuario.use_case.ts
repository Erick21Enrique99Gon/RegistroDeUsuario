import { Injectable } from "@nestjs/common";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";

@Injectable()
export class ListarPasaportesUsuarioSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(id_usuario:string){
        if (!id_usuario || id_usuario.trim().length === 0) {
            throw new InvalidRequestError('El identificador es necesarios');
        }

        const pasportes = await this._sistema.listarPasaportesUsuario(id_usuario)
        return pasportes
    }
}