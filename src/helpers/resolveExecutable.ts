import * as fs from 'fs';
import * as path from 'path';
import Package from '../models/Package';
import { PATH_TO_PACKAGE, PATH_TO_ROOT } from '../constants';

let pathToExecutable: string;

export default function resolveExecutable(): string {
  if (!pathToExecutable) {
    const info = new Package({ path: PATH_TO_PACKAGE });

    const name = info.data.name;
    if (!name) {
      throw new Error(`Unable to resolve package name: there is no name property in the '${PATH_TO_PACKAGE}'`);
    }

    const bin = info.data.bin[name];
    if (!bin) {
      throw new Error(`Unable to resolve package bin script: there is no 'bin.${name}' property in the '${PATH_TO_PACKAGE}'`);
    }

    pathToExecutable = path.resolve(PATH_TO_ROOT, bin);
    if (!fs.existsSync(pathToExecutable)) {
      throw new Error(`There is no executable file: looking for '${pathToExecutable}'`);
    }
  }

  return `node ${pathToExecutable}`;
}
