"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const safe_1 = __importDefault(require("colors/safe"));
function validatePathExists(path, message = 'Path doesn\'t exist') {
    if (!fs_1.default.existsSync(path)) {
        throw safe_1.default.red(message);
    }
}
exports.default = validatePathExists;
;
