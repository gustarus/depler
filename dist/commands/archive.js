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
const constants_1 = require("./../constants");
function archive(program) {
    program
        .command('archive')
        .description('Archive image to temporary file')
        .requiredOption('--tag <code:latest>', 'Docker image tag to archive to temporary file')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        // get path to temporary archive and archive the image
        const archive = getPathToTemporaryArchive_1.default(cmd.tag);
        execSyncProgressDisplay_1.default(`docker save -o ${archive} ${cmd.tag}`);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = archive;
;
