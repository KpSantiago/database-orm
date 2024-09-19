#!/usr/bin/env node

const args = process.argv.slice(2);

if (args[0] == "--init") {
    require("./config.js");
} else if (args[0] == "--init") {
    require("./create.js");
} else {
    console.log("Invalid command \n\n### Initialize\norm --init\n\n### Migrations\norm --migrate-create\n\n");
}