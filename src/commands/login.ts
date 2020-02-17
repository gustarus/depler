import commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import loadCommandConfig from './../helpers/loadCommandConfig';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import resolveRegistryFromConfig from './../helpers/resolveRegistryFromConfig';
import RemoteCommand from './../models/RemoteCommand';
import Command from './../models/Command';

export default function login(program: commander.Command) {
  program
    .command('login')
    .description('Login into docker registry')
    .option('--host <john@example.com>', 'Host where to login into registry')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      const config = loadCommandConfig(cmd);

      // resolve username and host from registry environment variables
      const registry = resolveRegistryFromConfig(config);
      if (!registry) {
        throw new Error('Unable to resolve registry configuration');
      }

      // transfer password as environment variable
      const { username, host } = registry;
      const { password } = config.registry;

      // create shell command for docker login
      const command = new Command({ parts: [`echo ${password} | docker login -u ${username} ${host} --password-stdin`] });
      const commandRemoteConfig = { host: cmd.host, parts: [command], with: [password] };
      const wrapped: Command = cmd.host ? new RemoteCommand(commandRemoteConfig) : command;

      // run docker registry login
      execSyncProgressDisplay(wrapped);

      displayCommandDone(cmd);
    });
};
