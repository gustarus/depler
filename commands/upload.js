const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const getPathToTemporarySourceCode = require('./../helpers/getPathToTemporarySourceCode');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const displayCommandDone = require('./../helpers/displayCommandDone');
const Command = require('./../models/Command');
const { TAG_FORMAT_PATTERN } = require('./../constants');

module.exports = function upload(program) {
  program
    .command('upload')
    .arguments('<path>')
    .description('Upload source code to the remote host')
    .option('--tag <code:latest>', 'Docker image tag to describe temporary folder')
    .option('--host <john@example.com>', 'Host where to upload source code')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'host');
      requiredOption(cmd, 'tag', TAG_FORMAT_PATTERN);

      // get temporary folder to store source code on the remote
      const tmp = getPathToTemporarySourceCode(cmd.tag);

      // execute child command
      execSyncProgressDisplay('ssh', cmd.host, new Command('rm', '-rf', tmp));
      execSyncProgressDisplay(`rsync --exclude='/.git' --filter="dir-merge,- .gitignore" -az ${path}/ ${cmd.host}:${tmp}`);
      displayCommandDone(cmd);
    });
};