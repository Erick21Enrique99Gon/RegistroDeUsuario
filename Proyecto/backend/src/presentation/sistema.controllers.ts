import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import axios from 'axios';
import { InvalidRequestError } from 'src/domain/errors/invalid_request.error';
import { BadRequestException } from '@nestjs/common';

import { RegistrarUsuarioUseCaseRequest } from 'src/application/dtos/registrarUsuario_sistema.dto';

import { RegistrarUsuarioSistemaUseCase } from 'src/application/use_cases/registrarUsuario_sistema.use_case';
import { ObtenerUsuarioSistemaUseCase } from 'src/application/use_cases/obtenerUsuario_sistema.use_case';
import { ModifcarUsuarioSistemaUseCase } from 'src/application/use_cases/modificarUsuario_sistema.use_case';
import { ModificarUsuarioUseCaseRequest } from 'src/application/dtos/modificarUsuario_sistema.dto';
import { ToggleUsuarioSistemaUseCase } from 'src/application/use_cases/toggleUsuarioStatus_sistema.use_case';
import { ContraseniaUsuarioSistemaUseCase } from 'src/application/use_cases/contraseniaUsuario_sistema.use_case';
import { ContraseniaUsuarioUseCaseRequest } from 'src/application/dtos/contraseniaUsuario_sistema.dto';
import { AutenticarUsuarioSistemaUseCase } from 'src/application/use_cases/autenticarUsuario_sistema.use_case';
@Controller('')
export class SistemaController {

    constructor(
        private readonly _registrarUsuarioUseCase:RegistrarUsuarioSistemaUseCase,
        private readonly _obtenerUsuarioUsecase:ObtenerUsuarioSistemaUseCase,
        private readonly _modifcarUsuarioUseCase:ModifcarUsuarioSistemaUseCase,
        private readonly _toggleUsuarioSistemaUseCase:ToggleUsuarioSistemaUseCase,
        private readonly _contraseniaUsuarioSistemaUseCase:ContraseniaUsuarioSistemaUseCase,
        private readonly _autenticarUsuarioSistemaUseCase:AutenticarUsuarioSistemaUseCase
    ) { }

    @Get('health/ready')
    getHealthReady() {
        return { status: 'ready' };
    }
    @Get('health/live')
    getHealthLive() {
        return { status: 'live' };
    }
    
    @Post('registroUsuario')
    async registrarUsuario(@Body() body: RegistrarUsuarioUseCaseRequest) {
        try {
            return await this._registrarUsuarioUseCase.execute(body);
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Get('obtenerUsuario/:id')
    async obtenerUsuario(@Param('id') id: string) {
        try {
            return await this._obtenerUsuarioUsecase.execute(id);
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('modificarUsuario')
    async modificarUsuario(@Body() body: ModificarUsuarioUseCaseRequest) {
        try {
            return await this._modifcarUsuarioUseCase.execute(body);
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('/status/:id') 
    async toggleUsuarioStatus(@Param('id') id: string) {
        try {
            return await this._toggleUsuarioSistemaUseCase.execute(id);
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('/contraseniaUsuario') 
    async contraseniaUsuario(@Body() body: ContraseniaUsuarioUseCaseRequest) {
        try {
            return await this._contraseniaUsuarioSistemaUseCase.execute(body);
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('autenticarUsuario')
    async autenticarUsuario(@Body() body: ContraseniaUsuarioUseCaseRequest) {
        try {
            return await this._autenticarUsuarioSistemaUseCase.execute(body);
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('listarUsuarios')
    async listarUsuarios(@Body() body) {
        console.log(`Usuarios: ${body}`);
        return { status: 'Usuarios', token: 'token-de-ejemplo' };
    }

    @Post('registrarPasaporte')
    async registrarPasaporte(@Body() body) {
        console.log(`Registrando pasaporte: ${body}`);
        return { status: 'Pasaporte registrado' };
    }

    @Get('obtenerPasaporte/:usuarioId/:pasaporteId')
    async obtenerPasaporte(@Param('id') id: string) {
        console.log(`Obteniendo pasaporte con ID: ${id}`);
        return { id, nombre: 'pasaporte de ejemplo' };
    }

    @Post('habilitarPasaporteUsuario/:usuarioId/:pasaporteId')
    async habilitarPasaporteUsuario(
        @Param('usuarioId') usuarioId: string,
        @Param('pasaporteId') pasaporteId: string,
    ) {
        console.log(`habilitar pasaporte ${pasaporteId} con usuario ${usuarioId}`);
        return { status: 'Pasaporte habilitar de usuario' };
    }

    @Post('deshabilitarPasaporteUsuario/:usuarioId/:pasaporteId')
    async deshabilitarPasaporteUsuario(
        @Param('usuarioId') usuarioId: string,
        @Param('pasaporteId') pasaporteId: string,
    ) {
        console.log(`deshabilitar pasaporte ${pasaporteId} con usuario ${usuarioId}`);
        return { status: 'Pasaporte deshabilitar de usuario' };
    }

    @Post('listarPasaportes')
    async listarPasaportes(@Body() body) {
        console.log(`Pasaportes: ${body}`);
        return { status: 'Pasaportes', token: 'token-de-ejemplo' };
    }

    @Post('listarPasaportesUsuario')
    async listarPasaportesUsuario(@Body() body) {
        console.log(`Pasaportes de usuario: ${body}`);
        return { status: 'Pasaportes de usuario', token: 'token-de-ejemplo' };
    }


}