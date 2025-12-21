import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { Module } from "@nestjs/common";
import { MySQLAdministracionRepository } from './repository/mysql.repository';
@Module({
    providers: [
        {
            provide: "MYSQL_CLIENT",
            useFactory: async (): Promise<Pool>  =>{
                return mysql.createPool({
                host: process.env.MYSQL_HOST || 'localhost',
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_ROOT_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'ProyectoDB',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
                })
            }
        },
        MySQLAdministracionRepository,
    ],
    exports: ["MYSQL_CLIENT",MySQLAdministracionRepository],
})
export class MySQLModule {}