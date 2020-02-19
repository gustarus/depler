import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import { PATH_TO_RUNTIME, PATH_TO_TEMPLATE_SERVER } from './../constants';
import * as path from 'path';
import createFileFromTemplate from '../helpers/createFileFromTemplate';
import RemoteCommand from '../models/RemoteCommand';
import Command from '../models/Command';
import formatter from '../instances/formatter';
import loadConfig from '../helpers/loadConfig';

export default function publish(program: commander.Command) {
  program
    .command('publish')
    .description('Publish web site to the internet from remote server')
    .option('--host <john@example.com>', 'Host where to login to configure nginx')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      const { host, public: _public, proxy: _proxy } = loadConfig(cmd);

      // validate publishing tool
      if (_public.tool !== 'nginx') {
        throw new Error('Only nginx publishing tool currently supported');
      }

      // create nginx configuration from template
      const pathToTemplateRuntime = path.resolve(PATH_TO_RUNTIME, 'server.conf');
      createFileFromTemplate(PATH_TO_TEMPLATE_SERVER, pathToTemplateRuntime, {
        SERVER_NAME: _public.name,
        SERVER_PORT: _public.port,
        TARGET_NAME: _proxy.name,
        TARGET_PORT: _proxy.port,
      });

      // copy configuration to remote server if required
      const scpTargetPath = `${_public.directory}/${_public.name}`;
      const scpTargetCommand = host ? `${host}:${scpTargetPath}` : scpTargetPath;
      const command = new Command({ formatter, parts: ['scp', pathToTemplateRuntime, scpTargetCommand] });
      execSyncProgressDisplay(command);

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
