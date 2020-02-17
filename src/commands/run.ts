import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import loadCommandConfig from './../helpers/loadCommandConfig';
import displayCommandStep from './../helpers/displayCommandStep';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import execSyncProgressReturn from './../helpers/execSyncProgressReturn';
import getUniqueValues from './../helpers/getUniqueValues';
import displayCommandDone from './../helpers/displayCommandDone';
import RemoteCommand from './../models/RemoteCommand';
import Command from './../models/Command';
import { PATTERN_TAG, PATTERN_SIGN } from './../constants';

export default function run(program: commander.Command) {
  program
    .command('run')
    .description('Run container on remote host')
    .requiredOption('--tag <code:latest>', 'Docker image tag to run on remote host')
    .requiredOption('--sign <name>', 'Docker image name sign to run as')
    .requiredOption('--host <john@example.com>', 'Host where to run docker container')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);
      validateOptionFormat(cmd, 'sign', PATTERN_SIGN);
      const config = loadCommandConfig(cmd);
      const { tag, sign } = config;

      if (config.container.network) {
        displayCommandStep(cmd, 'Creating required networks');
        const networks = typeof config.container.network === 'string'
          ? [config.container.network] : config.container.network;

        for (const network of networks) {
          const networkCommand = new Command({ parts: [`docker network create -d bridge ${network} || true`] });
          const networkCommandRemoteConfig = { host: cmd.host, parts: [networkCommand] };
          const networkCommandWrapped = cmd.host ? new RemoteCommand(networkCommandRemoteConfig) : networkCommand;
          execSyncProgressDisplay(networkCommandWrapped);
        }
      }

      displayCommandStep(cmd, 'Checking for already running containers');

      const listCommand = new Command({ parts: [`docker ps -a -q --filter "name=^${sign}$" --format="{{.ID}}"`] });
      const listCommandWrapped = cmd.host ? new RemoteCommand({ host: cmd.host, parts: [listCommand] }) : listCommand;
      const psResult = execSyncProgressReturn(listCommandWrapped);
      if (psResult) {
        displayCommandStep(cmd, 'Stopping and removing running containers');
        const containersIds = getUniqueValues(psResult.split('\n'));
        const removeCommand = new Command({ parts: [`docker rm -f ${containersIds.join(' ')}`] });
        const removeCommandRemoteConfig = { host: cmd.host, parts: [removeCommand] };
        const removeCommandWrapped = cmd.host ? new RemoteCommand(removeCommandRemoteConfig) : removeCommand;
        execSyncProgressDisplay(removeCommandWrapped);
      } else {
        displayCommandStep(cmd, 'There is no running containers');
      }

      displayCommandStep(cmd, `Run the image as a container`);

      const runCommand = new Command({ parts: ['docker run', { name: sign }, config.container, tag] });
      const runCommandWrapped = cmd.host ? new RemoteCommand({ host: cmd.host, parts: [runCommand] }) : runCommand;
      execSyncProgressDisplay(runCommandWrapped);

      displayCommandDone(cmd);
    });
};
