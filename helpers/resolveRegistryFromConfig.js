const execSyncProgressReturn = require('./execSyncProgressReturn');

module.exports = function resolveRegistryFromConfig(config) {
  const username = execSyncProgressReturn(`echo ${config.registry.username}`);
  const host = execSyncProgressReturn(`echo ${config.registry.host}`);
  const path = execSyncProgressReturn(`echo ${config.registry.path}`);
  if (!username || !host || !path) {
    return false;
  }

  return { username, host, path };
};