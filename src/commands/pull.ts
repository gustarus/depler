import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import resolveRegistryTagFromConfig from './../helpers/resolveRegistryTagFromConfig';
import validateOptionFormat from '../helpers/validateOptionFormat';
import RemoteCommand from './../models/RemoteCommand';
import Command from './../models/Command';
import { PATTERN_TAG } from './../constants';
import loadConfig from '../helpers/loadConfig';
import formatter from '../instances/formatter';

export default function pull(program: commander.Command) {
  program
    .command('pull')
    .description('Pull from remote registry')
    .requiredOption('--tag <code:latest>', 'Docker image tag to pull')
    .requiredOption('--host <john@example.com>', 'Host where to pull')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);
      const { host, registry } = loadConfig(cmd);
      const registryTag = resolveRegistryTagFromConfig(registry);

      // create shell command for docker login
      const command = new Command({ formatter, parts: [`docker pull ${registryTag}`] });
      const wrapped = host ? new RemoteCommand({ formatter, host, parts: [command] }) : command;

      // execute shell command
      execSyncProgressDisplay(wrapped);

      displayCommandDone(cmd);
    });
};
