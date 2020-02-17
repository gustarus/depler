import fs from 'fs';
import colors from 'colors/safe';

export default function validatePathExists(path: string, message = 'Path doesn\'t exist') {
  if (!fs.existsSync(path)) {
    throw colors.red(message);
  }
};
