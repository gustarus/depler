const PATH_TO_EXECUTABLE = `${__dirname}/index.js`;
const RUNTIME_FOLDER_PREFIX = 'from-russia-with-love';
const DEPLOY_AS_FORMAT_PATTERN = /^(source|image|registry)$/;
const TAG_FORMAT_PATTERN = /^[\w\d-_]+:[\w\d-_]+$/;
const SECRET_MASK = '*****';

module.exports = { PATH_TO_EXECUTABLE, RUNTIME_FOLDER_PREFIX, DEPLOY_AS_FORMAT_PATTERN, TAG_FORMAT_PATTERN, SECRET_MASK };
