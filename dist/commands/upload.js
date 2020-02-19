"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const getPathToTemporarySourceCode_1 = __importDefault(require("./../helpers/getPathToTemporarySourceCode"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const Command_1 = __importDefault(require("./../models/Command"));
const constants_1 = require("./../constants");
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const formatter_1 = __importDefault(require("../instances/formatter"));
function upload(program) {
    program
        .command('upload')
        .arguments('<path>')
        .description('Upload source code to the remote host')
        .requiredOption('--tag <code:latest>', 'Docker image tag to describe temporary folder')
        .requiredOption('--host <john@example.com>', 'Host where to upload source code')
        .option('--config <path>', 'Use custom config for the command')
        .action((path, cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        const { tag, host } = loadConfig_1.default(cmd);
        // get temporary folder to store source code on the remote
        const tmp = getPathToTemporarySourceCode_1.default(tag);
        // execute child command
        execSyncProgressDisplay_1.default('ssh', host, new Command_1.default({ formatter: formatter_1.default, parts: ['rm', '-rf', tmp] })); // TODO Use remote command tool.
        execSyncProgressDisplay_1.default(`rsync --exclude='/.git' --filter="dir-merge,- .gitignore" -az ${path}/ ${host}:${tmp}`);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = upload;
;
