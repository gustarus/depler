import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import { PATH_TO_RUNTIME, PATH_TO_TEMPLATE_SERVER } from './../constants';
import * as path from 'path';
import createFileFromTemplate from '../helpers/createFileFromTemplate';
import RemoteCommand from '../models/RemoteCommand';
import Command from '../models/Command';

export default function nginx(program: commander.Command) {
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
      displayCommandGreetings(cmd);
      const { host, sourceName, sourcePort, targetName, targetPort, pathToSites, withRestart } = cmd;

      // create nginx configuration from template
      const pathToTemplateRuntime = path.resolve(PATH_TO_RUNTIME, 'server.conf');
      createFileFromTemplate(PATH_TO_TEMPLATE_SERVER, pathToTemplateRuntime, {
        SERVER_NAME: sourceName,
        SERVER_PORT: sourcePort,
        TARGET_NAME: targetName,
        TARGET_PORT: targetPort,
      });

      // copy configuration to remote server if required
      const scpTargetPath = `${pathToSites}/${sourceName}`;
      const scpTargetCommand = host ? `${host}:${scpTargetPath}` : scpTargetPath;
      const command = new Command({ parts: ['scp', pathToTemplateRuntime, scpTargetCommand] });
      execSyncProgressDisplay(command);

      // restart nginx if required
      if (withRestart) {
        const restartCommand = new Command({ parts: ['sudo', 'service', 'nginx', 'restart'] });
        const restartCommandRemoteConfig = { host, parts: [restartCommand] };
        const restartCommandWrapped = host ? new RemoteCommand(restartCommandRemoteConfig) : restartCommand;
        execSyncProgressDisplay(restartCommandWrapped);
      }

      displayCommandDone(cmd);
    });
};
