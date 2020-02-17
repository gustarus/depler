"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getUniqueValues(items) {
    return Object.keys(items.reduce((stack, value) => (stack[value] = true) && stack, {}));
}
exports.default = getUniqueValues;
;
