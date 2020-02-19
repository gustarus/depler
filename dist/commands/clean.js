"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const getPathToTemporarySourceCode_1 = __importDefault(require("./../helpers/getPathToTemporarySourceCode"));
const getPathToTemporaryArchive_1 = __importDefault(require("./../helpers/getPathToTemporaryArchive"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const constants_1 = require("./../constants");
function clean(program) {
    program
        .command('clean')
        .description('Clean local and remote hosts')
        .requiredOption('--tag <code:latest>', 'Docker image tag to clean')
        .requiredOption('--host <john@example.com>', 'Host where to clean')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        const { tag, host } = loadConfig_1.default(cmd);
        // get path to temporary working directory
        const tmp = getPathToTemporarySourceCode_1.default(tag);
        // get path to temporary archive
        const archive = getPathToTemporaryArchive_1.default(tag);
        // execute clean scenario
        execSyncProgressDisplay_1.default(`rm -rf ${tmp} ${archive}`);
        execSyncProgressDisplay_1.default(`ssh ${host} 'rm -rf ${tmp} ${archive}'`); // TODO Use remote command model.
        displayCommandDone_1.default(cmd);
    });
}
exports.default = clean;
;
