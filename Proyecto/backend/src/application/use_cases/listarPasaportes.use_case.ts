import { Injectable } from "@nestjs/common";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";

@Injectable()
export class ListarPasaportesSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(){
        const pasportes = await this._sistema.listarPasaportes()
        return pasportes
    }
}