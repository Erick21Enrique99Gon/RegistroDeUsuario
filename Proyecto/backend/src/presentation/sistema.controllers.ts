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
import { ListarUsuarioSistemaUseCase } from 'src/application/use_cases/listarUsuario_sistema.use_case';
import { RegistrarPasaporteSistemaUseCase } from 'src/application/use_cases/registrarPasaporte_sistema.use_case';
import { RegistrarPasaporteUseCaseRequest } from 'src/application/dtos/registrarPasaporte_sistema.dto';
import { ObtenerPasaporteSistemaUseCase } from 'src/application/use_cases/obtenerPasaporte_sistema.use_case';
import { HabilitarPasaporteUsuarioSistemaUseCase } from 'src/application/use_cases/habilitarPasaporteUsuario_sistema.use_case';
import { ListarPasaportesSistemaUseCase } from 'src/application/use_cases/listarPasaportes.use_case';
import { ListarPaisesSistemaUseCase } from 'src/application/use_cases/listarPaises_sisstema.use_case';
import { ListarPasaportesUsuarioSistemaUseCase } from 'src/application/use_cases/listarPasaportesUsuario.use_case';

@Controller('')
export class SistemaController {

    constructor(
        private readonly _registrarUsuarioUseCase:RegistrarUsuarioSistemaUseCase,
        private readonly _obtenerUsuarioUsecase:ObtenerUsuarioSistemaUseCase,
        private readonly _modifcarUsuarioUseCase:ModifcarUsuarioSistemaUseCase,
        private readonly _toggleUsuarioSistemaUseCase:ToggleUsuarioSistemaUseCase,
        private readonly _contraseniaUsuarioSistemaUseCase:ContraseniaUsuarioSistemaUseCase,
        private readonly _autenticarUsuarioSistemaUseCase:AutenticarUsuarioSistemaUseCase,
        private readonly _listarUsuarioSistemaUseCase:ListarUsuarioSistemaUseCase,
        private readonly _registrarPasaporteSistemaUseCase:RegistrarPasaporteSistemaUseCase,
        private readonly _obtenerPasaporteSistemaUseCase:ObtenerPasaporteSistemaUseCase,
        private readonly _habilitarPasaporteUsuarioSistemaUseCase:HabilitarPasaporteUsuarioSistemaUseCase,
        private readonly _listarPasaportesSistemaUseCase:ListarPasaportesSistemaUseCase,
        private readonly _listarPaisesSistemaUseCase:ListarPaisesSistemaUseCase,
        private readonly _listarPasaportesUsuarioSistemaUseCase:ListarPasaportesUsuarioSistemaUseCase
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

    @Get('listarUsuarios')
    async listarUsuarios() {
        try {
            return await this._listarUsuarioSistemaUseCase.execute();
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
                throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('registrarPasaporte')
    async registrarPasaporte(@Body() body:RegistrarPasaporteUseCaseRequest) {
        try {
            console.log(typeof body.fecha_de_emision)
            body.fecha_de_emision = new Date(body.fecha_de_emision)
            body.fecha_de_vencimiento = new Date(body.fecha_de_vencimiento)
            return await this._registrarPasaporteSistemaUseCase.execute(body)
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Get('obtenerPasaporte/:usuarioId/:pasaporte/:lugar')
    async obtenerPasaporte(@Param('usuarioId') usuarioId: string,@Param('pasaporte') pasaporte: string,@Param('lugar') lugar: string) {
        try {
            return await this._obtenerPasaporteSistemaUseCase.execute(usuarioId,pasaporte,lugar)
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('habilitarPasaporteUsuario/:usuarioId/:pasaporte/:lugar')
    async habilitarPasaporteUsuario(@Param('usuarioId') usuarioId: string,@Param('pasaporte') pasaporte: string,@Param('lugar') lugar: string) {
        try {
            return await this._habilitarPasaporteUsuarioSistemaUseCase.execute(usuarioId,pasaporte,lugar)
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
            throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Get('listarPasaportes')
    async listarPasaportes() {
        try {
            return await this._listarPasaportesSistemaUseCase.execute();
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
                throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post('listarPasaportesUsuario/:usuarioId')
    async listarPasaportesUsuario(@Param('usuarioId') usuarioId: string) {
        try {
            return await this._listarPasaportesUsuarioSistemaUseCase.execute(usuarioId);
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
                throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Get('listarPaises')
    async listarPaise() {
        try {
            return await this._listarPaisesSistemaUseCase.execute();
        } catch (e) {
            if (e instanceof InvalidRequestError) {
            // 400 + mensaje legible
                throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

}