import path from "node:path";
import fs from "node:fs";

fs.writeFileSync(`${path.dirname("")}/databaseORM/migrations/migrations.ts`,
    `import { connection } from "../connection";

const migration = connection.migration;

function Example(){
    // migration code here
}

Example();`);