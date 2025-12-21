import { Module } from "@nestjs/common";
import mysql from 'mysql2/promise';
@Module({
    providers:[
        {
            provide:"MYSQL_CLIENT",
            useFactory: ()=>
                mysql.createPool({
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'sa_cats',
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0
                    }),

        },
    ],
    exports:["MYSQL_CLIENT"]
})
export class MySQLModule {}
