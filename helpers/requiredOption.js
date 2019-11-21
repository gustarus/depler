const colors = require('colors/safe');

module.exports = function requiredOption(cmd, option, format = undefined) {
  const code = `--${option.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;

  if (!cmd[option]) {
    console.log(colors.red(`Option '${code}' is required.\n`));
    cmd.help();
  }

  if (format && !cmd[option].match(format)) {
    console.log(colors.red(`Option '${code}' value '${cmd[option]}' is in invalid format: should be ${format.toString()}.\n`));
    cmd.help();
  }
};