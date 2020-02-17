"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const getPathToTemporaryArchive_1 = __importDefault(require("./../helpers/getPathToTemporaryArchive"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const Command_1 = __importDefault(require("./../models/Command"));
const constants_1 = require("./../constants");
function load(program) {
    program
        .command('load')
        .description('Load image from archive on remote host')
        .requiredOption('--tag <code:latest>', 'Docker image tag to resolve archive name')
        .requiredOption('--host <john@example.com>', 'Host where to load image')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        // get path to temporary archive and validate it
        const archive = getPathToTemporaryArchive_1.default(cmd.tag);
        // load docker container from archive
        execSyncProgressDisplay_1.default('ssh', cmd.host, new Command_1.default({ parts: ['docker', 'load', '-i', archive] })); // TODO Use remote command tool.
        execSyncProgressDisplay_1.default('ssh', cmd.host, new Command_1.default({ parts: ['rm', '-rf', archive] })); // TODO Use remote command tool.
        displayCommandDone_1.default(cmd);
    });
}
exports.default = load;
;
