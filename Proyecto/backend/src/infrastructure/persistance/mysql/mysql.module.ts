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
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'ProyectoDB',
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