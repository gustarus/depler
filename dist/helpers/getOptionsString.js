"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getOptionString_1 = __importDefault(require("./getOptionString"));
function getOptionsString(options) {
    return Object.keys(options).map((name) => {
        const value = options[name];
        // multiple values with the same key
        // something like `-v ./app:/app -v ./data:/data`
        return value instanceof Array
            ? value.map((part) => getOptionString_1.default(name, part)).join(' ')
            : getOptionString_1.default(name, value);
    }).filter((value) => value).join(' ');
}
exports.default = getOptionsString;
;
