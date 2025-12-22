import { Injectable } from "@nestjs/common";
import { RegistrarUsuarioUseCaseRequest } from "../dtos/registrarUsuario_sistema.dto";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";
import { Usuario } from "src/domain/interfaces/sistema.interfaces";
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegistrarUsuarioSistemaUseCase {
    private readonly saltRounds : number = parseInt(process.env.HASH_SALT_ROUNDS || '12', 10);
    constructor(private readonly _sistema: AdministracionContract) {}

    async execute(body: RegistrarUsuarioUseCaseRequest) {

        // Validar nombres (obligatorio)
        if (!body.nombres || body.nombres.trim().length === 0) {
            throw new InvalidRequestError('Los nombres son necesarios');
        }

        // Validar apellidos (obligatorio en JSON proporcionado)
        if (!body.apellidos || body.apellidos.trim().length === 0) {
            throw new InvalidRequestError('Los apellidos son necesarios');
        }

        // Validar correo electrónico (obligatorio y formato)
        if (!body.correo_electronico || body.correo_electronico.trim().length === 0) {
            throw new InvalidRequestError('El correo electrónico es necesario');
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(body.correo_electronico)) {
            throw new InvalidRequestError('El correo electrónico tiene un formato inválido');
        }

        // Validar teléfono (obligatorio)
        if (!body.telefono || body.telefono.trim().length === 0) {
            throw new InvalidRequestError('El teléfono es necesario');
        }

        // Validar país (obligatorio, México = 52)
        if (!body.pais || typeof body.pais !== 'number') {
            throw new InvalidRequestError('El pais no es valido');
        }

        // Validar contraseña hash SHA1 (obligatorio, 40 caracteres hex)
        if (!body.contrasenia || body.contrasenia.trim().length === 0) {
            throw new InvalidRequestError('La contraseña debe ser un hash SHA1 válido (40 caracteres hexadecimales)');
        }
        body.contrasenia = await bcrypt.hash(body.contrasenia, this.saltRounds);
        // Validar sexo (obligatorio)
        if (!body.sexo || body.sexo.trim().length === 0) {
            throw new InvalidRequestError('El sexo es obligatrio');
        }

        // Validar género (obligatorio)
        if (!body.genero || body.genero.trim().length === 0) {
            throw new InvalidRequestError('El género es obligatrio');
        }

        // Validar ciudadano (obligatorio)
        if (body.ciudadano === undefined || typeof body.ciudadano !== 'boolean') {
            throw new InvalidRequestError('El campo ciudadano debe ser verdadero o falso');
        }

        // Validar admin (obligatorio)
        if (body.administrador === undefined || typeof body.administrador !== 'boolean') {
            throw new InvalidRequestError('El campo administrador debe ser verdadero o falso');
        }

        const id = 'D-' + Date.now() + '-' + Math.floor(Math.random() * 1000);        
        
        
        const usuario: Usuario = { 
            id: id,
            correo_electronico: body.correo_electronico,
            telefono: body.telefono,
            nombres: body.nombres,
            apellidos: body.apellidos,
            sexo: body.sexo,
            genero: body.genero,
            pais: body.pais,
            contrasenia: body.contrasenia,
            administrador: body.administrador,
            ciudadano: body.ciudadano,
            habilitado: true 
        };
        await this._sistema.registrarUsuario(usuario)
        var usuarioResponse: Usuario = { 
            ...usuario,
            contrasenia: ""
        };
        return { ok: true,usuarioResponse };
    }
}