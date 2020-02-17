"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadEnvironmentVariables(value) {
    if (typeof value === 'object') {
        const result = value instanceof Array ? [] : {};
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                result[key] = loadEnvironmentVariables(value[key]);
            }
        }
        return result;
    }
    else if (typeof value === 'string') {
        return value.replace(/\${[a-z-_]+}/ig, (matched) => {
            const name = matched.replace(/^\${(.*?)}$/, '$1');
            const value = process.env[name] || matched;
            return value.replace(/\n/g, '\n');
        });
    }
    return value;
}
exports.default = loadEnvironmentVariables;
;
