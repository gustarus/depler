#!/usr/bin/env node

const program = require('commander');
const info = require('./package.json');
const archive = require('./commands/archive');
const build = require('./commands/build');
const clean = require('./commands/clean');
const deploy = require('./commands/deploy');
const load = require('./commands/load');
const login = require('./commands/login');
const pull = require('./commands/pull');
const push = require('./commands/push');
const run = require('./commands/run');
const transfer = require('./commands/transfer');
const upload = require('./commands/upload');

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

// parse arguments
program.parse(process.argv);

// display help command
if (!process.argv.slice(2).length) {
  program.help();
}