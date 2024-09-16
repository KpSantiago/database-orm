import mysql2 from "mysql2/promise";
import { constraint as constraintTypes } from "./data-types/constraint-types.js";
import { MySQLDataTypes } from "./data-types/MySQLDataTypes.js";

export class Migration {
    #connection;

    /**
     * make the connection with database
     * @param { string | { username: string, host: string, port: string | number, password: string, database: string } } connection
     */
    constructor(connection) {
        if (typeof connection == 'string') {
            this.#connection = mysql2.createPool(connection);
        } else {
            const { username, host, port, password, database } = connection;

            this.#connection = mysql2.createPool(`mysql://${username}${password ? ':' + password : ''}@${host}:${port}/${database}`);
        }
    }

    /**
     * creates a new table in the database if it not exists
     * @param { string } tableName 
     * @param { { type: columnType, constraint: constraintType } } table 
     * @returns information about the query
     */
    async createTable(tableName, table) {
        let tableColumns = [];
        for (const key in table) {
            let constraints = '';
            for (const constraint in table[key]) {
                if (constraint != 'type') {
                    constraints += constraintTypes(constraint, table[key][constraint]);
                }
            }

            tableColumns.push(` ${key} ${table[key].type} ${constraints}`);
        }

        const query = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                ${tableColumns.toString()}
            );
        `;

        const result = await this.#connection.query(query);

        return result;
    }

    /**
     * deletes a table in the database if it exists
     * @param { string } tableName 
     * @returns information about the query
     */
    async dropTable(tableName) {
        const query = `DROP TABLE IF EXISTS ${tableName}`;

        const result = await this.#connection.query(query);

        return result;
    }

    /**
     * reanmes a table in the database
     * @param { string } tableName 
     * @param { string } newTableName 
     * @returns information about the query
     */
    async renameTable(tableName, newTableName) {
        const query = `RENAME TABLE ${tableName} TO ${newTableName};`;

        const result = await this.#connection.query(query);

        return result;
    }

    /**
     * adds a new column to a table in the database
     * @param { string } tableName 
     * @param { { columnName: { type: columnType, constraint: constraintType } } } column 
     * @returns information about the query
    */
    async addColumn(tableName, column) {
        if (Object.keys(column).length > 1) {
            console.error(column);
            throw new Error("Column must not have more than one proprerty.");
        }

        let query = `ALTER TABLE ${tableName} ADD `;

        for (const key in column) {
            query += `${key} ${column[key].type}`;
            for (const constraint in column[key]) {
                if (constraint != 'type') {
                    query += ' ' + constraintTypes(constraint, column[key][constraint]);
                }
            }

            query += ';'
        }

        const result = await this.#connection.query(query);

        return result;
    }

    /**
     * changes a column of a table in the database
     * @param { string } tableName 
     * @param { string } oldColumnName 
     * @param { { columnName: { type: columnType, constraint: constraintType } } } column 
     * @returns information about the query
    */
    async changeColumn(tableName, oldColumnName, column) {
        if (Object.keys(column).length > 1) {
            console.error(column);
            throw new Error("Column must not have more than one proprerty.");
        }

        let query = `ALTER TABLE ${tableName} CHANGE ${oldColumnName} `;

        for (const key in column) {
            query += `${key} ${column[key].type}`;

            for (const constraint in column[key]) {
                if (constraint != 'type') {
                    query += ' ' + constraintTypes(constraint, column[key][constraint]);
                }
            }
        }

        const result = await this.#connection.query(query);

        return result;
    }

    /**
     * deletes a column of a table in the database
     * @param { string } tableName 
     * @param { string } columnName 
     * @returns information about the query
    */
    async dropColumn(tableName, columnName) {
        const query = `ALTER TABLE ${tableName} DROP ${columnName}`;

        const result = await this.#connection.query(query);

        return result;
    }
}