// import { Migration } from "./migrations/migration-definition";
import { DatabaseORM } from "./ORM/index";
import mysql2 from "mysql2/promise";

export type ConnectionType = string | {
    username: string,
    host: string,
    port: string | number,
    password: string,
    database: string
}

export class Connection {
    private connection: mysql2.Pool;

    /**
     * make the connection with database
     * @param { string | { username: string, host: string, port: string | number, password: string, database: string } } connection
     */
    constructor(connection: ConnectionType) {
        if (typeof connection == 'string') {
            this.connection = mysql2.createPool(connection);
        } else {
            const { username, host, port, password, database } = connection;

            this.connection = mysql2.createPool(`mysql://${username}${password ? ':' + password : ''}@${host}:${port}/${database}`);
        }
    }

    // get migration() {
    //     return new Migration(this.connection);
    // }

    get databaseORM() {
        return new DatabaseORM(this.connection);
    }
}