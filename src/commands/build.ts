import commander from 'commander';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import loadCommandConfig from './../helpers/loadCommandConfig';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import displayCommandDone from './../helpers/displayCommandDone';
import Command from './../models/Command';
import RemoteCommand from './../models/RemoteCommand';
import { PATTERN_TAG } from './../constants';

export default function build(program: commander.Command) {
  program
    .command('build')
    .arguments('<path>')
    .description('Build docker image from source code: local and remote build scenarios are allowed')
    .requiredOption('--tag <code:latest>', 'Tag for the image')
    .option('--host <john@example.com>', 'Host where to build docker image; if not passed: will be built locally')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'tag', PATTERN_TAG);

      const config = loadCommandConfig(cmd);
      const { tag } = config;

      // get ssh prefix command if remote build requested
      const command = new Command({ parts: ['docker', 'build', { tag }, config.image, path] });
      const wrapped = cmd.host ? new RemoteCommand({ host: cmd.host, parts: [command] }) : command;
      execSyncProgressDisplay(wrapped);

      displayCommandDone(cmd);
    });
};
