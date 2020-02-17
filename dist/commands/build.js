"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const loadCommandConfig_1 = __importDefault(require("./../helpers/loadCommandConfig"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const Command_1 = __importDefault(require("./../models/Command"));
const RemoteCommand_1 = __importDefault(require("./../models/RemoteCommand"));
const constants_1 = require("./../constants");
function build(program) {
    program
        .command('build')
        .arguments('<path>')
        .description('Build docker image from source code: local and remote build scenarios are allowed')
        .requiredOption('--tag <code:latest>', 'Tag for the image')
        .option('--host <john@example.com>', 'Host where to build docker image; if not passed: will be built locally')
        .option('--config <path>', 'Use custom config for the command')
        .action((path, cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        const config = loadCommandConfig_1.default(cmd);
        const { tag } = config;
        // get ssh prefix command if remote build requested
        const command = new Command_1.default({ parts: ['docker', 'build', { tag }, config.image, path] });
        const wrapped = cmd.host ? new RemoteCommand_1.default({ host: cmd.host, parts: [command] }) : command;
        execSyncProgressDisplay_1.default(wrapped);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = build;
;
