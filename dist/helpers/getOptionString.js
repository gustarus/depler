"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getOptionString(key, value) {
    const prefix = key.length === 1
        ? `-${key}` : `--${key}`;
    if (typeof value === 'boolean') {
        // boolean value: something like `--flag`
        return value ? prefix : '';
    }
    else if (typeof value === 'undefined') {
        // undefined value
        return '';
    }
    else {
        return `${prefix} ${value}`;
    }
}
exports.default = getOptionString;
;
