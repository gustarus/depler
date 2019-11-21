const resolveRegistryFromConfig = require('./resolveRegistryFromConfig');

module.exports = function resolveRegistryTagFromConfig(config) {
  const registry = resolveRegistryFromConfig(config);
  if (!registry) {
    return false;
  }

  let version = 'latest';
  if (config.tag && config.tag.includes(':')) {
    version = config.tag.split(':')[1];
  }

  return `${registry.host}/${registry.path}:${version}`;
};