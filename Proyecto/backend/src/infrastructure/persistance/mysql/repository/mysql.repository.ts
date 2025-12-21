import { Inject, Injectable } from "@nestjs/common";
import { Usuario,Pasaporte } from "src/domain/interfaces/sistema.interfaces";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import type {Pool} from 'mysql2/promise';

@Injectable()
export class MySQLAdministracionRepository extends AdministracionContract{
    constructor(@Inject("MYSQL_CLIENT") private readonly mysql: Pool) {
        super();
    }

    public async registrarUsuario(usuario: Usuario): Promise<void> {
        const sql = `
            CALL insertar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            usuario.id,
            usuario.correo_electronico,
            usuario.telefono,
            usuario.nombres,
            usuario.apellidos,
            usuario.sexo,
            usuario.genero,
            usuario.pais,
            Buffer.from(usuario.contrasenia, 'utf8'), // VARBINARY(255)
            usuario.administrador,
            usuario.ciudadano
        ];

        const [result] = await this.mysql.execute(sql, params);
        
        // Manejar respuesta de la función
        const mensaje = (result as any[])[0]?.[0]?.[''] || 'SUCCESS';
        
        if (mensaje !== 'SUCCESS') {
            throw new Error(mensaje);
        }
    }

}