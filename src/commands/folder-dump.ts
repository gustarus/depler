import * as commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import Command from './../models/Command';
import RemoteCommand from './../models/RemoteCommand';
import loadConfig from '../helpers/loadConfig';
import formatter from '../instances/formatter';
import { PATTERN_TAG } from '../constants';
import moment from 'moment';
import prepareSelectedFolder from '../helpers/prepareSelectedFolder';

export default function folderDump(program: commander.Command) {
  program
    .command('folder-dump')
    .arguments('<path>')
    .description('Dump folder from remote machine')
    .requiredOption('--source <path/to/folder>', 'Path to source folder to dump')
    .option('--host <john@example.com>', 'Host where the mysql docker container is located')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      const { host, source } = loadConfig(cmd);

      // download the remote database dump to the current folder
      const copyPathFrom = prepareSelectedFolder(host, source) + '/*';
      const copyPathTo = prepareSelectedFolder(undefined, path);

      const rsyncRemote = host
        ? `${host}:${copyPathFrom}` : copyPathFrom;
      const rsyncCommand = new Command({ formatter, parts: ['rsync -ra --progress', rsyncRemote, copyPathTo] });
      execSyncProgressDisplay(rsyncCommand);

      displayCommandDone(cmd);
    });
};
