"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const Base_1 = __importDefault(require("../base/Base"));
class Config extends Base_1.default {
    get base() {
        return {};
    }
    get parsed() {
        if (!this._parsed) {
            // merge configuration sources
            this._parsed = this.processSources(this.config.sources);
            // replace environment variables
            this._parsed = this.processVariables(this._parsed, this.config.variables);
            if (!this._parsed) {
                throw new Error('Unable to parse the configuration file');
            }
        }
        return this._parsed;
    }
    processSources(sources) {
        // merge configuration defaults
        const convert = this.config.formatter.convertObjectPropertiesFromOptionToCamel.bind(this.config.formatter);
        const parts = sources.map((source) => source ? convert(source) : {});
        const merged = lodash_merge_1.default({}, this.base, ...parts);
        // extract legacy configuration structure
        const legacy = lodash_merge_1.default({}, (merged.default || {}), ...Object.values(merged.commands || {}));
        delete merged.default;
        delete merged.commands;
        // merge brand new configuration structure with legacy one
        return lodash_merge_1.default({}, merged, legacy);
    }
    processVariables(value, variables) {
        if (typeof value === 'object') {
            const result = value instanceof Array ? [] : {};
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    result[key] = this.processVariables(value[key], variables);
                }
            }
            return result;
        }
        else if (typeof value === 'string') {
            return value.replace(/\${[a-z-_]+}/ig, (matched) => {
                const name = matched.replace(/^\${(.*?)}$/, '$1');
                const value = variables[name] || matched;
                return value.replace(/\n/g, '\n');
            });
        }
        return value;
    }
}
exports.default = Config;
;
