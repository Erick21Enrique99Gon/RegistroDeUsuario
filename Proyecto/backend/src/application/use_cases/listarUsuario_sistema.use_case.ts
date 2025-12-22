import { Injectable } from "@nestjs/common";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";

@Injectable()
export class ListarUsuarioSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(){
        const usuarios = await this._sistema.listarUsuario()
        return usuarios
    }
}