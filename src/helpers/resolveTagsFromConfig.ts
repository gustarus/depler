import resolveRegistryTagFromConfig from './resolveRegistryTagFromConfig';

export default function resolveTagsFromConfig(config: { [key: string]: any }): string[] {
  const customTag = config.tag;
  const registryTag = resolveRegistryTagFromConfig(config);

  const tags = [];
  customTag && tags.push(customTag);
  registryTag && tags.push(registryTag);

  return tags;
};
