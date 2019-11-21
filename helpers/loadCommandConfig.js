const fs = require('fs');
const merge = require('lodash.merge');
const loadEnvironmentVariables = require('./loadEnvironmentVariables');
const defaults = require('./../defaults');

module.exports = function loadCommandConfig(cmd) {
  const name = cmd.name();

  // parse overrides from the pwd directory
  let overrides = { commands: {} };
  if (cmd.config) {
    if (!fs.existsSync(cmd.config)) {
      throw colors.red(`Unable to find override config file in '${cmd.config}`);
    }

    overrides = JSON.parse(fs.readFileSync(cmd.config).toString());
  }

  // merge configuration with defaults
  const config = merge({}, defaults.default, defaults.commands[name], overrides.default, overrides.commands[name], cmd.opts());

  // load environment variables
  return loadEnvironmentVariables(config);
};