"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const resolvePackagePath_1 = __importDefault(require("./helpers/resolvePackagePath"));
exports.PATH_TO_ROOT = resolvePackagePath_1.default(__dirname);
exports.PATH_TO_PACKAGE = path.resolve(exports.PATH_TO_ROOT, 'package.json');
exports.PATH_TO_RUNTIME = path.resolve(exports.PATH_TO_ROOT, 'runtime');
exports.PATH_TO_TEMPLATE_SERVER = path.resolve(exports.PATH_TO_ROOT, 'templates', 'server.conf');
exports.STRATEGY_AS_SOURCE = 'source';
exports.STRATEGY_AS_IMAGE = 'image';
exports.STRATEGY_AS_REGISTRY = 'registry';
exports.RUNTIME_FOLDER_PREFIX = 'from-russia-with-love';
exports.PATTERN_STRATEGY = /^(source|image|registry)$/;
exports.PATTERN_TAG = /^[.\/\w\d-_]+:[\w\d-_]+$/;
exports.SECRET_MASK = '*****';
