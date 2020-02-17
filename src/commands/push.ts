import commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import loadCommandConfig from './../helpers/loadCommandConfig';
import resolveRegistryTagFromConfig from './../helpers/resolveRegistryTagFromConfig';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import { PATTERN_TAG } from './../constants';

export default function push(program: commander.Command) {
  program
    .command('push')
    .description('Push image to registry')
    .requiredOption('--tag <code:latest>', 'Docker image tag to transfer to remote host')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);
      const config = loadCommandConfig(cmd);
      const registryTag = resolveRegistryTagFromConfig(config);

      execSyncProgressDisplay(`docker push ${registryTag}`);

      displayCommandDone(cmd);
    });
};
