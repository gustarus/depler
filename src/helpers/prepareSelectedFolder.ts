import path from 'path';
import Command from '../models/Command';
import formatter from '../instances/formatter';
import RemoteCommand from '../models/RemoteCommand';
import execSyncProgressReturn from './execSyncProgressReturn';
import execSyncProgress from './execSyncProgress';

export default function prepareSelectedFolder(host: string | undefined, folder: string): string {
  const currentCommandLocal = new Command({ formatter, parts: ['pwd'] });
  const currentCommandRemote = host
    ? new RemoteCommand({ formatter, host, parts: [currentCommandLocal] }) : currentCommandLocal;
  const current = execSyncProgressReturn(currentCommandRemote);

  const homeCommandLocal = new Command({ formatter, parts: ['echo', '$HOME'] });
  const homeCommandRemote = host
    ? new RemoteCommand({ formatter, host, parts: [homeCommandLocal] }) : homeCommandLocal;
  const home = execSyncProgressReturn(homeCommandRemote);

  // resolve path relative to the root folder
  // replace the delimiter in case of different operation systems
  const relative = folder.replace(/^~/, home);
  const resolved = path.resolve(current, relative)
    .replace('\\', '/');

  const ensureCommandLocal = new Command({ formatter, parts: ['mkdir -p', resolved, '||', 'echo true'] });
  const ensureCommandRemote = host
    ? new RemoteCommand({ formatter, host, parts: [ensureCommandLocal] }) : ensureCommandLocal;
  execSyncProgress([ensureCommandRemote], 'display', false);

  return resolved;
};
