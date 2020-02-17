import { Command } from 'commander';
import colors from 'colors/safe';

export default function validateOptionFormat(cmd: Command, option: string, format: RegExp) {
  const code = `--${option.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;
  if (cmd[option] && !cmd[option].match(format)) {
    console.log(colors.red(`Option '${code}' value '${cmd[option]}' is in invalid format: should be ${format.toString()}.\n`));
    cmd.help();
  }
};
