import commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import getPathToTemporaryArchive from './../helpers/getPathToTemporaryArchive';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import { PATTERN_TAG } from './../constants';

export default function archive(program: commander.Command) {
  program
    .command('archive')
    .description('Archive image to temporary file')
    .requiredOption('--tag <code:latest>', 'Docker image tag to archive to temporary file')
    .option('--config <path>', 'Use custom config for the command')
    .action((cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);

      // get path to temporary archive and archive the image
      const archive = getPathToTemporaryArchive(cmd.tag);
      execSyncProgressDisplay(`docker save -o ${archive} ${cmd.tag}`);

      displayCommandDone(cmd);
    });
};
