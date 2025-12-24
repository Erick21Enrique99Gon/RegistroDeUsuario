import { Module } from "@nestjs/common";
import { SistemaController } from "../presentation/sistema.controllers";
import { MySQLModule } from "./persistance/mysql/mysql.module";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { MySQLAdministracionRepository } from "./persistance/mysql/repository/mysql.repository";
import { RegistrarUsuarioSistemaUseCase } from "src/application/use_cases/registrarUsuario_sistema.use_case";
import { ObtenerUsuarioSistemaUseCase } from "src/application/use_cases/obtenerUsuario_sistema.use_case";
import { ModifcarUsuarioSistemaUseCase } from "src/application/use_cases/modificarUsuario_sistema.use_case";
import { ToggleUsuarioSistemaUseCase } from "src/application/use_cases/toggleUsuarioStatus_sistema.use_case";
import { ContraseniaUsuarioSistemaUseCase } from "src/application/use_cases/contraseniaUsuario_sistema.use_case";
import { AutenticarUsuarioSistemaUseCase } from "src/application/use_cases/autenticarUsuario_sistema.use_case";
import { ListarUsuarioSistemaUseCase } from "src/application/use_cases/listarUsuario_sistema.use_case";
import { RegistrarPasaporteSistemaUseCase } from "src/application/use_cases/registrarPasaporte_sistema.use_case";
import { ObtenerPasaporteSistemaUseCase } from "src/application/use_cases/obtenerPasaporte_sistema.use_case";
import { HabilitarPasaporteUsuarioSistemaUseCase } from "src/application/use_cases/habilitarPasaporteUsuario_sistema.use_case";
import { ListarPasaportesSistemaUseCase } from "src/application/use_cases/listarPasaportes.use_case";
import { ListarPasaportesUsuarioSistemaUseCase } from "src/application/use_cases/listarPasaportesUsuario.use_case";
import { ListarPaisesSistemaUseCase } from "src/application/use_cases/listarPaises_sisstema.use_case";
import { EmailModule } from "./services/email/email.module";
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from "src/presentation/guards/jwt.guard";
@Module({
    imports: [MySQLModule, EmailModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'tu-secret-key',
            signOptions: { expiresIn: '24h' }
        })
    ],
    controllers: [SistemaController],
    providers: [
        RegistrarUsuarioSistemaUseCase,
        ObtenerUsuarioSistemaUseCase,
        ModifcarUsuarioSistemaUseCase,
        ToggleUsuarioSistemaUseCase,
        ContraseniaUsuarioSistemaUseCase,
        AutenticarUsuarioSistemaUseCase,
        ListarUsuarioSistemaUseCase,
        RegistrarPasaporteSistemaUseCase,
        ObtenerPasaporteSistemaUseCase,
        HabilitarPasaporteUsuarioSistemaUseCase,
        ListarPasaportesSistemaUseCase,
        ListarPasaportesUsuarioSistemaUseCase,
        ListarPaisesSistemaUseCase,
        JwtAuthGuard,
        {
            provide: AdministracionContract,
            useClass: MySQLAdministracionRepository
        }
    ],
    exports: [AdministracionContract]
})
export class SistemaModules { }