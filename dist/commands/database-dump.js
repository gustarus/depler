"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const Command_1 = __importDefault(require("./../models/Command"));
const RemoteCommand_1 = __importDefault(require("./../models/RemoteCommand"));
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const formatter_1 = __importDefault(require("../instances/formatter"));
const moment_1 = __importDefault(require("moment"));
function databaseDump(program) {
    program
        .command('database-dump')
        .arguments('<path>')
        .description('Backup mysql database from the mysql docker container')
        .requiredOption('--code <code>', 'Code (name) of the mysql docker container')
        .requiredOption('--user <root>', 'Mysql database user to perform dump', 'root')
        .requiredOption('--password <string>', 'Mysql database password to perform dump')
        .requiredOption('--engine <mysql>', 'Choice database docker container engine to perform dump; only mysql is supported right now', 'mysql')
        .requiredOption('--database <data>', 'Mysql database password to perform dump', 'data')
        .option('--host <john@example.com>', 'Host where the mysql docker container is located')
        .option('--config <path>', 'Use custom config for the command')
        .action((path, cmd) => {
        displayCommandGreetings_1.default(cmd);
        const { code, host, user, password, engine, database } = loadConfig_1.default(cmd);
        if (engine !== 'mysql') {
            // TODO Support other database engines like postgresql.
            throw new Error('Sorry, but only mysql engine is supported at this moment to dump docker container database');
        }
        // create docker container mysql database dump
        const backupFileName = `backup-${moment_1.default().format('YYYY-MM-DD-HH-mm-ss')}.sql`;
        const dumpCommandContent = `/usr/bin/mysqldump -u${user} -p${password} ${database} > ~/${backupFileName}`;
        const dumpCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['docker', 'exec', code, dumpCommandContent] });
        const dumpCommandWrapped = host ? new RemoteCommand_1.default({ formatter: formatter_1.default, host, parts: [dumpCommand] }) : dumpCommand;
        execSyncProgressDisplay_1.default(dumpCommandWrapped);
        // download the remote database dump to the current folder
        const pathFrom = host
            ? `${host}:~/${backupFileName}`
            : `~/${backupFileName}`;
        const pathTo = `${path}/${backupFileName}`;
        const scpCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['scp', pathFrom, pathTo] });
        execSyncProgressDisplay_1.default(scpCommand);
        // clean up the raw dump from the remote location
        const cleanCommand = new Command_1.default({ formatter: formatter_1.default, parts: ['rm', '-rf', `~/${backupFileName}`] });
        const cleanCommandWrapped = host ? new RemoteCommand_1.default({ formatter: formatter_1.default, host, parts: [cleanCommand] }) : cleanCommand;
        execSyncProgressDisplay_1.default(cleanCommandWrapped);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = databaseDump;
;
