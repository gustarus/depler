import execSyncProgressReturn from './execSyncProgressReturn';

export default function resolveRegistryFromConfig(config: { [key: string]: any }): false | { username: string; password: string; host: string; path: string } {
  if (!config || !config.registry) {
    return false;
  }

  const username = execSyncProgressReturn(`echo ${config.registry.username}`);
  const password = config.registry.password;
  const host = execSyncProgressReturn(`echo ${config.registry.host}`);
  const path = execSyncProgressReturn(`echo ${config.registry.path}`);
  if (!username || !password || !host || !path) {
    return false;
  }

  return { username, password, host, path };
};
