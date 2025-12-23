import { Injectable } from "@nestjs/common";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";

@Injectable()
export class ListarPaisesSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(){
        console.log("Aaaaaaaa")
        const paises = await this._sistema.listarPaises()
        return paises
    }
}