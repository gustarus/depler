import * as commander from 'commander';
import resolveExecutable from '../helpers/resolveExecutable';
import displayCommandGreetings from './../helpers/displayCommandGreetings';
import validateOptionFormat from '../helpers/validateOptionFormat';
import getLatestCommitHash from './../helpers/getLatestCommitHash';
import displayCommandStep from './../helpers/displayCommandStep';
import execSyncProgressDisplay from './../helpers/execSyncProgressDisplay';
import getPathToTemporarySourceCode from './../helpers/getPathToTemporarySourceCode';
import displayCommandDone from './../helpers/displayCommandDone';
import resolveRegistryTagFromConfig from './../helpers/resolveRegistryTagFromConfig';
import loadConfig from '../helpers/loadConfig';
import { STRATEGY_AS_IMAGE, STRATEGY_AS_SOURCE, STRATEGY_AS_REGISTRY, PATTERN_STRATEGY } from './../constants';

export default function deploy(program: commander.Command) {
  program
    .command('deploy')
    .arguments('<path>')
    .description('Deploy container to the remote host')
    .requiredOption('--code <code>', 'Code (name) of the docker container')
    .requiredOption('--host <john@example.com>', 'Host where to run docker container')
    .requiredOption('--as <source|image|registry>', 'Deploy source code (source), transfer image to remote host (image) or use registry (registry)')
    .option('--release <latest>', 'Release version of the image for tagging (latest git commit hash by default)')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      validateOptionFormat(cmd, 'as', PATTERN_STRATEGY);
      const { code, release, as, host, config, registry, public: _public, ssl } = loadConfig(cmd);

      // get execution command
      const exec = resolveExecutable();

      // get tag based on latest git commit
      const releaseResolved = release || getLatestCommitHash(path);
      const releaseTag = `${code}:${releaseResolved}`;
      const registryTag = resolveRegistryTagFromConfig(registry);
      const tag = as === STRATEGY_AS_REGISTRY ? registryTag : releaseTag;

      if (!tag) {
        throw new Error('Unable to resolve container tag');
      }

      console.log('');
      execSyncProgressDisplay(`${exec} clean`, { tag, host, config }); // clean local and remote before deploy

      switch (as) {
        case STRATEGY_AS_SOURCE: // deploy source code as files and build on the remote host
          console.log('');
          displayCommandStep(cmd, 'Deploy source code as files and build on the remote host');

          console.log('');
          execSyncProgressDisplay(`${exec} upload`, { tag, host, config }, path); // upload source code to the remote

          console.log('');
          const tmp = getPathToTemporarySourceCode(tag as string); // get path to tmp folder with source code
          execSyncProgressDisplay(`${exec} build`, { tag, host, config }, tmp); // build the image on the remote
          break;

        case STRATEGY_AS_IMAGE: // build locally and transfer image to the remote host
          console.log('');
          displayCommandStep(cmd, 'Build locally and transfer image to the remote host');

          console.log('');
          execSyncProgressDisplay(`${exec} build`, { tag, config }, path); // build the image locally

          console.log('');
          execSyncProgressDisplay(`${exec} archive`, { tag, config }); // archive the image locally

          console.log('');
          execSyncProgressDisplay(`${exec} transfer`, { tag, host, config }); // transfer the image to the remote

          console.log('');
          execSyncProgressDisplay(`${exec} load`, { tag, host, config }); // load the image to the remote docker
          break;

        case STRATEGY_AS_REGISTRY: // build locally and transfer image through registry
          console.log('');
          displayCommandStep(cmd, 'Build locally and transfer image to the remote host through registry');

          console.log('');
          execSyncProgressDisplay(`${exec} login`, { config }); // login into docker registry locally

          console.log('');
          execSyncProgressDisplay(`${exec} build`, { tag, config }, path); // build the image locally

          console.log('');
          execSyncProgressDisplay(`${exec} push`, { tag, config }); // push image to registry

          console.log('');
          execSyncProgressDisplay(`${exec} login`, { host, config }); // login into docker registry remote

          console.log('');
          execSyncProgressDisplay(`${exec} pull`, { tag, host, config }); // pull image from registry
          break;
      }

      console.log('');
      execSyncProgressDisplay(`${exec} run`, { code, tag, host, config }); // start the container on the remote

      console.log('');
      execSyncProgressDisplay(`${exec} clean`, { tag, host, config }); // clean local and remote after deploy

      displayCommandDone(cmd);
    });
};
