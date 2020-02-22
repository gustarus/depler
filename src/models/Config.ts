import merge from 'lodash.merge';
import Base from '../base/Base';
import Formatter from './Formatter';

export namespace ConfigSpace {
  export type Config = {
    formatter: Formatter;
    sources: any[];
    variables: { [key: string]: any };
  };

  export type Source = { [key: string]: any };

  export type Parsed = {
    // deploy scenario
    as: 'image' | 'source' | 'registry';

    // path to custom config file
    config?: string;

    // remote server host as `user@your-domain.com`
    host: string;

    // base code to attach to the containers like `my-lovely-container`
    code: string;

    // release code to attach to the containers like commit hash or `latest`
    release: string;

    // composed tag from `code` and `release` like `my-lovely-container:latest`
    tag: string;

    // registry configuration
    registry: {
      username: string;
      host: string;
      path: string;
      password: string;
    };

    // docker image build `docker build` options
    image: { [key: string]: any };

    // docker image container `docker run` options
    container: { [key: string]: any };

    // certbot configuration to configure ssl generation tool
    certbot: { [key: string]: any };

    // public configuration to expose container to the internet
    // via publishing tool like `nginx`
    public: {
      // enable publication for the site to the internet
      enabled: boolean;

      // tool to do publishing processing
      // only nginx currently supported
      tool: 'nginx';

      // path to web site configuration file
      // for nginx it is can be `/etc/nginx/sites`
      directory: string;

      // server name property
      // domain or ip
      name: string;

      // listen to this port
      // for passed server name
      port: string;

      // restart tool after successful configuration
      restart: boolean;
    };

    // internal configuration to proxy requests from the internet
    // to the locally running docker container
    proxy: {
      // enable proxy from the internet to the container
      enabled: boolean;

      // where to proxy requests from the internet
      // for the configured web site
      // for docker it should be localhost
      name: string;

      // port where to proxy requests
      // usually `-p` property value from `docker run`
      port: string;
    };

    // ssl configuration for the published site
    ssl: {
      // enable ssl certificate generation for the web site
      enabled: boolean;

      // restart publishing tool after successful configuration
      restart: boolean;
    }
  };
}

export default class Config<C = {}> extends Base<C & ConfigSpace.Config> {

  private _parsed: ConfigSpace.Parsed;

  public get base() {
    return {} as ConfigSpace.Parsed;
  }

  public get parsed(): ConfigSpace.Parsed {
    if (!this._parsed) {
      // merge configuration sources
      this._parsed = this.processSources(this.config.sources);

      // replace environment variables
      this._parsed = this.processVariables(this._parsed, this.config.variables);
    }

    return this._parsed;
  }

  public processSources(sources: any[]): ConfigSpace.Parsed {
    // merge configuration defaults
    const convert = this.config.formatter.convertObjectPropertiesFromOptionToCamel.bind(this.config.formatter);
    const parts = sources.map((source) => source ? convert(source) : {});
    const merged = merge({}, this.base, ...parts);

    // extract legacy configuration structure
    const legacy = merge({}, (merged.default || {}), ...Object.values(merged.commands || {}));
    delete merged.default;
    delete merged.commands;

    // merge brand new configuration structure with legacy one
    return merge({}, merged, legacy);
  }

  public processVariables(value: any, variables: { [key: string]: any }) {
    if (typeof value === 'object') {
      const result: any = value instanceof Array ? [] : {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          result[key] = this.processVariables(value[key], variables);
        }
      }

      return result;
    } else if (typeof value === 'string') {
      return value.replace(/\${[a-z-_]+}/ig, (matched) => {
        const name = matched.replace(/^\${(.*?)}$/, '$1');
        const value = variables[name] || matched;
        return value.replace(/\n/g, '\n');
      });
    }

    return value;
  }
};
