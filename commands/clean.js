const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const getPathToTemporarySourceCode = require('./../helpers/getPathToTemporarySourceCode');
const getPathToTemporaryArchive = require('./../helpers/getPathToTemporaryArchive');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function clean(program) {
  program
    .command('clean')
    .description('Clean local and remote hosts')
    .option('--tag <code:latest>', 'Docker image tag to clean')
    .option('--host <john@example.com>', 'Host where to clean')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);
      requiredOption(cmd, 'host');

      // get path to temporary working directory
      const tmp = getPathToTemporarySourceCode(cmd.tag);

      // get path to temporary archive
      const archive = getPathToTemporaryArchive(cmd.tag);

      execSyncProgressDisplay(`rm -rf ${tmp} ${archive}`);
      execSyncProgressDisplay(`ssh ${cmd.host} 'rm -rf ${tmp} ${archive}'`);
      displayCommandDone(cmd);
    });
};