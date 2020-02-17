import * as commander from 'commander';
export default function loadCommandConfig(cmd: commander.Command): {
    [key: string]: any;
};
