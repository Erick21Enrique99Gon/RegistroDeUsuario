import { Injectable } from "@nestjs/common";
import { RegistrarPasaporteUseCaseRequest } from "../dtos/registrarPasaporte_sistema.dto";
import { Pasaporte } from "src/domain/interfaces/sistema.interfaces";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";
import { NotFoundError } from "src/domain/errors/not_found.error";
import { HabilitarPasaporteUsuarioSistemaUseCase } from "./habilitarPasaporteUsuario_sistema.use_case";
@Injectable()
export class RegistrarPasaporteSistemaUseCase {
    constructor(
        private readonly administracionRepository: AdministracionContract,
        private readonly habilitarPasaporteUsuarioSistemaUseCase:HabilitarPasaporteUsuarioSistemaUseCase
    ) {}

    async execute(body: RegistrarPasaporteUseCaseRequest) {
        // Validaciones de negocio
        
        
        if (!body.id_usuario?.trim()) {
            throw new InvalidRequestError('ID de usuario requerido');
        }
        
        if (!body.numero_de_pasaporte?.trim()) {
            throw new InvalidRequestError('Número de pasaporte requerido');
        }


        if (!body.fecha_de_emision || !(body.fecha_de_emision instanceof Date)) {
            throw new InvalidRequestError('Fecha de emisión requerida y válida');
        }

        if (!body.fecha_de_vencimiento || !(body.fecha_de_vencimiento instanceof Date)) {
            throw new InvalidRequestError('Fecha de vencimiento requerida y válida');
        }

        if (body.fecha_de_vencimiento <= body.fecha_de_emision) {
            throw new InvalidRequestError('Fecha de vencimiento debe ser posterior a la de emisión');
        }

        if (body.pais_de_emision <= 0) {
            throw new InvalidRequestError('País de emisión inválido');
        }

        if (!body.lugar?.trim()) {
            throw new InvalidRequestError('Lugar de emisión requerido');
        }

        if (!body.tipo_de_pasaporte?.trim()) {
            throw new InvalidRequestError('Tipo de pasaporte inválido');
        }
        

        
        // Mapear DTO a entidad de dominio
        const pasaporte: Pasaporte = {
            id_usuario: body.id_usuario,
            tipo_de_pasaporte: body.tipo_de_pasaporte,
            fecha_de_emision: body.fecha_de_emision,
            fecha_de_vencimiento: body.fecha_de_vencimiento,
            lugar: body.lugar,
            pais_de_emision: body.pais_de_emision,
            numero_de_pasaporte: body.numero_de_pasaporte,
            habilitado: body.habilitado ?? true // Por defecto TRUE como en la tabla
        };

        // Delegar al repositorio
        await this.administracionRepository.registrarPasaporte(pasaporte);
        await this.habilitarPasaporteUsuarioSistemaUseCase.execute(pasaporte.id_usuario,pasaporte.numero_de_pasaporte,pasaporte.lugar)
        return { ok: true };
    }

}