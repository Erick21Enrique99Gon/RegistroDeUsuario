import { ContraseniaUsuarioUseCaseRequest } from "../dtos/contraseniaUsuario_sistema.dto";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";
import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class ContraseniaUsuarioSistemaUseCase{
    private readonly saltRounds : number = parseInt(process.env.HASH_SALT_ROUNDS || '12', 10);
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute( body:ContraseniaUsuarioUseCaseRequest){
        
        if (!body.id || body.id.trim().length === 0) {
            throw new InvalidRequestError('El identificador es necesarios');
        }
        if (!body.contrasenia || body.contrasenia.trim().length === 0) {
            throw new InvalidRequestError('El nueva contrasenia es necesarios');
        }
        
        body.contrasenia = await bcrypt.hash(body.contrasenia, this.saltRounds);
        await this._sistema.contraseniaUsuario(body.id,body.contrasenia)
        return { ok: true };
    }
}