#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const colors_1 = __importDefault(require("colors"));
const archive_1 = __importDefault(require("./commands/archive"));
const build_1 = __importDefault(require("./commands/build"));
const clean_1 = __importDefault(require("./commands/clean"));
const deploy_1 = __importDefault(require("./commands/deploy"));
const load_1 = __importDefault(require("./commands/load"));
const login_1 = __importDefault(require("./commands/login"));
const pull_1 = __importDefault(require("./commands/pull"));
const push_1 = __importDefault(require("./commands/push"));
const run_1 = __importDefault(require("./commands/run"));
const transfer_1 = __importDefault(require("./commands/transfer"));
const upload_1 = __importDefault(require("./commands/upload"));
const Package_1 = __importDefault(require("./models/Package"));
const constants_1 = require("./constants");
const info = new Package_1.default({ path: constants_1.PATH_TO_PACKAGE });
// display program description
commander_1.default
    .version(info.version)
    .description('Tool to deploy docker containers to remote host');
// bind commands
// to the program
archive_1.default(commander_1.default);
build_1.default(commander_1.default);
clean_1.default(commander_1.default);
deploy_1.default(commander_1.default);
load_1.default(commander_1.default);
login_1.default(commander_1.default);
pull_1.default(commander_1.default);
push_1.default(commander_1.default);
run_1.default(commander_1.default);
transfer_1.default(commander_1.default);
upload_1.default(commander_1.default);
// override exit
commander_1.default.exitOverride();
// listen to promises rejection
process.on('uncaughtException', processError);
process.on('unhandledRejection', processError);
// parse arguments
commander_1.default.parse(process.argv);
// display help command
if (!process.argv.slice(2).length) {
    commander_1.default.help();
}
function processError(error) {
    console.log(colors_1.default.red.bold(error.toString()));
    console.log(error);
    process.exit(1);
}
