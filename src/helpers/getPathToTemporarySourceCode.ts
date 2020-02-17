import { RUNTIME_FOLDER_PREFIX } from './../constants';

export default function getPathToTemporarySourceCode(tag: string): string {
  return `/tmp/${RUNTIME_FOLDER_PREFIX}-${tag}`;
};
