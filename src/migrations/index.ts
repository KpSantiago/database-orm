#!/usr/bin/env node
import { execSync } from "node:child_process";
import path from "node:path"
const args = process.argv.slice(2);

if (args[0] == "--init") {
    require("./config.js");
} else if (args[0] == "--migrate-create") {
    require("./create.js");
} else if (args[0] == "--migrate") {
    execSync(`tsnd --transpile-only ${path.dirname("")}/databaseORM/migrations/migrations.ts`)
} else {
    console.log("Invalid command \n\n### Initialize\norm --init\n\n### Migrations\norm --migrate-create\n\n### Run migrations\norm --migrate\n\n");
}