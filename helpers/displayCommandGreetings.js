const colors = require('colors/safe');

module.exports = function displayCommandGreetings(cmd) {
  console.log(`[${colors.blue(cmd.name())}] ${cmd.description()}`);
};