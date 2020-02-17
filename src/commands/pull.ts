import commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import loadCommandConfig from './../helpers/loadCommandConfig';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import resolveRegistryTagFromConfig from './../helpers/resolveRegistryTagFromConfig';
import validateOptionFormat from '../helpers/validateOptionFormat';
import RemoteCommand from './../models/RemoteCommand';
import Command from './../models/Command';
import { PATTERN_TAG } from './../constants';

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
      const config = loadCommandConfig(cmd);
      const registryTag = resolveRegistryTagFromConfig(config);

      // create shell command for docker login
      const command = new Command({ parts: [`docker pull ${registryTag}`] });
      const wrapped = cmd.host ? new RemoteCommand({ host: cmd.host, parts: [command] }) : command;

      // execute shell command
      execSyncProgressDisplay(wrapped);

      displayCommandDone(cmd);
    });
};
