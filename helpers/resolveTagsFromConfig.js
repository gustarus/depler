const resolveRegistryTagFromConfig = require('./resolveRegistryTagFromConfig');

module.exports = function resolveTagsFromConfig(config) {
  const customTag = config.tag;
  const registryTag = resolveRegistryTagFromConfig(config);

  const tags = [];
  customTag && tags.push(customTag);
  registryTag && tags.push(registryTag);

  return tags;
};