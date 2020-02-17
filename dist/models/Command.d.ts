import Base from '../base/Base';
export declare namespace CommandSpace {
    type Config = {
        parts: Part[];
    };
    type Runtime = {
        wrap?: boolean;
    };
    type Part = Command | string | boolean | {
        [key: string]: Part;
    };
}
export default class Command<C = {}> extends Base<C & CommandSpace.Config> {
    compile(runtimeConfig?: CommandSpace.Runtime): string;
    protected wrapCompiled(compiled: string): string;
}
