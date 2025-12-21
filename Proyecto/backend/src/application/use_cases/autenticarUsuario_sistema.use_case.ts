import { ContraseniaUsuarioUseCaseRequest } from "../dtos/contraseniaUsuario_sistema.dto";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";
import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutenticarUsuarioSistemaUseCase{
    private readonly saltRounds : number = parseInt(process.env.HASH_SALT_ROUNDS || '12', 10);
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute( body:ContraseniaUsuarioUseCaseRequest){
        if (!body.id || body.id.trim().length === 0) {
            throw new InvalidRequestError('El identificador es necesarios');
        }
        if (!body.contrasenia || body.contrasenia.trim().length === 0) {
            throw new InvalidRequestError('La contrasenia es necesaria');
        }
        const contraseniaSQL =  await this._sistema.autenticarUsuario(body.id)
        const contraseniaHex = Buffer.from(contraseniaSQL).toString('hex');
        const contrasenia = Buffer.from(contraseniaHex, 'hex').toString('utf8')
        const restult = await bcrypt.compare(body.contrasenia, contrasenia)
        return { autenticacion: restult };
    }
}