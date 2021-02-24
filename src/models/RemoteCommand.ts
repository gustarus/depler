import Command, { CommandSpace } from './Command';
import Formatter from './Formatter';

export namespace RemoteCommandSpace {
  export type Config = {
    host: string;
    with?: string[];
  };

  export type Runtime = {
    wrap?: boolean;
  }
}

export default class RemoteCommand extends Command<RemoteCommandSpace.Config> {

  public static createWithHost(formatter: Formatter, host: string, parts: CommandSpace.Part[], options?: { with?: string[] }): RemoteCommand {
    return new RemoteCommand({ formatter, host, parts, ...options });
  }

  public get defaults(): any {
    return { with: [] };
  }

  compile(runtimeConfig: RemoteCommandSpace.Runtime = { wrap: false }) {
    // compile child command
    const child = super.compile({ ...runtimeConfig, wrap: false });

    // get all proxy variables and skip raw values
    const variables = (this.config.with as string[])
      .filter((variable) => variable.trim().match(/^\$/))
      .map((variable) => variable.trim().replace(/^\$/, ''));


    // create exports commands to export all variables aliases
    const localExports = variables.map((variable) => `export LC_${variable}=$${variable}`);

    // create options ssh command parts to send all variables
    const sshOptions = variables.map((variable) => `-o SendEnv=LC_${variable}`);

    // create ssh exports parts to export variables inside remote server
    const sshExports = variables.map((variable) => `${variable}=$LC_${variable}; unset LC_${variable}; export ${variable}`);


    // compile command parts
    const localExportsString = localExports.length ? `${localExports.join('; ')}; ` : '';
    const sshExportsPrefix = sshExports.length ? `${sshExports.join('; ')}; ` : '';
    const sshOptionsPrefix = sshOptions.length ? `${sshOptions.join(' ')} ` : '';

    // create command with exports, variables and child command
    const wrapped = this.wrapCompiled(`${sshExportsPrefix}${child}`);
    return `${localExportsString}ssh ${sshOptionsPrefix}${this.config.host} ${wrapped}`;
  }
};
