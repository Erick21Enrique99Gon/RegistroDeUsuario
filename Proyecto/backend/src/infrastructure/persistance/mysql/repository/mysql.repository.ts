import { Inject, Injectable } from "@nestjs/common";
import { Usuario,Pasaporte } from "src/domain/interfaces/sistema.interfaces";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";
import {raw, type Pool,type ResultSetHeader} from 'mysql2/promise';
import { NotFoundError } from "src/domain/errors/not_found.error";

@Injectable()
export class MySQLAdministracionRepository extends AdministracionContract{
    constructor(@Inject("MYSQL_CLIENT") private readonly mysql: Pool) {
        super();
    }
    public async registrarUsuario(usuario: Usuario): Promise<void> {
        const sql = `CALL insertar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            usuario.id,
            usuario.correo_electronico,
            usuario.telefono,
            usuario.nombres,
            usuario.apellidos,
            usuario.sexo,
            usuario.genero,
            usuario.pais,
            usuario.contrasenia,
            usuario.administrador,
            usuario.ciudadano
        ];

        const [result] = await this.mysql.execute(sql, params) as any;
        
        const mensaje = result[0][0]?.resultado || 'UNKNOWN';

        switch (true) {
            case mensaje.includes('ERROR_EMAIL_DUPLICADO'):
                throw new InvalidRequestError('Email ya registrado');
            case mensaje.includes('ERROR_PAIS_INVALIDO'):
                throw new InvalidRequestError('País inválido');
            case mensaje.includes('ERROR_CAMPO_NULL'):
                throw new InvalidRequestError('Campos requeridos vacíos');
            case mensaje !== 'SUCCESS':
                throw new InvalidRequestError('Error de base de datos');
            default:
                return;
        }
    }

    public async obtenerUsuario(id: string): Promise<Usuario> {
        const sql = `SELECT * FROM usuarios WHERE id = ?`;
        const params = [id];

        const [rows] = await this.mysql.execute(sql, params);
        
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const usuario = rows[0] as any;
        const contraseniaHex = Buffer.from(usuario.contrasenia).toString('hex');
        return {
            ...usuario,
            contrasenia: Buffer.from(contraseniaHex, 'hex').toString('utf8'),
            administrador: Boolean(usuario.administrador),
            ciudadano: Boolean(usuario.ciudadano),
            habilitado: Boolean(usuario.habilitado)
        } as Usuario;
    }

    public async modificarUsuario(usuario: Usuario): Promise<void> {
        const sql = `CALL actualizar_usuario(?, ?, ?, ?, ?, ?, ?, ?,  ?, ?, ?)`;
        const params = [
            usuario.id,
            usuario.correo_electronico,
            usuario.telefono,
            usuario.nombres,
            usuario.apellidos,
            usuario.sexo,
            usuario.genero,
            usuario.pais,
            usuario.administrador,
            usuario.ciudadano,
            usuario.habilitado
        ];

        const [result] = await this.mysql.execute(sql, params) as any;
        const mensaje = result[0][0]?.resultado || 'UNKNOWN';

        switch (true) {
            case mensaje.includes('ERROR_EMAIL_DUPLICADO'):
                throw new InvalidRequestError('Email ya registrado por otro usuario');
            case mensaje.includes('ERROR_PAIS_INVALIDO'):
                throw new InvalidRequestError('País no existe');
            case mensaje.includes('ERROR_CAMPO_NULL'):
                throw new InvalidRequestError('Campo requerido vacío');
            case mensaje.includes('ERROR_USUARIO_INEXISTENTE'):
                throw new InvalidRequestError('Usuario no encontrado');
            case mensaje.includes('ERROR_USUARIO_MODIFICADO'):
                throw new InvalidRequestError('Usuario fue modificado por otro proceso');
            case mensaje !== 'SUCCESS':
                throw new InvalidRequestError('Error de base de datos');
            default:
                return;
        }
    }

    public async toggleUsuarioStatus(id: string): Promise<void> {
        const sql = `CALL toggle_estado_usuario(?)`;
        const params = [id];

        const [result] = await this.mysql.execute(sql, params) as any;
        const mensaje = result[0][0]?.resultado || 'UNKNOWN';

        switch (true) {
            case mensaje.includes('ERROR_REFERENCIA_ACTIVA'):
                throw new InvalidRequestError('Usuario tiene registros dependientes');
            case mensaje.includes('ERROR_CAMPO_NULL'):
                throw new InvalidRequestError('Campo requerido vacío');
            case mensaje.includes('ERROR_USUARIO_INEXISTENTE'):
                throw new InvalidRequestError('Usuario no encontrado');
            case mensaje.includes('ERROR_USUARIO_MODIFICADO'):
                throw new InvalidRequestError('Usuario fue modificado por otro proceso');
            case mensaje.includes('ERROR_DB_'):
                throw new InvalidRequestError('Error de base de datos');
            case mensaje.startsWith('SUCCESS_TOGGLE_'):
                return; // Éxito: habilitado o deshabilitado
            default:
                throw new InvalidRequestError('Error inesperado en base de datos');
        }
    }

    public async contraseniaUsuario(id: string, contrasenia: string): Promise<void> {
        
        const sql = `SELECT id FROM usuarios WHERE id = ?`;
        const params = [id];

        const [rows] = await this.mysql.execute(sql, params);
        
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new NotFoundError('Usuario no encontrado');
        }
        const sql_update = `UPDATE usuarios SET contrasenia = ? WHERE id = ?`;
        const params_update = [contrasenia,id];
        const [result] = await this.mysql.execute(sql_update, params_update );
        const updateResult = result as ResultSetHeader;
        
        if (updateResult.affectedRows === 0) {
            throw new InvalidRequestError('No se pudo actualizar la contraseña');
        }
    }

    public async autenticarUsuario(id: string): Promise<string> {
        const sql = `SELECT id,contrasenia FROM usuarios WHERE id = ?`;
        const params = [id];

        const [rows] = await this.mysql.execute(sql, params);
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new InvalidRequestError('Usuario no encontrado');
        }

        return rows[0]['contrasenia']
    }

    public async listarUsuario(): Promise<Usuario[]> {
        const sql = `SELECT id, correo_electronico, telefono, nombres, apellidos, 
                            sexo, genero, pais, administrador, ciudadano, habilitado 
                    FROM usuarios`;
                    
        const [rows, _ ]: [any[], any] = await this.mysql.query(sql);
        return rows.map((row: any): Usuario => {
            return {
                id: row.id,
                correo_electronico: row.correo_electronico,
                telefono: row.telefono,
                nombres: row.nombres,
                apellidos: row.apellidos,
                sexo: row.sexo,
                genero: row.genero,
                pais: Number(row.pais),
                contrasenia: "", 
                administrador: Boolean(row.administrador),
                ciudadano: Boolean(row.ciudadano),
                habilitado: Boolean(row.habilitado)
            };
        });
    }

    public async registrarPasaporte(pasaporte: Pasaporte): Promise<void> {
        const sql = `CALL insertar_pasaporte(?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            pasaporte.id_usuario,
            pasaporte.tipo_de_pasaporte,
            pasaporte.fecha_de_emision,
            pasaporte.fecha_de_vencimiento,
            pasaporte.lugar,
            pasaporte.pais_de_emision,
            pasaporte.numero_de_pasaporte
        ];

        const [result] = await this.mysql.execute(sql, params) as any;
        
        // El stored procedure devuelve un result set con un solo objeto que contiene 'resultado'
        const mensaje = result[0][0]?.resultado || 'UNKNOWN';

        console.log(mensaje)
        switch (true) {
            case mensaje.includes('ERROR_USUARIO_INEXISTENTE'):
                throw new InvalidRequestError('Usuario no encontrado');
            case mensaje.includes('ERROR_PAIS_EMISION_INVALIDO'):
                throw new InvalidRequestError('País de emisión inválido');
            case mensaje.includes('ERROR_PASAPORTE_DUPLICADO'):
                throw new InvalidRequestError('Pasaporte ya registrado');
            case mensaje.includes('ERROR_CAMPO_NULL'):
                throw new InvalidRequestError('Campos requeridos vacíos');
            case mensaje.includes('ERROR_DB_'):
                throw new InvalidRequestError('Error de base de datos');
            case mensaje === 'SUCCESS':
                return;
            default:
                console.log(mensaje)
                throw new InvalidRequestError('Error inesperado en base de datos');
        }
    }

    public async obtenerPasaporte(id_usuario: string, numero_de_pasaporte: string,lugar:string): Promise<Pasaporte> {
        const sql = `SELECT * FROM pasaporte WHERE id_usuario = ? and numero_de_pasaporte  = ? and lugar  = ? `;
        const params = [id_usuario,numero_de_pasaporte,lugar];
        const [rows] = await this.mysql.execute(sql, params);
        const pasaporte = rows[0] as any;
        return {
            ... pasaporte
        } as Pasaporte
    }

    public async habilitarPasaporteUsuario(id_usuario: string, numero_de_pasaporte: string, lugar: string): Promise<void> {

        const [rows] = await this.mysql.execute(
            `CALL habilitar_pasaporte(?, ?, ?)`,
            [id_usuario, numero_de_pasaporte, lugar]
        ) as any;

        const resultado = rows[0][0]?.resultado;
        
        if (resultado.startsWith('ERROR_')) {
            throw new InvalidRequestError(resultado);
        }

    }

    public async listarPasaportes(): Promise<Pasaporte[]> {
        const sql = `SELECT * FROM pasaporte `;
        const [rows, _ ]: [any[], any] = await this.mysql.query(sql);
        return rows.map((row: any): Pasaporte => {
            return {
                id_usuario:row.id_usuario,
                tipo_de_pasaporte:row.tipo_de_pasaporte,
                fecha_de_emision:row.fecha_de_emision,
                fecha_de_vencimiento:row.fecha_de_vencimiento,
                lugar:row.lugar,
                pais_de_emision:row.pais_de_emision,
                numero_de_pasaporte:row.numero_de_pasaporte,
                habilitado:row.habilitado
            };
        });
    }

}