import mysql2 from "mysql2/promise";

export class DatabaseORM {
    #connection;

    constructor(connection) {
        if (typeof connection == 'string') {
            this.#connection = mysql2.createPool(connection);
        } else {
            const { username, host, port, password, database } = connection;

            this.#connection = mysql2.createPool(`mysql://${username}${password ? ':' + password : ''}@${host}:${port}/${database}`);
        }
    }

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
}