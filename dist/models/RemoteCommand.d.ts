import Command, { CommandSpace } from './Command';
import Formatter from './Formatter';
export declare namespace RemoteCommandSpace {
    type Config = {
        host: string;
        with?: string[];
    };
    type Runtime = {
        wrap?: boolean;
    };
}
export default class RemoteCommand extends Command<RemoteCommandSpace.Config> {
    static createWithHost(formatter: Formatter, host: string, parts: CommandSpace.Part[], options?: {
        with?: string[];
    }): RemoteCommand;
    get defaults(): any;
    compile(runtimeConfig?: RemoteCommandSpace.Runtime): string;
}
