const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const loadCommandConfig = require('./../helpers/loadCommandConfig');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const Command = require('./../models/Command');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function build(program) {
  program
    .command('build')
    .arguments('<path>')
    .description('Build docker image from source code: local and remote build scenarios are allowed')
    .option('--tag <code:latest>', 'Tag for the image')
    .option('--host <john@example.com>', 'Host where to build docker image; if not passed: will be built locally')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);
      const config = loadCommandConfig(cmd);
      const { tag } = config;

      // get ssh prefix command if remote build requested
      const mainCommand = new Command('docker', 'build', { tag }, config.image, path);
      execSyncProgressDisplay(cmd.host ? new Command('ssh', cmd.host, mainCommand) : mainCommand);
      displayCommandDone(cmd);
    });
};