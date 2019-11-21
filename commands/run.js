const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const loadCommandConfig = require('./../helpers/loadCommandConfig');
const displayCommandStep = require('./../helpers/displayCommandStep');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const execSyncProgressReturn = require('./../helpers/execSyncProgressReturn');
const getUniqueValues = require('./../helpers/getUniqueValues');
const displayCommandDone = require('./../helpers/displayCommandDone');
const RemoteCommand = require('./../models/RemoteCommand');
const Command = require('./../models/Command');
const { TAG_FORMAT_PATTERN, ALIAS_FORMAT_PATTERN } = require('./../constants');

module.exports = function run(program) {
  program
    .command('run')
    .description('Run container on remote host')
    .option('--tag <code:latest>', 'Docker image tag to run on remote host')
    .option('--alias <name>', 'Docker image name alias to run as')
    .option('--host <john@example.com>', 'Host where to run docker container')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);
      requiredOption(cmd, 'alias', ALIAS_FORMAT_PATTERN);
      requiredOption(cmd, 'host');
      const config = loadCommandConfig(cmd);
      const { tag, alias } = config;

      if (config.container.network) {
        displayCommandStep(cmd, 'Creating required networks');
        const networks = typeof config.container.network === 'string'
          ? [config.container.network] : config.container.network;

        for (const network of networks) {
          const networkCommand = new Command(`docker network create -d bridge ${network} || true`);
          const networkCommandWrapped = cmd.host ? new RemoteCommand(cmd.host, networkCommand) : networkCommand;
          execSyncProgressDisplay(networkCommandWrapped);
        }
      }

      displayCommandStep(cmd, 'Checking for already running containers');

      const listCommand = new Command(`docker ps -a -q --filter "name=^${alias}$" --format="{{.ID}}"`);
      const listCommandWrapped = cmd.host ? new RemoteCommand(cmd.host, listCommand) : listCommand;
      const psResult = execSyncProgressReturn(listCommandWrapped);
      if (psResult) {
        displayCommandStep(cmd, 'Stopping and removing running containers');
        const containersIds = getUniqueValues(psResult.split('\n'));
        const removeCommand = new Command(`docker rm -f ${containersIds.join(' ')}`);
        const removeCommandWrapped = cmd.host ? new RemoteCommand(cmd.host, removeCommand) : removeCommand;
        execSyncProgressDisplay(removeCommandWrapped);
      } else {
        displayCommandStep(cmd, 'There is no running containers');
      }

      displayCommandStep(cmd, `Run the image as a container`);

      const runCommand = new Command('docker run', { name: alias }, config.container, tag);
      const runCommandWrapped = cmd.host ? new RemoteCommand(cmd.host, runCommand) : runCommand;
      execSyncProgressDisplay(runCommandWrapped);

      displayCommandDone(cmd);
    });
};