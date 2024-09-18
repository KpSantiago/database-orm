import mysql2, { FieldPacket, ResultSetHeader } from "mysql2/promise";
import { Connection } from "..";

type QuerieObject = {
    [x: string]: string | number
}

interface Queries {
    table: string;
    where: QuerieObject;
    data: QuerieObject;
    field?: string;
}

export class DatabaseORM {
    private connection;

    /**
     * make the connection with database
     * @param { string | object } connection
     * @description receives url or an object { username, host, port, password, database } 
     */
    constructor(connection: mysql2.Pool) {
        this.connection = connection;
    }

    /**
     * queries the database and returns all records of a table
     * @param { { table: string, where?: object } } queries 
     * @returns array of objects
     */
    async findAll(queries: Omit<Queries, "field" | "data" | "where"> & Partial<Pick<Queries, "where">>) {
        const { table, where } = queries;

        if (where) {
            const queriesArr = [];

            for (const key in where) {
                queriesArr.push(`${key} = "${where[key]}"`);
            }

            const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
            const result = await this.connection.query(`SELECT * FROM ${table} WHERE ${whereQueries}`);
            return result[0] as [{ [x: string]: string }];
        } else {
            console.error(await this.connection.query(`SELECT * FROM ${table}`))
            const result = await this.connection.query(`SELECT * FROM ${table}`);
            return result[0] as [{ [x: string]: string }];
        }
    }

    /**
     * queries the database and returns the first record found
     * @param { { table: string, where: object } } queries 
     * @returns Promise<object | null>
     */
    async findFirst(queries: Omit<Queries, "data" | "field">) {
        const { table, where } = queries;
        const queriesArr = [];

        for (const key in where) {
            queriesArr.push(`${key} = "${where[key]}"`);
        }

        const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
        const result = await this.connection.query(`SELECT * FROM ${table} WHERE ${whereQueries} LIMIT 1`);
        return result[0] as [{ [x: string]: string }] ?? null;
    }

    /**
     * creates a new record in database
     * @param { { table: string, data: object, field?: string } } queries
     * @returns array or an object
     */
    async create(queries: Omit<Queries, "where">) {
        const { table, data, field } = queries;

        const queriesValueArr = [];
        const queriesArr = [];
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                queriesArr.push(key);
                queriesValueArr.push(`"${data[key]}"`);
            }
        }

        const result =
            await this.connection.query(`INSERT INTO ${table} (${queriesArr.toString()}) VALUES (${queriesValueArr.toString()})`) as [
                ResultSetHeader, FieldPacket[]
            ];

        if (!field || field == 'all') {
            const data = await this.findFirst({ table, where: { id: result[0].insertId.toString() } });
            return data;
        } else {
            const data = await this.findFirst({ table, where: { id: result[0].insertId.toString() } });
            return { [field]: data[0][field] };
        }
    }


    /**
     * updates a record of a table
     * @param { { table: string, data: object, where: object, field?: string } } queries
     * @description only updates one record
     * @returns a object
     */
    async update(queries: Queries) {
        const { table, where, data, field } = queries;

        const setQueriesArr = [];
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                setQueriesArr.push(`${key} = "${data[key]}"`);
            }
        }

        const queriesArr = [];

        for (const key in where) {
            queriesArr.push(`${key} = "${where[key]}"`);
        }

        const whereQuery = queriesArr.toString();
        const setQuery = setQueriesArr.toString();
        if (!field || field == 'all') {
            await this.connection.query(`UPDATE ${table} SET ${setQuery} WHERE ${whereQuery} LIMIT 1`);
            const getFields = await this.findFirst({ table, where });

            return getFields[0]
        } else {
            await this.connection.query(`UPDATE ${table} SET ${setQuery} WHERE ${whereQuery} LIMIT 1`);
            const getFields = await this.findFirst({ table, where });

            return { [field]: getFields[0][field] };
        }
    }

    /**
     * deletes a record of a table
     * @param { { table: string, where: object, field?: string } } queries
     * @description only deletes one record
     * @returns nothing or an object
    */
    async delete(queries: Omit<Queries, "data">) {
        const { table, where, field } = queries;
        const queriesArr = [];

        for (const key in where) {
            queriesArr.push(`${key} = "${where[key]}"`);
        }

        const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
        if (field) {
            if (field == 'all') {
                const data = await this.findFirst({ table, where: { ...where } });
                await this.connection.query(`DELETE FROM ${table} WHERE ${whereQueries} LIMIT 1`);

                return data[0];
            } else {
                const data = await this.findFirst({ table, where: { ...where } });
                await this.connection.query(`DELETE FROM ${table} WHERE ${whereQueries} LIMIT 1`);

                return { [field]: data[0][field] };
            }
        }
    }

    /**
     * deletes all records of a table
     * @param { { table: string, where: object, field?: string } } queries
     * @description deletes all records that satisfy the where
     * @returns object
    */
    async deleteAll(queries: Omit<Queries, "data" | "field">) {
        const { table, where } = queries;
        const queriesArr = [];

        for (const key in where) {
            queriesArr.push(`${key} = "${where[key]}"`);
        }

        const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
        const result = await this.connection.query(`DELETE FROM ${table} WHERE ${whereQueries}`) as ResultSetHeader[];

        return { deleted_items: result[0].affectedRows };
    }

    /**
     * Queries the database with a manually written query
     * @param { string } query 
     * @description the query doesn't accept a DELETE query
     * @returns the results of the query
    */
    async query(query: string) {
        if (!query.includes("DELETE")) {
            const result = await this.connection.query(query);

            return result[0];
        } else {
            throw new Error("This method cannot use a unsefe query. Use the unsafe method");
        }
    }

    /**
    * Queries the database with a manually written query that can be unsafe
    * @param { string } query
    * @description this method accpets the DELETE query
    * @returns the results of the query
   */
    async unsafeQuery(query: string) {
        const result = await this.connection.query(query);

        return result[0];
    }
}

const orm = new Connection("mysql://root@localhost:3306/visitas").databaseORM;

orm.findFirst({ table: "users", where: { id: 1 } }).then(d => console.log(d));