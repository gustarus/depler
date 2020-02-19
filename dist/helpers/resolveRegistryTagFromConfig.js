"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolveRegistryFromConfig_1 = __importDefault(require("./resolveRegistryFromConfig"));
function resolveRegistryTagFromConfig(registry) {
    const resolved = resolveRegistryFromConfig_1.default(registry);
    if (!resolved) {
        return false;
    }
    return `${resolved.host}/${resolved.path}:latest`;
}
exports.default = resolveRegistryTagFromConfig;
;
