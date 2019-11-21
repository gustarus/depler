const resolveRegistryFromConfig = require('./resolveRegistryFromConfig');

module.exports = function resolveRegistryTagFromConfig(config) {
  const registry = resolveRegistryFromConfig(config);
  if (!registry) {
    return false;
  }

  return `${registry.host}/${registry.path}:latest`;
};