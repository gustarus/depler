"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const safe_1 = __importDefault(require("colors/safe"));
function validateOptionFormat(cmd, option, format) {
    const code = `--${option.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;
    if (cmd[option] && !cmd[option].match(format)) {
        console.log(safe_1.default.red(`Option '${code}' value '${cmd[option]}' is in invalid format: should be ${format.toString()}.\n`));
        cmd.help();
    }
}
exports.default = validateOptionFormat;
;
