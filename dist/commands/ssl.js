"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const RemoteCommand_1 = __importDefault(require("../models/RemoteCommand"));
const Command_1 = __importDefault(require("../models/Command"));
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const formatter_1 = __importDefault(require("../instances/formatter"));
function ssl(program) {
    program
        .command('ssl')
        .description('Create ssl certificate for the server name with `certbot` tool')
        .option('--host <john@example.com>', 'Host where to login to configure ssl')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        const { host, public: _public, certbot, ssl } = loadConfig_1.default(cmd);
        // create certbot configuration command
        const certbotCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['sudo', 'certbot', { ...certbot, d: _public.name }] });
        const certbotCommandRemoteConfig = { formatter: formatter_1.default, host, parts: [certbotCommand] };
        const certbotCommandWrapped = host ? new RemoteCommand_1.default(certbotCommandRemoteConfig) : certbotCommand;
        execSyncProgressDisplay_1.default(certbotCommandWrapped);
        // restart nginx if required
        if (ssl.restart) {
            const restartCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['sudo', 'service', 'nginx', 'restart'] });
            const restartCommandRemoteConfig = { formatter: formatter_1.default, host, parts: [restartCommand] };
            const restartCommandWrapped = host ? new RemoteCommand_1.default(restartCommandRemoteConfig) : restartCommand;
            execSyncProgressDisplay_1.default(restartCommandWrapped);
        }
        displayCommandDone_1.default(cmd);
    });
}
exports.default = ssl;
;
