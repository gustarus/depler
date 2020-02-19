import resolveRegistryFromConfig from './resolveRegistryFromConfig';

export default function resolveRegistryTagFromConfig(registry?: { username: string; password: string; host: string; path: string }): false | string {
  const resolved = resolveRegistryFromConfig(registry);
  if (!resolved) {
    return false;
  }

  return `${resolved.host}/${resolved.path}:latest`;
};
