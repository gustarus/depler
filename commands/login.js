const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const loadCommandConfig = require('./../helpers/loadCommandConfig');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const resolveRegistryFromConfig = require('./../helpers/resolveRegistryFromConfig');
const RemoteCommand = require('./../models/RemoteCommand');
const Command = require('./../models/Command');

module.exports = function login(program) {
  program
    .command('login')
    .description('Login into docker registry')
    .option('--host <john@example.com>', 'Host where to login into registry')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      const config = loadCommandConfig(cmd);

      // resolve username and host from registry environment variables
      const { username, host } = resolveRegistryFromConfig(config);

      // transfer password as environment variable
      const { password } = config.registry;

      // create shell command for docker login
      const command = new Command(`echo ${password} | docker login -u ${username} ${host} --password-stdin`);
      const commandWrapped = cmd.host ? new RemoteCommand(cmd.host, command) : command;

      // configure remote command to pass environment variables
      if (commandWrapped instanceof RemoteCommand) {
        commandWrapped.configure({ with: [password] });
      }

      execSyncProgressDisplay(commandWrapped);
      displayCommandDone(cmd);
    });
};