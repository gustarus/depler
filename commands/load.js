const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const getPathToTemporaryArchive = require('./../helpers/getPathToTemporaryArchive');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const Command = require('./../models/Command');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function load(program) {
  program
    .command('load')
    .description('Load image from archive on remote host')
    .option('--tag <code:latest>', 'Docker image tag to resolve archive name')
    .option('--host <john@example.com>', 'Host where to load image')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);
      requiredOption(cmd, 'host');

      // get path to temporary archive and validate it
      const archive = getPathToTemporaryArchive(cmd.tag);

      execSyncProgressDisplay('ssh', cmd.host, new Command('docker', 'load', '-i', archive));
      execSyncProgressDisplay('ssh', cmd.host, new Command('rm', '-rf', archive));
      displayCommandDone(cmd);
    });
};