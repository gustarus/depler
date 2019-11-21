const getOptionsString = require('./../helpers/getOptionsString');

const compileDefaults = { wrap: false };

module.exports = class Command {
  constructor(...parts) {
    this.parts = parts;
  }

  configure(config) {
    for (const name in config) {
      this[name] = config[name];
    }
  }

  compile(customOptions = {}) {
    const options = { ...compileDefaults, ...customOptions };
    const { wrap } = options;

    const prepared = this.parts.map((part) => {
      if (part instanceof Command) {
        // compile child command
        const child = part.compile({ ...options, wrap: true });

        // wrap child command with quotes and add slashes
        return wrap ? this.wrap(child) : child;
      }

      if (typeof part === 'object') {
        return getOptionsString(part);
      }

      return part;
    });

    return prepared.filter((value) => value).join(' ');
  }

  wrap(compiled) {
    return `'${compiled.replace('\'', '\\\'')}'`;
  }
};