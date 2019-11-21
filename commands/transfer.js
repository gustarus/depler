const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const getPathToTemporaryArchive = require('./../helpers/getPathToTemporaryArchive');
const requiredPath = require('./../helpers/requiredPath');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function transfer(program) {
  program
    .command('transfer')
    .description('Transfer image archive to remote host')
    .option('--tag <code:latest>', 'Docker image tag to transfer to remote host')
    .option('--host <john@example.com>', 'Host to deploy docker container')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);
      requiredOption(cmd, 'host');

      // get path to temporary archive and validate it
      const archive = getPathToTemporaryArchive(cmd.tag);
      requiredPath(archive, `The archive doesn\'t exist: ${archive}.`);

      execSyncProgressDisplay(`scp ${archive} ${cmd.host}:${archive}`);
      execSyncProgressDisplay(`rm -rf ${archive}`);
      displayCommandDone(cmd);
    });
};