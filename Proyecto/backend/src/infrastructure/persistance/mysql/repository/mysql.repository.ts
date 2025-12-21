import { Inject, Injectable } from "@nestjs/common";
import { Usuario,Pasaporte } from "src/domain/interfaces/sistema.interfaces";
import { AdministracionContract } from "src/domain/contracts/administracion.contract";
import { InvalidRequestError } from "src/domain/errors/invalid_request.error";
import type {Pool,ResultSetHeader} from 'mysql2/promise';

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
            throw new InvalidRequestError('Usuario no encontrado');
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
        console.log(id)
        console.log('hhasaenfinasdi')
        const sql = `SELECT id FROM usuarios WHERE id = ?`;
        const params = [id];

        const [rows] = await this.mysql.execute(sql, params);
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new InvalidRequestError('Usuario no encontrado');
        }
        const sql_update = `UPDATE usuarios SET contrasenia = ? WHERE id = ?`;
        const params_update = [contrasenia,id];
        const [result] = await this.mysql.execute(sql_update, params_update );
        const updateResult = result as ResultSetHeader;
        console.log(updateResult)
        if (updateResult.affectedRows === 0) {
            throw new InvalidRequestError('No se pudo actualizar la contraseña');
        }
    }
}