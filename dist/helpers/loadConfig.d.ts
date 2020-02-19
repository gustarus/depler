import commander from 'commander';
import { ConfigSpace } from '../models/Config';
export default function loadConfig(cmd: commander.Command): ConfigSpace.Parsed;
