"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const constants_1 = require("./../constants");
const path = __importStar(require("path"));
const createFileFromTemplate_1 = __importDefault(require("../helpers/createFileFromTemplate"));
const RemoteCommand_1 = __importDefault(require("../models/RemoteCommand"));
const Command_1 = __importDefault(require("../models/Command"));
function nginx(program) {
    program
        .command('nginx')
        .description('Create nginx server name to proxy requests to docker container from target node')
        .option('--host <john@example.com>', 'Host where to login to configure nginx')
        .requiredOption('--source-name <example.com>', 'Server name for nginx configuration')
        .requiredOption('--source-port <80>', 'Port to listen for passed server name', '80')
        .requiredOption('--target-name <localhost>', 'Target server name to proxy requests', 'localhost')
        .requiredOption('--target-port <8000>', 'Target server port to proxy requests')
        .requiredOption('--path-to-sites </etc/nginx/sites>', 'Path to publish server configuration', '/etc/nginx/sites')
        .requiredOption('--with-restart', 'Restart nginx after configuration', false)
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        const { host, sourceName, sourcePort, targetName, targetPort, pathToSites, withRestart } = cmd;
        // create nginx configuration from template
        const pathToTemplateRuntime = path.resolve(constants_1.PATH_TO_RUNTIME, 'server.conf');
        createFileFromTemplate_1.default(constants_1.PATH_TO_TEMPLATE_SERVER, pathToTemplateRuntime, {
            SERVER_NAME: sourceName,
            SERVER_PORT: sourcePort,
            TARGET_NAME: targetName,
            TARGET_PORT: targetPort,
        });
        // copy configuration to remote server if required
        const scpTargetPath = `${pathToSites}/${sourceName}`;
        const scpTargetCommand = host ? `${host}:${scpTargetPath}` : scpTargetPath;
        const command = new Command_1.default({ parts: ['scp', pathToTemplateRuntime, scpTargetCommand] });
        execSyncProgressDisplay_1.default(command);
        // restart nginx if required
        if (withRestart) {
            const restartCommand = new Command_1.default({ parts: ['sudo', 'service', 'nginx', 'restart'] });
            const restartCommandRemoteConfig = { host, parts: [restartCommand] };
            const restartCommandWrapped = host ? new RemoteCommand_1.default(restartCommandRemoteConfig) : restartCommand;
            execSyncProgressDisplay_1.default(restartCommandWrapped);
        }
        displayCommandDone_1.default(cmd);
    });
}
exports.default = nginx;
;
