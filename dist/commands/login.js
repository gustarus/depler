"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const loadCommandConfig_1 = __importDefault(require("./../helpers/loadCommandConfig"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const resolveRegistryFromConfig_1 = __importDefault(require("./../helpers/resolveRegistryFromConfig"));
const RemoteCommand_1 = __importDefault(require("./../models/RemoteCommand"));
const Command_1 = __importDefault(require("./../models/Command"));
function login(program) {
    program
        .command('login')
        .description('Login into docker registry')
        .option('--host <john@example.com>', 'Host where to login into registry')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        const config = loadCommandConfig_1.default(cmd);
        // resolve username and host from registry environment variables
        const registry = resolveRegistryFromConfig_1.default(config);
        if (!registry) {
            throw new Error('Unable to resolve registry configuration');
        }
        // transfer password as environment variable
        const { username, host } = registry;
        const { password } = config.registry;
        // create shell command for docker login
        const command = new Command_1.default({ parts: [`echo ${password} | docker login -u ${username} ${host} --password-stdin`] });
        const commandRemoteConfig = { host: cmd.host, parts: [command], with: [password] };
        const wrapped = cmd.host ? new RemoteCommand_1.default(commandRemoteConfig) : command;
        // run docker registry login
        execSyncProgressDisplay_1.default(wrapped);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = login;
;
