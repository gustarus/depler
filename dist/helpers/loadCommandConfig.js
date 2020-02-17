"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const colors_1 = __importDefault(require("colors"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const loadEnvironmentVariables_1 = __importDefault(require("./loadEnvironmentVariables"));
const defaults_json_1 = __importDefault(require("./../defaults.json"));
const defaults = defaults_json_1.default;
function loadCommandConfig(cmd) {
    const name = cmd.name();
    // parse overrides from the pwd directory
    let overrides = {};
    if (cmd.config) {
        if (!fs_1.default.existsSync(cmd.config)) {
            throw colors_1.default.red(`Unable to find override config file in '${cmd.config}`);
        }
        overrides = JSON.parse(fs_1.default.readFileSync(cmd.config).toString());
    }
    // merge configuration with defaults
    const config = lodash_merge_1.default({}, defaults.default, defaults.commands[name], overrides.default, overrides.commands[name], cmd.opts());
    // load environment variables
    return loadEnvironmentVariables_1.default(config);
}
exports.default = loadCommandConfig;
;
