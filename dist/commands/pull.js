"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const resolveRegistryTagFromConfig_1 = __importDefault(require("./../helpers/resolveRegistryTagFromConfig"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const RemoteCommand_1 = __importDefault(require("./../models/RemoteCommand"));
const Command_1 = __importDefault(require("./../models/Command"));
const constants_1 = require("./../constants");
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const formatter_1 = __importDefault(require("../instances/formatter"));
function pull(program) {
    program
        .command('pull')
        .description('Pull from remote registry')
        .requiredOption('--tag <code:latest>', 'Docker image tag to pull')
        .requiredOption('--host <john@example.com>', 'Host where to pull')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        const { host, registry } = loadConfig_1.default(cmd);
        const registryTag = resolveRegistryTagFromConfig_1.default(registry);
        // create shell command for docker login
        const command = new Command_1.default({ formatter: formatter_1.default, parts: [`docker pull ${registryTag}`] });
        const wrapped = host ? new RemoteCommand_1.default({ formatter: formatter_1.default, host, parts: [command] }) : command;
        // execute shell command
        execSyncProgressDisplay_1.default(wrapped);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = pull;
;
