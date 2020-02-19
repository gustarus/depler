import execSyncProgressReturn from './execSyncProgressReturn';

export default function resolveRegistryFromConfig(registry?: { username: string; password: string; host: string; path: string }): false | { username: string; password: string; host: string; path: string } {
  if (!registry) {
    return false;
  }

  const username = execSyncProgressReturn(`echo ${registry.username}`);
  const password = registry.password;
  const host = execSyncProgressReturn(`echo ${registry.host}`);
  const path = execSyncProgressReturn(`echo ${registry.path}`);
  if (!username || !password || !host || !path) {
    return false;
  }

  return { username, password, host, path };
};
