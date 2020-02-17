import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import getPathToTemporaryArchive from './../helpers/getPathToTemporaryArchive';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import Command from './../models/Command';
import { PATTERN_TAG } from './../constants';

export default function load(program: commander.Command) {
  program
    .command('load')
    .description('Load image from archive on remote host')
    .requiredOption('--tag <code:latest>', 'Docker image tag to resolve archive name')
    .requiredOption('--host <john@example.com>', 'Host where to load image')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);

      // get path to temporary archive and validate it
      const archive = getPathToTemporaryArchive(cmd.tag);

      // load docker container from archive
      execSyncProgressDisplay('ssh', cmd.host, new Command({ parts: ['docker', 'load', '-i', archive] })); // TODO Use remote command tool.
      execSyncProgressDisplay('ssh', cmd.host, new Command({ parts: ['rm', '-rf', archive] })); // TODO Use remote command tool.

      displayCommandDone(cmd);
    });
};
