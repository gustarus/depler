import Base from '../base/Base';
import Formatter from './Formatter';
export declare namespace ConfigSpace {
    type Config = {
        formatter: Formatter;
        sources: any[];
        variables: {
            [key: string]: any;
        };
    };
    type Source = {
        [key: string]: any;
    };
    type Options = {
        [key: string]: any;
    };
    type Registry = {
        username: string;
        host: string;
        path: string;
        password: string;
    };
    type Public = {
        tool: 'nginx';
        directory: string;
        credentials: string;
        name: string;
        port: string;
        restart: boolean;
    };
    type Access = {
        restrict: boolean;
        credentials: {
            [key: string]: string;
        };
    };
    type Proxy = {
        location?: string;
        name: string;
        port: string;
    };
    type Ssl = {
        restart: boolean;
    };
    type Parsed = {
        as: 'image' | 'source' | 'registry';
        config?: string;
        host: string;
        code: string;
        release: string;
        tag: string;
        registry: Registry;
        image: Options;
        container: Options;
        certbot: Options;
        public: Public;
        proxy: Proxy | Proxy[];
        ssl: Ssl;
        access: Access;
    };
}
export default class Config<C = {}> extends Base<C & ConfigSpace.Config> {
    private _parsed;
    get base(): ConfigSpace.Parsed;
    get parsed(): ConfigSpace.Parsed;
    processSources(sources: any[]): ConfigSpace.Parsed;
    processVariables(value: any, variables: {
        [key: string]: any;
    }): any;
}
