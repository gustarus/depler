const execSyncProgressReturn = require('./execSyncProgressReturn');

module.exports = function resolveRegistryFromConfig(config) {
  const host = execSyncProgressReturn(`echo ${config.registry.host}`);
  const path = execSyncProgressReturn(`echo ${config.registry.path}`);
  if (!host || !path) {
    return false;
  }

  return { host, path };
};