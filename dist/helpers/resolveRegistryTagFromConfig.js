"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolveRegistryFromConfig_1 = __importDefault(require("./resolveRegistryFromConfig"));
function resolveRegistryTagFromConfig(config) {
    const registry = resolveRegistryFromConfig_1.default(config);
    if (!registry) {
        return false;
    }
    return `${registry.host}/${registry.path}:latest`;
}
exports.default = resolveRegistryTagFromConfig;
;
