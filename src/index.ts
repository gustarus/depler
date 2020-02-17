#!/usr/bin/env node

import program from 'commander';
import colors from 'colors';
import archive from './commands/archive';
import build from './commands/build';
import clean from './commands/clean';
import deploy from './commands/deploy';
import load from './commands/load';
import login from './commands/login';
import pull from './commands/pull';
import push from './commands/push';
import run from './commands/run';
import transfer from './commands/transfer';
import upload from './commands/upload';
import Package from './models/Package';
import { PATH_TO_PACKAGE } from './constants';

const info = new Package({ path: PATH_TO_PACKAGE });

// display program description
program
  .version(info.version)
  .description('Tool to deploy docker containers to remote host');

// bind commands
// to the program
archive(program);
build(program);
clean(program);
deploy(program);
load(program);
login(program);
pull(program);
push(program);
run(program);
transfer(program);
upload(program);

// override exit
program.exitOverride();

// listen to promises rejection
process.on('uncaughtException' as any, processError);
process.on('unhandledRejection' as any, processError);

// parse arguments
program.parse(process.argv);

// display help command
if (!process.argv.slice(2).length) {
  program.help();
}

function processError(error: Error) {
  console.log(colors.red.bold(error.toString()));
  console.log(error);
  process.exit(1);
}
