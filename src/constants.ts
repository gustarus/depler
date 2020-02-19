import * as path from 'path';
import resolvePackagePath from './helpers/resolvePackagePath';

export const PATH_TO_ROOT = resolvePackagePath(__dirname);
export const PATH_TO_PACKAGE = path.resolve(PATH_TO_ROOT, 'package.json');
export const PATH_TO_RUNTIME = path.resolve(PATH_TO_ROOT, 'runtime');
export const PATH_TO_TEMPLATE_SERVER = path.resolve(PATH_TO_ROOT, 'templates', 'server.conf');

export const STRATEGY_AS_SOURCE = 'source';
export const STRATEGY_AS_IMAGE = 'image';
export const STRATEGY_AS_REGISTRY = 'registry';

export const RUNTIME_FOLDER_PREFIX = 'from-russia-with-love';

export const PATTERN_STRATEGY = /^(source|image|registry)$/;
export const PATTERN_TAG = /^[.\/\w\d-_]+:[\w\d-_]+$/;

export const SECRET_MASK = '*****';
