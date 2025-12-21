import { Module } from "@nestjs/common";
import { SistemaController } from "../presentation/sistema.controllers";
import { MySQLModule } from "./persistance/mysql/mysql.module";

@Module({
    imports: [MySQLModule],
    controllers: [SistemaController],
    providers: [],
})
export class SistemaModules { }