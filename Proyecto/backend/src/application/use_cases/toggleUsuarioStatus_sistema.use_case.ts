import { Injectable } from "@nestjs/common";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";

@Injectable()
export class ToggleUsuarioSistemaUseCase{
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(id: string){
        
        if (!id || id.trim().length === 0) {
            throw new InvalidRequestError('El identificador es necesarios');
        }
        await this._sistema.toggleUsuarioStatus(id)
        return { ok: true };
    }
}