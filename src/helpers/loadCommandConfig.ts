import fs from 'fs';
import commander from 'commander';
import colors from 'colors';
import merge from 'lodash.merge';
import loadEnvironmentVariables from './loadEnvironmentVariables';
import defaultConfig from './../defaults.json';
import { Config } from '../types/Config';

const defaults = defaultConfig as any as Config;

export default function loadCommandConfig(cmd: commander.Command): { [key: string]: any } {
  const name = cmd.name();

  // parse overrides from the pwd directory
  let overrides = {} as Config;
  if (cmd.config) {
    if (!fs.existsSync(cmd.config)) {
      throw colors.red(`Unable to find override config file in '${cmd.config}`);
    }

    overrides = JSON.parse(fs.readFileSync(cmd.config).toString()) as Config;
  }

  // merge configuration with defaults
  const config = merge({}, defaults.default, defaults.commands[name], overrides.default, overrides.commands[name], cmd.opts());

  // load environment variables
  return loadEnvironmentVariables(config);
};
