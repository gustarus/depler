import { execSync } from 'child_process';
import colors from 'colors/safe';
import createCommand from './createCommand';
import secretCommandVariables from './secretCommandVariables';
import { CommandSpace } from '../models/Command';

export default function execSyncProgress(parts: CommandSpace.Part[], scenario: 'display' | 'return', secrets: boolean = true): any {
  const command = createCommand(parts);
  const compiled = command.compile();

  const protect = secrets
    ? secretCommandVariables
    : (value: string) => value;

  console.log(`$ ${protect(compiled)}`);

  try {
    switch (scenario) {
      case 'display':
        return execSync(compiled, { stdio: 'inherit' });
      case 'return':
        return execSync(compiled).toString().trim();
      default:
        throw new Error('Invalid scenario passed');
    }
  } catch (error) {
    console.log(colors.red(protect(error.message)));
    console.log(colors.red(protect(error.stack)));
    process.exit(1);
    return false;
  }
};
