import * as path from 'path';
import * as fs from 'fs-extra';

export default function createFileFromTemplate(pathToTemplate: string, pathToTarget: string, variables: { [key: string]: string } = {}): void {
  const pathToTargetDirectory = path.dirname(pathToTarget);

  // check for the directory
  if (!fs.existsSync(pathToTemplate)) {
    throw new Error(`Unable to find template file '${pathToTemplate}'`);
  }

  // replace variables in the source template file
  let source = fs.readFileSync(pathToTemplate).toString();
  for (const name in variables) {
    const expression = new RegExp(`\\$\{${name}\}`, 'ig');
    source = source.replace(expression, variables[name]);
  }

  // create target file
  fs.mkdirSync(pathToTargetDirectory, { recursive: true });
  fs.writeFileSync(pathToTarget, source);
};
