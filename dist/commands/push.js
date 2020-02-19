"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const displayCommandGreetings_1 = __importDefault(require("./../helpers/displayCommandGreetings"));
const validateOptionFormat_1 = __importDefault(require("../helpers/validateOptionFormat"));
const resolveRegistryTagFromConfig_1 = __importDefault(require("./../helpers/resolveRegistryTagFromConfig"));
const execSyncProgressDisplay_1 = __importDefault(require("./../helpers/execSyncProgressDisplay"));
const displayCommandDone_1 = __importDefault(require("./../helpers/displayCommandDone"));
const constants_1 = require("./../constants");
const loadConfig_1 = __importDefault(require("../helpers/loadConfig"));
function push(program) {
    program
        .command('push')
        .description('Push image to registry')
        .requiredOption('--tag <code:latest>', 'Docker image tag to transfer to remote host')
        .option('--config <path>', 'Use custom config for the command')
        .action((cmd) => {
        displayCommandGreetings_1.default(cmd);
        validateOptionFormat_1.default(cmd, 'tag', constants_1.PATTERN_TAG);
        const { registry } = loadConfig_1.default(cmd);
        const registryTag = resolveRegistryTagFromConfig_1.default(registry);
        execSyncProgressDisplay_1.default(`docker push ${registryTag}`);
        displayCommandDone_1.default(cmd);
    });
}
exports.default = push;
;
