import fs from 'fs';
import commander from 'commander';
import colors from 'colors';
import defaultConfig from './../defaults.json';
import Config, { ConfigSpace } from '../models/Config';
import formatter from './../instances/formatter';

const defaults = defaultConfig as any as ConfigSpace.Source;

export default function loadConfig(cmd: commander.Command): ConfigSpace.Parsed {
  // parse overrides from the pwd directory
  let overrides;
  if (cmd.config) {
    if (!fs.existsSync(cmd.config)) {
      throw colors.red(`Unable to find override config file in '${cmd.config}`);
    }

    overrides = JSON.parse(fs.readFileSync(cmd.config).toString()) as ConfigSpace.Source;
  }

  // build configuration from sources and replace environment variables
  const config = new Config({ formatter, sources: [defaults, overrides, cmd.opts()], variables: process.env });
  return config.parsed;
};
