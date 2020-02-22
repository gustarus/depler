"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const displayCommandStep_1 = __importDefault(require("./../helpers/displayCommandStep"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const execSyncProgressReturn_1 = __importDefault(require("./../helpers/execSyncProgressReturn"));
const getUniqueValues_1 = __importDefault(require("./../helpers/getUniqueValues"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const RemoteCommand_1 = __importDefault(require("./../models/RemoteCommand"));
const Command_1 = __importDefault(require("./../models/Command"));
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const formatter_1 = __importDefault(require("../instances/formatter"));
const constants_1 = require("./../constants");
function run(program) {
    program
        .command('run')
        .description('Run container on remote host')
        .requiredOption('--name <hello>', 'Docker container name to run on remote host')
        .requiredOption('--tag <code:latest>', 'Docker image tag to run on remote host')
        .requiredOption('--host <john@example.com>', 'Host where to run docker container')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        const { tag, name, host, container } = loadConfig_1.default(cmd);
        if (container.network) {
            displayCommandStep_1.default(cmd, 'Creating required networks');
            const networks = typeof container.network === 'string'
                ? [container.network] : container.network;
            for (const network of networks) {
                const networkCommand = new Command_1.default({
                    formatter: formatter_1.default,
                    parts: [`docker network create -d bridge ${network} || true`],
                });
                const networkCommandRemoteConfig = { formatter: formatter_1.default, host, parts: [networkCommand] };
                const networkCommandWrapped = host ? new RemoteCommand_1.default(networkCommandRemoteConfig) : networkCommand;
                execSyncProgressDisplay_1.default(networkCommandWrapped);
            }
        }
        displayCommandStep_1.default(cmd, 'Checking for already running containers');
        const listCommand = new Command_1.default({
            formatter: formatter_1.default,
            parts: [`docker ps -a -q --filter "name=^${name}$" --format="{{.ID}}"`],
        });
        const listCommandWrapped = host ? new RemoteCommand_1.default({
            formatter: formatter_1.default,
            host,
            parts: [listCommand],
        }) : listCommand;
        const psResult = execSyncProgressReturn_1.default(listCommandWrapped);
        if (psResult) {
            displayCommandStep_1.default(cmd, 'Stopping and removing running containers');
            const containersIds = getUniqueValues_1.default(psResult.split('\n'));
            const removeCommand = new Command_1.default({ formatter: formatter_1.default, parts: [`docker rm -f ${containersIds.join(' ')}`] });
            const removeCommandRemoteConfig = { formatter: formatter_1.default, host, parts: [removeCommand] };
            const removeCommandWrapped = host ? new RemoteCommand_1.default(removeCommandRemoteConfig) : removeCommand;
            execSyncProgressDisplay_1.default(removeCommandWrapped);
        }
        else {
            displayCommandStep_1.default(cmd, 'There is no running containers');
        }
        displayCommandStep_1.default(cmd, `Run the image as a container`);
        const runCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['docker run', { name }, container, tag] });
        const runCommandWrapped = host ? new RemoteCommand_1.default({
            formatter: formatter_1.default,
            host,
            parts: [runCommand],
        }) : runCommand;
        execSyncProgressDisplay_1.default(runCommandWrapped);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = run;
;
