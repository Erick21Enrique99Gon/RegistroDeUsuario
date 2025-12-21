import { Injectable } from "@nestjs/common";
import { RegistrarUsuarioUseCaseRequest } from "../dtos/registrarUsuario_sistema.dto";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";
import { Usuario } from "src/domain/interfaces/sistema.interfaces";

@Injectable()
export class ObtenerUsuarioSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(id: string){
        console.log(id)
        if (!id || id.trim().length === 0) {
            throw new InvalidRequestError('El identificador es necesarios');
        }
        const usuario = await this._sistema.obtenerUsuario(id)
        console.log(id)
        console.log(usuario)
        return usuario
    }
}