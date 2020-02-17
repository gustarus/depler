import Command from './Command';
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
    get defaults(): any;
    compile(runtimeConfig?: RemoteCommandSpace.Runtime): string;
}
