"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const getPathToTemporaryArchive_1 = __importDefault(require("./../helpers/getPathToTemporaryArchive"));
const validatePathExists_1 = __importDefault(require("../helpers/validatePathExists"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const constants_1 = require("./../constants");
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
function transfer(program) {
    program
        .command('transfer')
        .description('Transfer image archive to remote host')
        .requiredOption('--tag <code:latest>', 'Docker image tag to transfer to remote host')
        .requiredOption('--host <john@example.com>', 'Host to deploy docker container')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        const { tag, host } = loadConfig_1.default(cmd);
        // get path to temporary archive and validate it
        const archive = getPathToTemporaryArchive_1.default(tag);
        validatePathExists_1.default(archive, `The archive doesn\'t exist: ${archive}.`);
        // transfer container archive to remote host
        execSyncProgressDisplay_1.default(`scp ${archive} ${host}:${archive}`);
        execSyncProgressDisplay_1.default(`rm -rf ${archive}`);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = transfer;
;
