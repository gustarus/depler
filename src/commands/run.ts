import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import displayCommandStep from './../helpers/displayCommandStep';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import execSyncProgressReturn from './../helpers/execSyncProgressReturn';
import getUniqueValues from './../helpers/getUniqueValues';
import displayCommandDone from './../helpers/displayCommandDone';
import RemoteCommand from './../models/RemoteCommand';
import Command from './../models/Command';
import loadConfig from '../helpers/loadConfig';
import formatter from '../instances/formatter';
import { PATTERN_TAG } from './../constants';

export default function run(program: commander.Command) {
  program
    .command('run')
    .description('Run container on remote host')
    .requiredOption('--code <hello>', 'Docker container name to run on remote host')
    .requiredOption('--tag <code:latest>', 'Docker image tag to run on remote host')
    .requiredOption('--host <john@example.com>', 'Host where to run docker container')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);
      const { code, tag, host, container } = loadConfig(cmd);

      const networks = typeof container.network === 'string'
        ? [container.network] : container.network;

      if (container.network) {
        displayCommandStep(cmd, 'Creating required networks');

        for (const network of networks) {
          const networkCommand = new Command({
            formatter,
            parts: [`docker network create -d bridge ${network} || true`],
          });
          const networkCommandRemoteConfig = { formatter, host, parts: [networkCommand] };
          const networkCommandWrapped = host ? new RemoteCommand(networkCommandRemoteConfig) : networkCommand;
          execSyncProgressDisplay(networkCommandWrapped);
        }
      }

      displayCommandStep(cmd, 'Checking for already running containers');

      const listCommand = new Command({
        formatter,
        parts: [`docker ps -a -q --filter "name=^${code}$" --format="{{.ID}}"`],
      });
      const listCommandWrapped = host ? new RemoteCommand({
        formatter,
        host,
        parts: [listCommand],
      }) : listCommand;
      const psResult = execSyncProgressReturn(listCommandWrapped);
      if (psResult) {
        displayCommandStep(cmd, 'Stopping and removing running containers');
        const containersIds = getUniqueValues(psResult.split('\n'));
        const removeCommand = new Command({ formatter, parts: [`docker rm -f ${containersIds.join(' ')}`] });
        const removeCommandRemoteConfig = { formatter, host, parts: [removeCommand] };
        const removeCommandWrapped = host ? new RemoteCommand(removeCommandRemoteConfig) : removeCommand;
        execSyncProgressDisplay(removeCommandWrapped);
      } else {
        displayCommandStep(cmd, 'There is no running containers');
      }

      displayCommandStep(cmd, `Run the image as a container`);

      const [networksGeneral, ...networksChild] = networks;
      const containerOptions = { ...container, network: networksGeneral };
      const runCommand = new Command({ formatter, parts: ['docker run', { name: code }, containerOptions, tag] });
      const runCommandWrapped = host
        ? new RemoteCommand({ formatter, host, parts: [runCommand] }) : runCommand;
      execSyncProgressDisplay(runCommandWrapped);

      for (const network of networksChild) {
        const runCommand = new Command({ formatter, parts: ['docker', 'network', 'connect', network, code] });
        const runCommandWrapped = host
          ? new RemoteCommand({ formatter, host, parts: [runCommand] }) : runCommand;
        execSyncProgressDisplay(runCommandWrapped);
      }

      displayCommandDone(cmd);
    });
};
