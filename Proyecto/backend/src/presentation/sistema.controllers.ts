import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import axios from 'axios';

@Controller('')
export class SistemaController {
    @Get('health/ready')
    getHealthReady() {
        return { status: 'ready' };
    }
    @Get('health/live')
    getHealthLive() {
        return { status: 'live' };
    }
    
    @Post('registroUsuario')
    async registrarUsuario(@Body() body) {
        console.log(`Registrando usuario: ${body}`);
        return { status: 'Usuario registrado' };
    }

    @Get('obtenerUsuario/:id')
    async obtenerUsuario(@Param('id') id: string) {
        console.log(`Obteniendo usuario con ID: ${id}`);
        return { id, nombre: 'Usuario de ejemplo' };
    }

    @Post('modificarUsuario')
    async modificarUsuario(@Body() body) {
        console.log(`Modificando usuario: ${body}`);
        return { status: 'Usuario modificado' };
    }

    @Post('deshabilitarUsuario/:id')
    async deshabilitarUsuario(@Param('id') id: string) {
        console.log(`deshabilitando usuario con ID: ${id}`);
        return { status: 'Usuario deshabilitado' };
    }
    @Post('autenticarUsuario')
    async autenticarUsuario(@Body() body) {
        console.log(`Autenticando usuario: ${body}`);
        return { status: 'Usuario autenticado', token: 'token-de-ejemplo' };
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

    @Get('obtenerPasaporte/:id')
    async obtenerPasaporte(@Param('id') id: string) {
        console.log(`Obteniendo pasaporte con ID: ${id}`);
        return { id, nombre: 'pasaporte de ejemplo' };
    }

    @Post('asignarPasaporteUsuario/:usuarioId/:pasaporteId')
    async asignarPasaporteUsuario(
        @Param('usuarioId') usuarioId: string,
        @Param('pasaporteId') pasaporteId: string,
    ) {
        console.log(`Asignando pasaporte ${pasaporteId} al usuario ${usuarioId}`);
        return { status: 'Pasaporte asignado al usuario' };
    }

    @Post('desasignarPasaporteUsuario/:usuarioId/:pasaporteId')
    async desasignarPasaporteUsuario(
        @Param('usuarioId') usuarioId: string,
        @Param('pasaporteId') pasaporteId: string,
    ) {
        console.log(`Asignando pasaporte ${pasaporteId} al usuario ${usuarioId}`);
        return { status: 'Pasaporte asignado al usuario' };
    }

    @Post('listarPasaportes')
    async listarPasaportes(@Body() body) {
        console.log(`Pasaportes: ${body}`);
        return { status: 'Pasaportes', token: 'token-de-ejemplo' };
    }


}