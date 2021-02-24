import * as fs from 'fs-extra';
import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import {
  HTTP_PORT,
  PATH_TO_RUNTIME,
  PATH_TO_TEMPLATE_SERVER,
  PROXY_DEFAULT_HOST,
  PROXY_DEFAULT_LOCATION,
  PROXY_DEFAULT_PORT,
} from './../constants';
import * as path from 'path';
import createFileFromTemplate from '../helpers/createFileFromTemplate';
import RemoteCommand from '../models/RemoteCommand';
import Command from '../models/Command';
import formatter from '../instances/formatter';
import loadConfig from '../helpers/loadConfig';
import { ConfigSpace } from '../models/Config';

export default function publish(program: commander.Command) {
  program
    .command('publish')
    .description('Publish web site to the internet from remote server')
    .option('--host <john@example.com>', 'Host where to login to configure nginx')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      const { host, public: _public, access, proxy: _proxy, ...rest } = loadConfig(cmd);
      const proxy: ConfigSpace.Proxy[] = Array.isArray(_proxy) ? _proxy : [_proxy];

      // define path to files
      const targetPathDimensions = [
        _public.port !== HTTP_PORT ? _public.port : undefined,
      ].filter(Boolean).join('.');
      const targetPathSuffix = targetPathDimensions && '.' + targetPathDimensions || '';
      const configTargetPath = `${_public.directory}/${_public.name}${targetPathSuffix}`;
      const credentialsTargetPath = `${_public.credentials}/${_public.name}${targetPathSuffix}`;

      // validate publishing tool
      if (_public.tool !== 'nginx') {
        throw new Error('Only nginx publishing tool currently supported');
      }

      // create and transfer credentials file if required
      const pathToCredentialsRuntime = path.resolve(PATH_TO_RUNTIME, 'htpasswd');
      if (access.restrict) {
        // create credentials file content
        const credentials = Object.keys(access.credentials)
          .map((user) => `${user}:${access.credentials[user]}`).join('\n') + '\n';

        // create credentials file
        fs.writeFileSync(pathToCredentialsRuntime, credentials);

        // ensure that target credentials folder exist
        const createCredentialsFolderCommand = Command.create(formatter, ['mkdir', '-p', _public.credentials]);
        const createCredentialsFolderRemote = host
          ? RemoteCommand.createWithHost(formatter, host, [createCredentialsFolderCommand])
          : createCredentialsFolderCommand;
        execSyncProgressDisplay(createCredentialsFolderRemote);

        // transfer credentials file
        const transferCredentialsTarget = host ? `${host}:${credentialsTargetPath}` : credentialsTargetPath;
        const transferCredentialsCommand = Command.create(formatter, ['scp', pathToCredentialsRuntime, transferCredentialsTarget]);
        execSyncProgressDisplay(transferCredentialsCommand);
      }

      // create nginx configuration from template
      const pathToTemplateRuntime = path.resolve(PATH_TO_RUNTIME, 'server.conf');
      createFileFromTemplate(PATH_TO_TEMPLATE_SERVER, pathToTemplateRuntime, {
        SERVER_NAME: _public.name,
        SERVER_PORT: _public.port,
        ACCESS_RESTRICT: access.restrict,
        ACCESS_CREDENTIALS: credentialsTargetPath,
        PROXY: proxy.map((item) => ({
          LOCATION: item.location || PROXY_DEFAULT_LOCATION,
          TARGET_NAME: item.name || PROXY_DEFAULT_HOST,
          TARGET_PORT: item.port || PROXY_DEFAULT_PORT,
        })),
      });

      // copy configuration file to remote server if required
      const configScpTargetCommand = host ? `${host}:${configTargetPath}` : configTargetPath;
      const transferConfigCommand = Command.create(formatter, ['scp', pathToTemplateRuntime, configScpTargetCommand]);
      execSyncProgressDisplay(transferConfigCommand);

      // restart tool if required
      if (_public.restart) {
        const restartCommand = new Command({ formatter, parts: ['sudo', 'service', 'nginx', 'restart'] });
        const restartCommandRemoteConfig = { formatter, host, parts: [restartCommand] };
        const restartCommandWrapped = host ? new RemoteCommand(restartCommandRemoteConfig) : restartCommand;
        execSyncProgressDisplay(restartCommandWrapped);
      }

      displayCommandDone(cmd);
    });
};
