import { execSync } from 'child_process';
import validatePathExists from './validatePathExists';

export default function getLatestCommitHash(path: string): string {
  validatePathExists(path, `Directory '${path}' doesn't exist.`);
  validatePathExists(`${path}/.git`, `There is no git repository inside '${path}': we have to fetch latest commit hash to generate docker image tag.`);

  const result = execSync(`cd ${path} && git rev-parse --short HEAD`);
  return result.toString().trim();
};
