const execSyncProgress = require('./execSyncProgress');

module.exports = function execSyncProgressDisplay(...parts) {
  return execSyncProgress('display', ...parts);
};