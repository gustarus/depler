const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const loadCommandConfig = require('./../helpers/loadCommandConfig');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
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
      const { registry } = config;

      // create shell command for docker login
      const command = new Command(`echo ${registry.password} | docker login -u ${registry.username} ${registry.host} --password-stdin`);
      const commandWrapped = cmd.host ? new RemoteCommand(cmd.host, command) : command;
      commandWrapped.configure({ with: [registry.username, registry.password] });

      execSyncProgressDisplay(commandWrapped);
      displayCommandDone(cmd);
    });
};