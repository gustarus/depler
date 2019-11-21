const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const getPathToTemporaryArchive = require('./../helpers/getPathToTemporaryArchive');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function archive(program) {
  program
    .command('archive')
    .description('Archive image to temporary file')
    .option('--tag <code:latest>', 'Docker image tag to archive to temporary file')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);

      // get path to temporary archive
      const archive = getPathToTemporaryArchive(cmd.tag);

      execSyncProgressDisplay(`docker save -o ${archive} ${cmd.tag}`);
      displayCommandDone(cmd);
    });
};