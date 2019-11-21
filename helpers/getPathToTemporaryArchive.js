const { RUNTIME_FOLDER_PREFIX } = require('./../constants');

module.exports = function getPathToTemporaryArchive(tag) {
  return `/tmp/${RUNTIME_FOLDER_PREFIX}-${tag}.tar`;
};