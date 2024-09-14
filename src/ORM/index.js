import mysql2 from "mysql2/promise";

export class DatabaseORM {
    #connection;

    /**
     * make the connection with database
     * @param connection string | object
     * @description receives url or an object { username, host, port, password, database } 
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
     * queries the database and returns all records of a table
     * @param {*} queries { table: string, where?: object }
     * @returns array of objects
     */
    async findAll(queries) {
        const { table, where } = queries;

        if (where) {
            const queriesArr = [];

            for (const key in where) {
                queriesArr.push(`${key} = "${where[key]}"`);
            }

            const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
            const result = await this.#connection.query(`SELECT * FROM ${table} WHERE ${whereQueries}`);
            return result[0];
        } else {
            const result = await this.#connection.query(`SELECT * FROM ${table}`);
            return result[0];
        }
    }

    /**
     * queries the database and returns the first record found
     * @param {*} queries { table: string, where: object }
     * @returns an object
     */
    async findFirst(queries) {
        const { table, where } = queries;
        const queriesArr = [];

        for (const key in where) {
            queriesArr.push(`${key} = "${where[key]}"`);
        }

        const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
        const result = await this.#connection.query(`SELECT * FROM ${table} WHERE ${whereQueries}`);
        return result[0];
    }

    /**
     * creates a new record in database
     * @param {*} queries { table: string, data: object, field?: string }
     * @returns nothing or an object
     */
    async create(queries) {
        const { table, data, field } = queries;

        const queriesValueArr = [];
        const queriesArr = [];
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                queriesArr.push(key);
                queriesValueArr.push(`"${data[key]}"`);
            }
        }

        const result = await this.#connection.query(`INSERT INTO ${table} (${queriesArr.toString()}) VALUES (${queriesValueArr.toString()})`);

        if (!field || field == 'all') {
            const data = await this.findFirst({ table, where: { id: result[0].insertId } });
            return data[0];
        } else {
            const data = await this.findFirst({ table, where: { id: result[0].insertId } });
            return { [field]: data[0][field] };
        }
    }

    /**
     * updates a record of a table
     * @param {*} queries { table: string, data: object, where: object, field?: string }
     * @description only updates one record
     * @returns nothing or an object
     */
    async update(queries) {
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
            const result = await this.#connection.query(`UPDATE ${table} SET ${setQuery} WHERE ${whereQuery} LIMIT 1`);
            const getFields = await this.findFirst({ table, where });

            return { changed_items: result[0].changedRows, data: getFields[0] };
        } else {
            const result = await this.#connection.query(`UPDATE ${table} SET ${setQuery} WHERE ${whereQuery} LIMIT 1`);
            const getFields = await this.findFirst({ table, where });

            return { changed_items: result[0].changedRows, data: { [field]: getFields[0][field] } };
        }
    }

    /**
     * deletes a record of a table
     * @param {*} queries { table: string, where: object, field?: string }
     * @description only deletes one record
     * @returns nothing or an object
    */
    async delete(queries) {
        const { table, where, field } = queries;
        const queriesArr = [];

        for (const key in where) {
            queriesArr.push(`${key} = "${where[key]}"`);
        }

        const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
        if (field) {
            if (field == 'all') {
                const data = await this.findFirst({ table, where: { ...where } });
                const result = await this.#connection.query(`DELETE FROM ${table} WHERE ${whereQueries} LIMIT 1`);

                return { deleted_items: result[0].affectedRows, data: data[0] };
            } else {
                const data = await this.findFirst({ table, where: { ...where } });
                const result = await this.#connection.query(`DELETE FROM ${table} WHERE ${whereQueries} LIMIT 1`);

                return { deleted_items: result[0].affectedRows, [field]: data[0][field] };
            }
        }
    }

    /**
     * deletes all records of a table
     * @param {*} queries { table: string, where: object, field?: string }
     * @description deletes all records that satisfy the where
     * @returns nothing or an object
    */
    async deleteAll(queries) {
        const { table, where } = queries;
        const queriesArr = [];

        for (const key in where) {
            queriesArr.push(`${key} = "${where[key]}"`);
        }

        const whereQueries = queriesArr.toString().replace(/[\,]/g, ' AND ');
        const result = await this.#connection.query(`DELETE FROM ${table} WHERE ${whereQueries}`);

        return { deleted_items: result[0].affectedRows };
    }

    /**
     * Queries the database with a manually written query
     * @param {*} query string
     * @description the query doesn't accept a DELETE query
     * @returns the results of the query
    */
    async query(query) {
        if (!query.includes("DELETE")) {
            const result = await this.#connection.query(query);

            return result[0];
        } else {
            throw new Error("This method cannot use a unsefe query. Use the unsafe method");
        }
    }

     /**
     * Queries the database with a manually written query that can be unsafe
     * @param {*} query string
     * @description this method accpets the DELETE query
     * @returns the results of the query
    */
    async unsafeQuery(query) {
        const result = await this.#connection.query(query);

        return result[0];
    }
}