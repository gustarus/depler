const Command = require('./Command');

const compileDefaults = { wrap: false };

module.exports = class RemoteCommand extends Command {
  constructor(host, ...parts) {
    super(...parts);
    this.host = host || false;
    this.with = [];

    if (!this.host) {
      throw new Error('Empty host passed: should be like \'john@example.com\'');
    }

    if (this.parts.length !== 1 || !(this.parts[0] instanceof Command)) {
      throw new Error('Invalid child command format: should be single instance of \'Command\' class');
    }
  }

  compile(customOptions = {}) {
    const options = { ...compileDefaults, ...customOptions };

    // compile child command
    const child = super.compile({ ...options, wrap: false });

    // get all proxy variables
    // skip raw values
    const variables = this.with
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
    const wrapped = this.wrap(`${sshExportsPrefix}${child}`);
    return `${localExportsString}ssh ${sshOptionsPrefix}${this.host} ${wrapped}`;
  }
};