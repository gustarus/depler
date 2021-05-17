"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ensureCollection(value) {
    if (Array.isArray(value)) {
        return value;
    }
    return typeof value === 'undefined' ? [] : [value];
}
exports.default = ensureCollection;
;
