"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./../constants");
function getPathToTemporarySourceCode(tag) {
    return `/tmp/${constants_1.RUNTIME_FOLDER_PREFIX}-${tag}`;
}
exports.default = getPathToTemporarySourceCode;
;
