import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import RemoteCommand from '../models/RemoteCommand';
import Command from '../models/Command';
import loadConfig from '../helpers/loadConfig';
import formatter from '../instances/formatter';

export default function ssl(program: commander.Command) {
  program
    .command('ssl')
    .description('Create ssl certificate for the server name with `certbot` tool')
    .option('--host <john@example.com>', 'Host where to login to configure ssl')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      const { host, public: _public, certbot, ssl } = loadConfig(cmd);

      // create certbot configuration command
      const certbotCommand = new Command({ formatter, parts: ['sudo', 'certbot', { ...certbot, d: _public.name }] });
      const certbotCommandRemoteConfig = { formatter, host, parts: [certbotCommand] };
      const certbotCommandWrapped = host ? new RemoteCommand(certbotCommandRemoteConfig) : certbotCommand;
      execSyncProgressDisplay(certbotCommandWrapped);

      // restart nginx if required
      if (ssl.restart) {
        const restartCommand = new Command({ formatter, parts: ['sudo', 'service', 'nginx', 'restart'] });
        const restartCommandRemoteConfig = { formatter, host, parts: [restartCommand] };
        const restartCommandWrapped = host ? new RemoteCommand(restartCommandRemoteConfig) : restartCommand;
        execSyncProgressDisplay(restartCommandWrapped);
      }

      displayCommandDone(cmd);
    });
};
