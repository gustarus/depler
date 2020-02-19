"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const execSyncProgressReturn_1 = __importDefault(require("./execSyncProgressReturn"));
function resolveRegistryFromConfig(registry) {
    if (!registry) {
        return false;
    }
    const username = execSyncProgressReturn_1.default(`echo ${registry.username}`);
    const password = registry.password;
    const host = execSyncProgressReturn_1.default(`echo ${registry.host}`);
    const path = execSyncProgressReturn_1.default(`echo ${registry.path}`);
    if (!username || !password || !host || !path) {
        return false;
    }
    return { username, password, host, path };
}
exports.default = resolveRegistryFromConfig;
;
