const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const loadCommandConfig = require('./../helpers/loadCommandConfig');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const resolveRegistryTagFromConfig = require('./../helpers/resolveRegistryTagFromConfig');
const requiredOption = require('./../helpers/requiredOption');
const displayCommandStep = require('./../helpers/displayCommandStep');
const RemoteCommand = require('./../models/RemoteCommand');
const Command = require('./../models/Command');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function pull(program) {
  program
    .command('pull')
    .description('Pull from remote registry')
    .option('--tag <code:latest>', 'Docker image tag to pull')
    .option('--host <john@example.com>', 'Host where to pull')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);
      requiredOption(cmd, 'host');
      const config = loadCommandConfig(cmd);
      const registryTag = resolveRegistryTagFromConfig(config);

      // create shell command for docker login
      const command = new Command(`docker pull ${registryTag}`);
      const commandWrapped = cmd.host ? new RemoteCommand(cmd.host, command) : command;

      // execute shell command
      execSyncProgressDisplay(commandWrapped);
      displayCommandDone(cmd);
    });
};