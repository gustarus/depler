const execSyncProgress = require('./execSyncProgress');

module.exports = function execSyncProgressReturn(...parts) {
  return execSyncProgress('return', ...parts);
};