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
const formatter_1 = __importDefault(require("../instances/formatter"));
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
function publish(program) {
    program
        .command('publish')
        .description('Publish web site to the internet from remote server')
        .option('--host <john@example.com>', 'Host where to login to configure nginx')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        const { host, public: _public, proxy: _proxy } = loadConfig_1.default(cmd);
        // validate publishing tool
        if (_public.tool !== 'nginx') {
            throw new Error('Only nginx publishing tool currently supported');
        }
        // create nginx configuration from template
        const pathToTemplateRuntime = path.resolve(constants_1.PATH_TO_RUNTIME, 'server.conf');
        createFileFromTemplate_1.default(constants_1.PATH_TO_TEMPLATE_SERVER, pathToTemplateRuntime, {
            SERVER_NAME: _public.name,
            SERVER_PORT: _public.port,
            TARGET_NAME: _proxy.name,
            TARGET_PORT: _proxy.port,
        });
        // copy configuration to remote server if required
        const scpTargetPath = `${_public.directory}/${_public.name}`;
        const scpTargetCommand = host ? `${host}:${scpTargetPath}` : scpTargetPath;
        const command = new Command_1.default({ formatter: formatter_1.default, parts: ['scp', pathToTemplateRuntime, scpTargetCommand] });
        execSyncProgressDisplay_1.default(command);
        // restart tool if required
        if (_public.restart) {
            const restartCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['sudo', 'service', 'nginx', 'restart'] });
            const restartCommandRemoteConfig = { formatter: formatter_1.default, host, parts: [restartCommand] };
            const restartCommandWrapped = host ? new RemoteCommand_1.default(restartCommandRemoteConfig) : restartCommand;
            execSyncProgressDisplay_1.default(restartCommandWrapped);
        }
        displayCommandDone_1.default(cmd);
    });
}
exports.default = publish;
;
