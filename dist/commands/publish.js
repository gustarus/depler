"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
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
        const { host, public: _public, access, proxy: _proxy, ...rest } = loadConfig_1.default(cmd);
        const proxy = Array.isArray(_proxy) ? _proxy : [_proxy];
        // define path to files
        const targetPathDimensions = [
            _public.port !== constants_1.HTTP_PORT ? _public.port : undefined,
        ].filter(Boolean).join('.');
        const targetPathSuffix = targetPathDimensions && '.' + targetPathDimensions || '';
        const configTargetPath = `${_public.directory}/${_public.name}${targetPathSuffix}`;
        const credentialsTargetPath = `${_public.credentials}/${_public.name}${targetPathSuffix}`;
        // validate publishing tool
        if (_public.tool !== 'nginx') {
            throw new Error('Only nginx publishing tool currently supported');
        }
        // create and transfer credentials file if required
        const pathToCredentialsRuntime = path.resolve(constants_1.PATH_TO_RUNTIME, 'htpasswd');
        if (access.restrict) {
            // create credentials file content
            const credentials = Object.keys(access.credentials)
                .map((user) => `${user}:${access.credentials[user]}`).join('\n') + '\n';
            // create credentials file
            fs.writeFileSync(pathToCredentialsRuntime, credentials);
            // ensure that target credentials folder exist
            const createCredentialsFolderCommand = Command_1.default.create(formatter_1.default, ['mkdir', '-p', _public.credentials]);
            const createCredentialsFolderRemote = host
                ? RemoteCommand_1.default.createWithHost(formatter_1.default, host, [createCredentialsFolderCommand])
                : createCredentialsFolderCommand;
            execSyncProgressDisplay_1.default(createCredentialsFolderRemote);
            // transfer credentials file
            const transferCredentialsTarget = host ? `${host}:${credentialsTargetPath}` : credentialsTargetPath;
            const transferCredentialsCommand = Command_1.default.create(formatter_1.default, ['scp', pathToCredentialsRuntime, transferCredentialsTarget]);
            execSyncProgressDisplay_1.default(transferCredentialsCommand);
        }
        // create nginx configuration from template
        const pathToTemplateRuntime = path.resolve(constants_1.PATH_TO_RUNTIME, 'server.conf');
        createFileFromTemplate_1.default(constants_1.PATH_TO_TEMPLATE_SERVER, pathToTemplateRuntime, {
            SERVER_NAME: _public.name,
            SERVER_PORT: _public.port,
            ACCESS_RESTRICT: access.restrict,
            ACCESS_CREDENTIALS: credentialsTargetPath,
            PROXY: proxy.map((item) => ({
                LOCATION: item.location || constants_1.PROXY_DEFAULT_LOCATION,
                TARGET_NAME: item.name || constants_1.PROXY_DEFAULT_HOST,
                TARGET_PORT: item.port || constants_1.PROXY_DEFAULT_PORT,
            })),
        });
        // copy configuration file to remote server if required
        const configScpTargetCommand = host ? `${host}:${configTargetPath}` : configTargetPath;
        const transferConfigCommand = Command_1.default.create(formatter_1.default, ['scp', pathToTemplateRuntime, configScpTargetCommand]);
        execSyncProgressDisplay_1.default(transferConfigCommand);
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
