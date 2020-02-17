"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const validatePathExists_1 = __importDefault(require("./validatePathExists"));
function getLatestCommitHash(path) {
    validatePathExists_1.default(path, `Directory '${path}' doesn't exist.`);
    validatePathExists_1.default(`${path}/.git`, `There is no git repository inside '${path}': we have to fetch latest commit hash to generate docker image tag.`);
    const result = child_process_1.execSync(`cd ${path} && git rev-parse --short HEAD`);
    return result.toString().trim();
}
exports.default = getLatestCommitHash;
;
