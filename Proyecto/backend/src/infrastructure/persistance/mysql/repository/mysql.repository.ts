import { Inject, Injectable } from "@nestjs/common";
import { Usuario,Pasaporte } from "src/domain/interfaces/sistema.interfaces";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import type {Pool} from 'mysql2/promise';

@Injectable()
export class MySQLAdministracionRepository extends AdministracionContract{
    constructor(@Inject("MYSQL_CLIENT") private readonly mysql: Pool) {
        super();
    }


}