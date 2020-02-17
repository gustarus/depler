import { RUNTIME_FOLDER_PREFIX } from './../constants';

export default function getPathToTemporaryArchive(tag: string): string {
  return `/tmp/${RUNTIME_FOLDER_PREFIX}-${tag}.tar`;
};
