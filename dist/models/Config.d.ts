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
    type Parsed = {
        as: 'image' | 'source' | 'registry';
        config?: string;
        host: string;
        code: string;
        release: string;
        tag: string;
        registry: {
            username: string;
            host: string;
            path: string;
            password: string;
        };
        image: {
            [key: string]: any;
        };
        container: {
            [key: string]: any;
        };
        certbot: {
            [key: string]: any;
        };
        public: {
            enabled: boolean;
            tool: 'nginx';
            directory: string;
            name: string;
            port: string;
            restart: boolean;
        };
        proxy: {
            enabled: boolean;
            name: string;
            port: string;
        };
        ssl: {
            enabled: boolean;
            restart: boolean;
        };
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
