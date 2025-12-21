import { Module } from "@nestjs/common";
import { SistemaController } from "../presentation/sistema.controllers";
@Module({
    imports: [],
    controllers: [SistemaController],
    providers: [],
})
export class SistemaModules { }