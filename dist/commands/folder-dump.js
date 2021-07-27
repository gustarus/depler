"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const Command_1 = __importDefault(require("./../models/Command"));
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const formatter_1 = __importDefault(require("../instances/formatter"));
const prepareSelectedFolder_1 = __importDefault(require("../helpers/prepareSelectedFolder"));
function folderDump(program) {
    program
        .command('folder-dump')
        .arguments('<path>')
        .description('Dump folder from remote machine')
        .requiredOption('--source <path/to/folder>', 'Path to source folder to dump')
        .option('--host <john@example.com>', 'Host where the mysql docker container is located')
        .option('--config <path>', 'Use custom config for the command')
        .action((path, cmd) => {
        displayCommandGreetings_1.default(cmd);
        const { host, source } = loadConfig_1.default(cmd);
        // download the remote database dump to the current folder
        const copyPathFrom = prepareSelectedFolder_1.default(host, source) + '/*';
        const copyPathTo = prepareSelectedFolder_1.default(undefined, path);
        const rsyncRemote = host
            ? `${host}:${copyPathFrom}` : copyPathFrom;
        const rsyncCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['rsync -ra --progress', rsyncRemote, copyPathTo] });
        execSyncProgressDisplay_1.default(rsyncCommand);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = folderDump;
;
