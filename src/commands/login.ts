import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import resolveRegistryFromConfig from './../helpers/resolveRegistryFromConfig';
import RemoteCommand from './../models/RemoteCommand';
import Command from './../models/Command';
import loadConfig from '../helpers/loadConfig';
import formatter from '../instances/formatter';

export default function login(program: commander.Command) {
  program
    .command('login')
    .description('Login into docker registry')
    .option('--host <john@example.com>', 'Host where to login into registry')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      const { host, registry } = loadConfig(cmd);

      // resolve username and host from registry environment variables
      const registryResolved = resolveRegistryFromConfig(registry);
      if (!registryResolved) {
        throw new Error('Unable to resolve registry configuration');
      }

      // transfer password as environment variable
      const { password } = registry;

      // create shell command for docker login
      const command = new Command({
        formatter,
        parts: [`echo ${password} | docker login -u ${registryResolved.username} ${registryResolved.host} --password-stdin`],
      });
      const commandRemoteConfig = { formatter, host, parts: [command], with: [password] };
      const wrapped: Command = host ? new RemoteCommand(commandRemoteConfig) : command;

      // run docker registry login
      execSyncProgressDisplay(wrapped);

      displayCommandDone(cmd);
    });
};
