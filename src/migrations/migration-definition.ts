import { Pool } from "mysql2/promise";
import { constraint as constraintTypes } from "./data-types/constraint-types";
import { foreignKey } from "./data-types/foreign-key";

interface Table {
    [x: string]: {
        type: string,
        nullable?: boolean,
        primaryKey?: boolean,
        default?: string
        unique?: boolean,
        references?: {
            table: string,
            attribute: string
        }
    }
}

type Column = Table

export class Migration {
    private connection;

    /**
     * make the connection with database
     * @param { string | { username: string, host: string, port: string | number, password: string, database: string } } connection
     */
    constructor(connection: Pool) {
        this.connection = connection;
    }

    /**
     * creates a new table in the database if it not exists
     * @param { string } tableName 
     * @param { { 
     * [x: string]: {
     *  type: string,
     *  nullable?: boolean,
     *  primaryKey?: boolean,
     *  default?: string
     *  unique?: boolean,
     *  references?: {
     *      table: string,
     *      attribute: string
     *  }
     *  } 
     *  } } table 
     * @returns information about the query
     */
    async createTable(tableName: string, table: Table) {
        let tableColumns = [];
        for (const key in table) {
            let constraints = '';
            let foreignKeyConstraint = '';
            for (const constraint in table[key]) {
                if (constraint != 'type') {
                    if (constraint != 'references') {
                        const prop = table[key] as { [x: string]: boolean | string | object };

                        constraints += constraintTypes(constraint, prop[constraint]);
                    } else {
                        foreignKeyConstraint = foreignKey(key, table[key][constraint]!);
                    }
                }
            }

            tableColumns.push(` ${key} ${table[key].type} ${constraints} ${foreignKeyConstraint ? ", " + foreignKeyConstraint : ''}`);
        }

        const query = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                ${tableColumns.toString()}
            );
        `;

        const result = await this.connection.query(query);

        return result;
    }

    /**
     * deletes a table in the database if it exists
     * @param { string } tableName 
     * @returns information about the query
     */
    async dropTable(tableName: string) {
        const query = `DROP TABLE IF EXISTS ${tableName}`;

        const result = await this.connection.query(query);

        return result;
    }

    /**
     * reanmes a table in the database
     * @param { string } tableName 
     * @param { string } newTableName 
     * @returns information about the query
     */
    async renameTable(tableName: string, newTableName: string) {
        const query = `RENAME TABLE ${tableName} TO ${newTableName};`;

        const result = await this.connection.query(query);

        return result;
    }

    /**
     * adds a new column to a table in the database
     * @param { string } tableName 
     * @param { { 
     * [x: string]: {
    *  type: string,
    *  nullable?: boolean,
    *  primaryKey?: boolean,
    *  default?: string
    *  unique?: boolean,
    *  references?: {
    *      table: string,
    *      attribute: string
    *  }
    *  } 
    *  } } column 
     * @returns information about the query
    */
    async addColumn(tableName: string, column: Column) {
        if (Object.keys(column).length > 1) {
            console.error(column);
            throw new Error("Column must not have more than one proprerty.");
        }

        let query = `ALTER TABLE ${tableName} ADD `;
        let foreignKeyConstraint: string = '';
        for (const key in column) {
            query += `${key} ${column[key].type}`;
            for (const constraint in column[key]) {
                if (constraint != 'type') {
                    if (constraint != 'references') {
                        const prop = column[key] as { [x: string]: boolean | string | object };

                        query += ' ' + constraintTypes(constraint, prop[constraint]);
                    } else {
                        foreignKeyConstraint = foreignKey(key, column[key][constraint]!);
                    }
                }
            }

            query += ';'
        }

        const result = await this.connection.query(`${query}, ${foreignKeyConstraint}`);

        return result;
    }

    /**
     * changes a column of a table in the database
     * @param { string } tableName 
     * @param { string } oldColumnName 
     * @param { { columnName: { type: columnType, constraint: constraintType } } } column 
     * @returns information about the query
    */
    async changeColumn(tableName: string, oldColumnName: string, column: Column) {
        if (Object.keys(column).length > 1) {
            console.error(column);
            throw new Error("Column must not have more than one proprerty.");
        }

        let query = `ALTER TABLE ${tableName} CHANGE ${oldColumnName} `;
        let foreignKeyConstraint: string = '';
        for (const key in column) {
            query += `${key} ${column[key].type}`;

            for (const constraint in column[key]) {
                if (constraint != 'type') {
                    if (constraint != 'references') {
                        const prop = column[key] as { [x: string]: boolean | string | object };

                        query += ' ' + constraintTypes(constraint, prop[constraint]);
                    } else {
                        foreignKeyConstraint = foreignKey(key, column[key][constraint]!);
                    }
                }
            }
        }

        const result = await this.connection.query(`${query}, ${foreignKeyConstraint}`);

        return result;
    }

    /**
     * deletes a column of a table in the database
     * @param { string } tableName 
     * @param { string } columnName 
     * @returns information about the query
    */
    async dropColumn(tableName: string, columnName: string) {
        const query = `ALTER TABLE ${tableName} DROP ${columnName}`;

        const result = await this.connection.query(query);

        return result;
    }
}