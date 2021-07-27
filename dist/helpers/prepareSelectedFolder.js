"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../models/Command"));
const formatter_1 = __importDefault(require("../instances/formatter"));
const RemoteCommand_1 = __importDefault(require("../models/RemoteCommand"));
const path_1 = __importDefault(require("path"));
const execSyncProgressReturn_1 = __importDefault(require("./execSyncProgressReturn"));
const execSyncProgress_1 = __importDefault(require("./execSyncProgress"));
function prepareSelectedFolder(host, folder) {
    const currentCommandLocal = new Command_1.default({ formatter: formatter_1.default, parts: ['pwd'] });
    const currentCommandRemote = host
        ? new RemoteCommand_1.default({ formatter: formatter_1.default, host, parts: [currentCommandLocal] }) : currentCommandLocal;
    const current = execSyncProgressReturn_1.default(currentCommandRemote);
    const homeCommandLocal = new Command_1.default({ formatter: formatter_1.default, parts: ['echo', '$HOME'] });
    const homeCommandRemote = host
        ? new RemoteCommand_1.default({ formatter: formatter_1.default, host, parts: [homeCommandLocal] }) : homeCommandLocal;
    const home = execSyncProgressReturn_1.default(homeCommandRemote);
    // resolve path relative to the root folder
    // replace the delimiter in case of different operation systems
    const relative = folder.replace(/^~/, home);
    const resolved = path_1.default.resolve(current, relative)
        .replace('\\', '/');
    const ensureCommandLocal = new Command_1.default({ formatter: formatter_1.default, parts: ['mkdir -p', resolved, '||', 'echo true'] });
    const ensureCommandRemote = host
        ? new RemoteCommand_1.default({ formatter: formatter_1.default, host, parts: [ensureCommandLocal] }) : ensureCommandLocal;
    execSyncProgress_1.default([ensureCommandRemote], 'display', false);
    return resolved;
}
exports.default = prepareSelectedFolder;
;
