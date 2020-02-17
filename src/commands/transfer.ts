import commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import getPathToTemporaryArchive from './../helpers/getPathToTemporaryArchive';
import validatePathExists from '../helpers/validatePathExists';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import { PATTERN_TAG } from './../constants';

export default function transfer(program:commander.Command) {
  program
    .command('transfer')
    .description('Transfer image archive to remote host')
    .requiredOption('--tag <code:latest>', 'Docker image tag to transfer to remote host')
    .requiredOption('--host <john@example.com>', 'Host to deploy docker container')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);

      // get path to temporary archive and validate it
      const archive = getPathToTemporaryArchive(cmd.tag);
      validatePathExists(archive, `The archive doesn\'t exist: ${archive}.`);

      // transfer container archive to remote host
      execSyncProgressDisplay(`scp ${archive} ${cmd.host}:${archive}`);
      execSyncProgressDisplay(`rm -rf ${archive}`);

      displayCommandDone(cmd);
    });
};
