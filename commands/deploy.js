const displayCommandGreetings = require('./../helpers/displayCommandGreetings');
const requiredOption = require('./../helpers/requiredOption');
const getLatestCommitHash = require('./../helpers/getLatestCommitHash');
const displayCommandStep = require('./../helpers/displayCommandStep');
const execSyncProgressDisplay = require('./../helpers/execSyncProgressDisplay');
const getPathToTemporarySourceCode = require('./../helpers/getPathToTemporarySourceCode');
const displayCommandDone = require('./../helpers/displayCommandDone');
const resolveRegistryTagFromConfig = require('./../helpers/resolveRegistryTagFromConfig');
const loadCommandConfig = require('./../helpers/loadCommandConfig');
const { PATH_TO_EXECUTABLE, AS_IMAGE, AS_SOURCE, AS_REGISTRY, DEPLOY_AS_FORMAT_PATTERN } = require('./../constants');

module.exports = function deploy(program) {
  program
    .command('deploy')
    .arguments('<path>')
    .description('Deploy container to the remote host')
    .option('--code <code>', 'Code of the image for tagging')
    .option('--release <latest>', 'Release version of the image for tagging (latest git commit hash by default)')
    .option('--host <john@example.com>', 'Host where to run docker container')
    .option('--as <source|image|registry>', 'Deploy source code (source), transfer image to remote host (image) or use registry (registry)')
    .option('--config <path>', 'Use custom config for the command')
    .action((path, cmd) => {
      displayCommandGreetings(cmd);
      requiredOption(cmd, 'as', DEPLOY_AS_FORMAT_PATTERN);
      requiredOption(cmd, 'code');
      requiredOption(cmd, 'host');
      const loadedConfig = loadCommandConfig(cmd);

      // get execution command
      const exec = `node ${PATH_TO_EXECUTABLE}`;

      // get tag based on latest git commit
      const code = cmd.code;
      const release = cmd.release || getLatestCommitHash(path);
      const releaseTag = `${code}:${release}`;
      const registryTag = resolveRegistryTagFromConfig(loadedConfig);
      const tag = cmd.as === AS_REGISTRY ? registryTag : releaseTag;
      const alias = cmd.code;

      // get runtime variables
      const { host, config } = cmd;

      console.log('');
      execSyncProgressDisplay(`${exec} clean`, { tag, host, config }); // clean local and remote before deploy

      switch (cmd.as) {
        case AS_SOURCE: // deploy source code as files and build on the remote host
          console.log('');
          displayCommandStep(cmd, 'Deploy source code as files and build on the remote host');

          console.log('');
          execSyncProgressDisplay(`${exec} upload`, { tag, host, config }, path); // upload source code to the remote

          console.log('');
          const tmp = getPathToTemporarySourceCode(tag); // get path to tmp folder with source code
          execSyncProgressDisplay(`${exec} build`, { tag, host, config }, tmp); // build the image on the remote
          break;

        case AS_IMAGE: // build locally and transfer image to the remote host
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

        case AS_REGISTRY: // build locally and transfer image through registry
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
      execSyncProgressDisplay(`${exec} run`, { tag, alias, host, config }); // start the container on the remote

      console.log('');
      execSyncProgressDisplay(`${exec} clean`, { tag, host, config }); // clean local and remote after deploy

      displayCommandDone(cmd);
    });
};