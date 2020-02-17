import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import { PATH_TO_RUNTIME, PATH_TO_TEMPLATE_SERVER } from './../constants';
import * as path from 'path';
import createFileFromTemplate from '../helpers/createFileFromTemplate';
import RemoteCommand from '../models/RemoteCommand';
import Command from '../models/Command';

export default function ssl(program: commander.Command) {
  program
    .command('ssl')
    .description('Create ssl certificate for the server name with `certbot` tool')
    .option('--host <john@example.com>', 'Host where to login to configure ssl')
    .requiredOption('--domain <example.com>', 'Server name to setup ssl')
    .requiredOption('--with-redirect', 'Setup redirect from http to https', false)
    .requiredOption('--with-restart', 'Restart nginx after configuration', false)
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      const { host, domain, withRedirect, withRestart } = cmd;

      // create certbot configuration command
      const certbotCommand = new Command({
        parts: ['sudo', 'certbot', {
          d: domain,
          nginx: true,
          n: true,
          'agree-tos': true,
          email: 'foo@bar.com',
          redirect: withRedirect,
          'no-redirect': !withRedirect,
        }],
      });
      const certbotCommandRemoteConfig = { host, parts: [certbotCommand] };
      const certbotCommandWrapped = host ? new RemoteCommand(certbotCommandRemoteConfig) : certbotCommand;
      execSyncProgressDisplay(certbotCommandWrapped);

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
