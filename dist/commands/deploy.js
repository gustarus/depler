"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolveExecutable_1 = __importDefault(require("../helpers/resolveExecutable"));
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const getLatestCommitHash_1 = __importDefault(require("./../helpers/getLatestCommitHash"));
const displayCommandStep_1 = __importDefault(require("./../helpers/displayCommandStep"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const getPathToTemporarySourceCode_1 = __importDefault(require("./../helpers/getPathToTemporarySourceCode"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const resolveRegistryTagFromConfig_1 = __importDefault(require("./../helpers/resolveRegistryTagFromConfig"));
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
const constants_1 = require("./../constants");
function deploy(program) {
    program
        .command('deploy')
        .arguments('<path>')
        .description('Deploy container to the remote host')
        .requiredOption('--code <code>', 'Code of the image for tagging')
        .requiredOption('--host <john@example.com>', 'Host where to run docker container')
        .requiredOption('--as <source|image|registry>', 'Deploy source code (source), transfer image to remote host (image) or use registry (registry)')
        .option('--release <latest>', 'Release version of the image for tagging (latest git commit hash by default)')
        .option('--config <path>', 'Use custom config for the command')
        .action((path, cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'as', constants_1.PATTERN_STRATEGY);
        const { code, release, as, host, config, registry, public: _public, ssl } = loadConfig_1.default(cmd);
        // get execution command
        const exec = resolveExecutable_1.default();
        // get tag based on latest git commit
        const releaseResolved = release || getLatestCommitHash_1.default(path);
        const releaseTag = `${code}:${releaseResolved}`;
        const registryTag = resolveRegistryTagFromConfig_1.default(registry);
        const tag = as === constants_1.STRATEGY_AS_REGISTRY ? registryTag : releaseTag;
        if (!tag) {
            throw new Error('Unable to resolve container tag');
        }
        console.log('');
        execSyncProgressDisplay_1.default(`${exec} clean`, { tag, host, config }); // clean local and remote before deploy
        switch (as) {
            case constants_1.STRATEGY_AS_SOURCE: // deploy source code as files and build on the remote host
                console.log('');
                displayCommandStep_1.default(cmd, 'Deploy source code as files and build on the remote host');
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} upload`, { tag, host, config }, path); // upload source code to the remote
                console.log('');
                const tmp = getPathToTemporarySourceCode_1.default(tag); // get path to tmp folder with source code
                execSyncProgressDisplay_1.default(`${exec} build`, { tag, host, config }, tmp); // build the image on the remote
                break;
            case constants_1.STRATEGY_AS_IMAGE: // build locally and transfer image to the remote host
                console.log('');
                displayCommandStep_1.default(cmd, 'Build locally and transfer image to the remote host');
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} build`, { tag, config }, path); // build the image locally
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} archive`, { tag, config }); // archive the image locally
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} transfer`, { tag, host, config }); // transfer the image to the remote
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} load`, { tag, host, config }); // load the image to the remote docker
                break;
            case constants_1.STRATEGY_AS_REGISTRY: // build locally and transfer image through registry
                console.log('');
                displayCommandStep_1.default(cmd, 'Build locally and transfer image to the remote host through registry');
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} login`, { config }); // login into docker registry locally
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} build`, { tag, config }, path); // build the image locally
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} push`, { tag, config }); // push image to registry
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} login`, { host, config }); // login into docker registry remote
                console.log('');
                execSyncProgressDisplay_1.default(`${exec} pull`, { tag, host, config }); // pull image from registry
                break;
        }
        console.log('');
        execSyncProgressDisplay_1.default(`${exec} run`, { tag, host, config }); // start the container on the remote
        console.log('');
        execSyncProgressDisplay_1.default(`${exec} clean`, { tag, host, config }); // clean local and remote after deploy
        displayCommandDone_1.default(cmd);
    });
}
exports.default = deploy;
;
