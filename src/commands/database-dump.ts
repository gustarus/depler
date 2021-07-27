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

export default function databaseDump(program: commander.Command) {
  program
    .command('database-dump')
    .arguments('<path>')
    .description('Dump database data from docker database container')
    .requiredOption('--code <code>', 'Code (name) of the mysql docker container')
    .requiredOption('--user <root>', 'Mysql database user to perform dump', 'root')
    .requiredOption('--password <string>', 'Mysql database password to perform dump')
    .requiredOption('--engine <mysql>', 'Choice database docker container engine to perform dump; only mysql is supported right now', 'mysql')
    .requiredOption('--database <data>', 'Mysql database password to perform dump', 'data')
    .option('--host <john@example.com>', 'Host where the mysql docker container is located')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      const { code, host, user, password, engine, database } = loadConfig(cmd);
      if (engine !== 'mysql') {
        // TODO Support other database engines like postgresql.
        throw new Error('Sorry, but only mysql engine is supported at this moment to dump docker container database');
      }

      // create docker container mysql database dump
      const backupFileName = `${code}-${moment().format('YYYY-MM-DD-HH-mm-ss')}.sql`;
      const dumpCommandContent = `/usr/bin/mysqldump --user=${user} --password="${password}" ${database} > ~/${backupFileName}`;
      const dumpCommand = new Command({ formatter, parts: ['docker', 'exec', code, dumpCommandContent] });
      const dumpCommandWrapped = host ? new RemoteCommand({ formatter, host, parts: [dumpCommand] }) : dumpCommand;
      execSyncProgressDisplay(dumpCommandWrapped);

      // ensure source and target folders for the transfer
      const copyPathFrom = prepareSelectedFolder(host, '~/');
      const copyPathTo = prepareSelectedFolder(undefined, path);

      // download the remote database dump to the current folder
      const scpRemote = host
        ? `${host}:${copyPathFrom}/${backupFileName}`
        : `${copyPathFrom}/${backupFileName}`;
      const scpTarget = `${copyPathTo}/${backupFileName}`;
      const scpCommand = new Command({ formatter, parts: ['scp', scpRemote, scpTarget] });
      execSyncProgressDisplay(scpCommand);

      // clean up the raw dump from the remote location
      const cleanCommand = new Command({ formatter, parts: ['rm', '-rf', `~/${backupFileName}`] });
      const cleanCommandWrapped = host ? new RemoteCommand({ formatter, host, parts: [cleanCommand] }) : cleanCommand;
      execSyncProgressDisplay(cleanCommandWrapped);

      displayCommandDone(cmd);
    });
};
