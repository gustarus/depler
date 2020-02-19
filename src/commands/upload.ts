import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import getPathToTemporarySourceCode from './../helpers/getPathToTemporarySourceCode';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import Command from './../models/Command';
import { PATTERN_TAG } from './../constants';
import loadConfig from '../helpers/loadConfig';
import formatter from '../instances/formatter';

export default function upload(program: commander.Command) {
  program
    .command('upload')
    .arguments('<path>')
    .description('Upload source code to the remote host')
    .requiredOption('--tag <code:latest>', 'Docker image tag to describe temporary folder')
    .requiredOption('--host <john@example.com>', 'Host where to upload source code')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);
      const { tag, host } = loadConfig(cmd);

      // get temporary folder to store source code on the remote
      const tmp = getPathToTemporarySourceCode(tag);

      // execute child command
      execSyncProgressDisplay('ssh', host, new Command({ formatter, parts: ['rm', '-rf', tmp] })); // TODO Use remote command tool.
      execSyncProgressDisplay(`rsync --exclude='/.git' --filter="dir-merge,- .gitignore" -az ${path}/ ${host}:${tmp}`);
      displayCommandDone(cmd);
    });
};
