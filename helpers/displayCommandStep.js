const colors = require('colors/safe');

module.exports = function displayCommandStep(cmd, message) {
  console.log(`[${colors.blue(cmd.name())}] ${message}`);
};