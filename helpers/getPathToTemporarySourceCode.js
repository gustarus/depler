const { RUNTIME_FOLDER_PREFIX } = require('./../constants');

module.exports = function getPathToTemporarySourceCode(tag) {
  return `/tmp/${RUNTIME_FOLDER_PREFIX}-${tag}`;
};