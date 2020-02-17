"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolveRegistryTagFromConfig_1 = __importDefault(require("./resolveRegistryTagFromConfig"));
function resolveTagsFromConfig(config) {
    const customTag = config.tag;
    const registryTag = resolveRegistryTagFromConfig_1.default(config);
    const tags = [];
    customTag && tags.push(customTag);
    registryTag && tags.push(registryTag);
    return tags;
}
exports.default = resolveTagsFromConfig;
;
