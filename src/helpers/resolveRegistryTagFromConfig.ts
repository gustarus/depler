import resolveRegistryFromConfig from './resolveRegistryFromConfig';

export default function resolveRegistryTagFromConfig(config: { [key: string]: any }): false | string {
  const registry = resolveRegistryFromConfig(config);
  if (!registry) {
    return false;
  }

  return `${registry.host}/${registry.path}:latest`;
};
