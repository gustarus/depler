import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import getPathToTemporarySourceCode from './../helpers/getPathToTemporarySourceCode';
import getPathToTemporaryArchive from './../helpers/getPathToTemporaryArchive';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import loadConfig from '../helpers/loadConfig';
import { PATTERN_TAG } from './../constants';

export default function clean(program: commander.Command) {
  program
    .command('clean')
    .description('Clean local and remote hosts')
    .requiredOption('--tag <code:latest>', 'Docker image tag to clean')
    .requiredOption('--host <john@example.com>', 'Host where to clean')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);
      const { tag, host } = loadConfig(cmd);

      // get path to temporary working directory
      const tmp = getPathToTemporarySourceCode(tag);

      // get path to temporary archive
      const archive = getPathToTemporaryArchive(tag);

      // execute clean scenario
      execSyncProgressDisplay(`rm -rf ${tmp} ${archive}`);
      execSyncProgressDisplay(`ssh ${host} 'rm -rf ${tmp} ${archive}'`); // TODO Use remote command model.

      displayCommandDone(cmd);
    });
};
