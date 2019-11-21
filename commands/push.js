const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const loadCommandConfig = require('./../helpers/loadCommandConfig');
const resolveRegistryTagFromConfig = require('./../helpers/resolveRegistryTagFromConfig');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function push(program) {
  program
    .command('push')
    .description('Push image to registry')
    .option('--tag <code:latest>', 'Docker image tag to transfer to remote host')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);
      const config = loadCommandConfig(cmd);
      const registryTag = resolveRegistryTagFromConfig(config);

      execSyncProgressDisplay(`docker push ${registryTag}`);
      displayCommandDone(cmd);
    });
};