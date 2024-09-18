import path from "node:path";
import fs from "node:fs";

fs.mkdirSync("databaseORM");
fs.mkdirSync("databaseORM/migrations");

fs.writeFileSync(`${path.dirname("")}/databaseORM/connection.ts`, 
`import { Connection } from "@kpsantiago/database-orm";

export const connection = new Connection("url");`);