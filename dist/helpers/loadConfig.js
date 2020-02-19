"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const colors_1 = __importDefault(require("colors"));
const defaults_json_1 = __importDefault(require("./../defaults.json"));
const Config_1 = __importDefault(require("../models/Config"));
const formatter_1 = __importDefault(require("./../instances/formatter"));
const defaults = defaults_json_1.default;
function loadConfig(cmd) {
    // parse overrides from the pwd directory
    let overrides;
    if (cmd.config) {
        if (!fs_1.default.existsSync(cmd.config)) {
            throw colors_1.default.red(`Unable to find override config file in '${cmd.config}`);
        }
        overrides = JSON.parse(fs_1.default.readFileSync(cmd.config).toString());
    }
    // build configuration from sources and replace environment variables
    const config = new Config_1.default({ formatter: formatter_1.default, sources: [defaults, overrides, cmd.opts()], variables: process.env });
    return config.parsed;
}
exports.default = loadConfig;
;
