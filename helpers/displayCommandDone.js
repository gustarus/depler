const colors = require('colors/safe');
const displayCommandStep = require('./displayCommandStep');

module.exports = function displayCommandDone(cmd) {
  displayCommandStep(cmd, colors.green('The task was successful'));
};