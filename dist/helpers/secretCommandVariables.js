"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./../constants");
function secretCommandVariables(cmd) {
    let masked = cmd;
    const template = '(--build-arg|-e|--env)\\s+[a-z-_]+=';
    const regexp = new RegExp(template, 'ig');
    let match;
    while ((match = regexp.exec(cmd)) !== null) {
        const definition = match[0];
        const char = cmd[regexp.lastIndex];
        if (['\'', '"'].includes(char)) {
            // replace '--build-arg SOME_VARIABLE="secret with spaces"'
            // or "--build-arg SOME_VARIABLE='secret with spaces'" strings
            const replaceRegex = new RegExp(`${definition}${char}([^${char}]+)${char}`, 'ig');
            const replaceReplacement = `${definition}${char}${constants_1.SECRET_MASK}${char}`;
            masked = masked.replace(replaceRegex, replaceReplacement);
        }
        else {
            // replace '--build-arg SOME_VARIABLE=secret' strings
            const replaceRegex = new RegExp(`${definition}[^\s]+`, 'ig');
            const replaceReplacement = `${definition}${constants_1.SECRET_MASK}`;
            masked = masked.replace(replaceRegex, replaceReplacement);
        }
    }
    return masked;
}
exports.default = secretCommandVariables;
;
