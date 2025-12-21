import { Module } from "@nestjs/common";
import { SistemaController } from "../presentation/sistema.controllers";
import { MySQLModule } from "./persistance/mysql/mysql.module";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { MySQLAdministracionRepository } from "./persistance/mysql/repository/mysql.repository";
import { RegistrarUsuarioSistemaUseCase } from "src/application/use_cases/registrarUsuario_sistema.use_case";
import { ObtenerUsuarioSistemaUseCase } from "src/application/use_cases/obtenerUsuario_sistema.use_case";
import { ModifcarUsuarioSistemaUseCase } from "src/application/use_cases/modificarUsuario_sistema.use_case";
import { ToggleUsuarioSistemaUseCase } from "src/application/use_cases/toggleUsuarioStatus_sistema.use_case";
@Module({
    imports: [MySQLModule],
    controllers: [SistemaController],
    providers: [
        RegistrarUsuarioSistemaUseCase,
        ObtenerUsuarioSistemaUseCase,
        ModifcarUsuarioSistemaUseCase,
        ToggleUsuarioSistemaUseCase,
        {
            provide:AdministracionContract,
            useClass:MySQLAdministracionRepository
        }
    ],
    exports:[AdministracionContract]
})
export class SistemaModules { }