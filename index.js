#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const colors = require('colors/safe');
const program = require('commander');
const merge = require('lodash.merge');
const info = require('./package.json');
const defaults = require('./defaults');
const prefix = 'from-russia-with-love';

const deployAsFormat = /^(source|image)$/;
const tagFormat = /^[\w\d-_]+:[\w\d-_]+$/;
const mask = '*****';

program
  .version(info.version)
  .description('Tool to deploy docker containers to remote host');

program
  .command('upload')
  .arguments('<path>')
  .description('Upload source code to the remote host')
  .option('--tag <code:latest>', 'Docker image tag to describe temporary folder')
  .option('--host <john@example.com>', 'Host where to upload source code')
  .option('--config <path>', 'Use custom config for the command')
  .action((path, cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'host');
    requiredOption(cmd, 'tag', tagFormat);

    // get temporary folder to store source code on the remote
    const tmp = getPathToTemporarySourceCode(cmd.tag);

    // execute child command
    execSyncProgressDisplay(`ssh ${cmd.host} rm -rf ${tmp}`);
    execSyncProgressDisplay(`rsync --exclude='/.git' --filter="dir-merge,- .gitignore" -az ${path}/ ${cmd.host}:${tmp}`);
    displayCommandDone(cmd);
  });

program
  .command('build')
  .arguments('<path>')
  .description('Build docker image from source code: local and remote build scenarios are allowed')
  .option('--tag <code:latest>', 'Tag for the image')
  .option('--host <john@example.com>', 'Host where to build docker image; if not passed: will be built locally')
  .option('--config <path>', 'Use custom config for the command')
  .action((path, cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'tag', tagFormat);
    const config = loadCommandConfig(cmd);

    // get ssh prefix command if remote build requested
    const entry = cmd.host && `ssh ${cmd.host}`;

    execSyncProgressDisplay(entry, 'docker', 'build', { tag: cmd.tag }, config.image, path);
    displayCommandDone(cmd);
  });

program
  .command('archive')
  .description('Archive image to temporary file')
  .option('--tag <code:latest>', 'Docker image tag to archive to temporary file')
  .option('--config <path>', 'Use custom config for the command')
  .action((cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'tag', tagFormat);

    // get path to temporary archive
    const archive = getPathToTemporaryArchive(cmd.tag);

    execSyncProgressDisplay(`docker save -o ${archive} ${cmd.tag}`);
    displayCommandDone(cmd);
  });

program
  .command('transfer')
  .description('Transfer image archive to remote host')
  .option('--tag <code:latest>', 'Docker image tag to transfer to remote host')
  .option('--host <john@example.com>', 'Host to deploy docker container')
  .option('--config <path>', 'Use custom config for the command')
  .action((cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'tag', tagFormat);
    requiredOption(cmd, 'host');

    // get path to temporary archive and validate it
    const archive = getPathToTemporaryArchive(cmd.tag);
    requiredPath(archive, `The archive doesn\'t exist: ${archive}.`);

    execSyncProgressDisplay(`scp ${archive} ${cmd.host}:${archive}`);
    execSyncProgressDisplay(`rm -rf ${archive}`);
    displayCommandDone(cmd);
  });

program
  .command('load')
  .description('Load image from archive on remote host')
  .option('--tag <code:latest>', 'Docker image tag to resolve archive name')
  .option('--host <john@example.com>', 'Host where to load image')
  .option('--config <path>', 'Use custom config for the command')
  .action((cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'tag', tagFormat);
    requiredOption(cmd, 'host');

    // get path to temporary archive and validate it
    const archive = getPathToTemporaryArchive(cmd.tag);

    execSyncProgressDisplay(`ssh ${cmd.host} docker load -i ${archive}`);
    execSyncProgressDisplay(`ssh ${cmd.host} rm -rf ${archive}`);
    displayCommandDone(cmd);
  });

program
  .command('run')
  .description('Run container on remote host')
  .option('--tag <code:latest>', 'Docker image tag to run on remote host')
  .option('--host <john@example.com>', 'Host where to run docker container')
  .option('--config <path>', 'Use custom config for the command')
  .action((cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'tag', tagFormat);
    requiredOption(cmd, 'host');
    const entry = cmd.host && `ssh ${cmd.host}`;
    const config = loadCommandConfig(cmd);
    const name = config.tag.split(':')[0];

    if (config.container.network) {
      displayCommandStep(cmd, 'Creating required networks');
      const networks = typeof config.container.network === 'string'
        ? [config.container.network] : config.container.network;

      for (const network of networks) {
        execSyncProgressDisplay(entry, `docker network create -d bridge ${network} || true`);
      }
    }

    displayCommandStep(cmd, 'Checking for already running containers');
    const psResult = execSyncProgressReturn('ssh', config.host, `docker ps -a -q --filter "name=${name}" --format="{{.ID}}"`);
    if (psResult) {
      displayCommandStep(cmd, 'Stopping and removing running containers');
      const containersIds = getUniqueValues(psResult.split('\n'));
      execSyncProgressDisplay(entry, `docker rm -f ${containersIds.join(' ')}`);
    } else {
      displayCommandStep(cmd, 'There is no running containers');
    }

    displayCommandStep(cmd, `Run the image as a container`);
    execSyncProgressDisplay(entry, 'docker run', { name }, config.container, config.tag);

    displayCommandDone(cmd);
  });

program
  .command('clean')
  .description('Clean local and remote hosts')
  .option('--tag <code:latest>', 'Docker image tag to clean')
  .option('--host <john@example.com>', 'Host where to clean')
  .option('--config <path>', 'Use custom config for the command')
  .action((cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'tag', tagFormat);
    requiredOption(cmd, 'host');

    // get path to temporary working directory
    const tmp = getPathToTemporarySourceCode(cmd.tag);

    // get path to temporary archive
    const archive = getPathToTemporaryArchive(cmd.tag);

    execSyncProgressDisplay(`rm -rf ${tmp} ${archive}`);
    execSyncProgressDisplay(`ssh ${cmd.host} rm -rf ${tmp} ${archive}`);
    displayCommandDone(cmd);
  });

program
  .command('deploy')
  .arguments('<path>')
  .description('Deploy container to the remote host')
  .option('--code <code>', 'Code of the image for tagging')
  .option('--release <latest>', 'Release version of the image for tagging (latest git commit hash by default)')
  .option('--host <john@example.com>', 'Host where to run docker container')
  .option('--as <source|image>', 'Deploy source code or transfer image to remote host')
  .option('--config <path>', 'Use custom config for the command')
  .action((path, cmd) => {
    displayCommandGreetings(cmd);
    requiredOption(cmd, 'as', deployAsFormat);
    requiredOption(cmd, 'code');
    requiredOption(cmd, 'host');

    // get execution command
    const exec = `node ${__filename}`;

    // get tag based on latest git commit
    const code = cmd.code;
    const release = cmd.release || getLatestCommitHash(path);
    const tag = `${code}:${release}`;

    // get runtime variables
    const { host, config } = cmd;

    console.log('');
    execSyncProgressDisplay(`${exec} clean`, { tag, host, config }); // clean local and remote before deploy

    switch (cmd.as) {
      case 'source': // deploy source code as files and build on the remote host
        console.log('');
        displayCommandStep(cmd, 'Deploy source code as files and build on the remote host');

        console.log('');
        execSyncProgressDisplay(`${exec} upload`, { tag, host, config }, path); // upload source code to the remote

        console.log('');
        const tmp = getPathToTemporarySourceCode(tag); // get path to tmp folder with source code
        execSyncProgressDisplay(`${exec} build`, { tag, host, config }, tmp); // build the image on the remote
        break;

      case 'image': // build locally and transfer image to the remote host
        console.log('');
        displayCommandStep(cmd, 'Build locally and transfer image to the remote host');

        console.log('');
        execSyncProgressDisplay(`${exec} build`, { tag, config }, path); // build the image locally

        console.log('');
        execSyncProgressDisplay(`${exec} archive`, { tag, config }); // archive the image locally

        console.log('');
        execSyncProgressDisplay(`${exec} transfer`, { tag, host, config }); // transfer the image to the remote

        console.log('');
        execSyncProgressDisplay(`${exec} load`, { tag, host, config }); // load the image to the remote docker
        break;
    }

    console.log('');
    execSyncProgressDisplay(`${exec} exit`, { tag, host, config }); // stop and remove running containers with the same tag

    console.log('');
    execSyncProgressDisplay(`${exec} run`, { tag, host, config }); // start the container on the remote

    console.log('');
    execSyncProgressDisplay(`${exec} clean`, { tag, host, config }); // clean local and remote after deploy

    displayCommandDone(cmd);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

function requiredOption(cmd, option, format = undefined) {
  const code = `--${option.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;

  if (!cmd[option]) {
    console.log(colors.red(`Option '${code}' is required.\n`));
    cmd.help();
  }

  if (format && !cmd[option].match(format)) {
    console.log(colors.red(`Option '${code}' value '${cmd[option]}' is in invalid format: should be ${format.toString()}.\n`));
    cmd.help();
  }
}

function requiredPath(path, message = 'Path doesn\'t exist') {
  if (!fs.existsSync(path)) {
    throw colors.red(message);
  }
}

function buildCommand(...parts) {
  return parts.map((part) => {
    if (typeof part === 'object') {
      return getOptionsString(part);
    }

    return part;
  }).join(' ');
}

function execSyncProgressDisplay(...parts) {
  const cmd = buildCommand(...parts);
  console.log(`$ ${secretCommandVariables(cmd)}`);
  return execSync(cmd, { stdio: 'inherit' });
}

function execSyncProgressReturn(...parts) {
  const cmd = buildCommand(...parts);
  console.log(`$ ${cmd}`);
  return execSync(cmd).toString().trim();
}

function getOptionsFromRawArgs(args, option) {
  const options = [];
  for (const key in args) {
    const part = args[key];
    const index = parseInt(key, 10);
    if (part === `--${option}` && args[index + 1]) {
      const value = args[index + 1];
      options.push(value);
    }
  }

  return options;
}

function getPathToTemporaryArchive(tag) {
  return `/tmp/${prefix}-${tag}.tar`;
}

function getPathToTemporarySourceCode(tag) {
  return `/tmp/${prefix}-${tag}`;
}

function getLatestCommitHash(path) {
  requiredPath(path, `Directory '${path}' doesn't exist.`);
  requiredPath(`${path}/.git`, `There is no git repository inside '${path}': we have to fetch latest commit hash to generate docker image tag.`);

  const result = execSync(`cd ${path} && git rev-parse --short HEAD`);
  return result.toString().trim();
}

function loadCommandConfig(cmd) {
  const name = cmd.name();

  // parse overrides from the pwd directory
  let overrides = { commands: {} };
  if (cmd.config) {
    if (!fs.existsSync(cmd.config)) {
      throw colors.red(`Unable to find override config file in '${cmd.config}`);
    }

    overrides = JSON.parse(fs.readFileSync(cmd.config).toString());
  }

  // merge configuration with defaults
  const config = merge({}, defaults.default, defaults.commands[name], overrides.default, overrides.commands[name], cmd.opts());

  // load environment variables
  return loadEnvironmentVariables(config);
}

function displayCommandGreetings(cmd) {
  console.log(`[${colors.blue(cmd.name())}] ${cmd.description()}`);
}

function displayCommandStep(cmd, message) {
  console.log(`[${colors.blue(cmd.name())}] ${message}`);
}

function displayCommandDone(cmd) {
  displayCommandStep(cmd, colors.green('The task was successful'));
}

function secretCommandVariables(cmd) {
  let masked = cmd;

  const template = '(--build-arg|-e|--env)\\s+[a-z-_]+=';
  const regexp = new RegExp(template, 'ig');

  let match;
  while ((match = regexp.exec(cmd)) !== null) {
    const definition = match[0];
    const char = cmd[regexp.lastIndex];
    if (['\'', '"'].includes(char)) {
      // replace '--build-arg SOME_VARIABLE="secret with spaces"'
      // or "--build-arg SOME_VARIABLE='secret with spaces'" strings
      const replaceRegex = new RegExp(`${definition}${char}([^${char}]+)${char}`, 'ig');
      const replaceReplacement = `${definition}${char}${mask}${char}`;
      masked = masked.replace(replaceRegex, replaceReplacement);
    } else {
      // replace '--build-arg SOME_VARIABLE=secret' strings
      const replaceRegex = new RegExp(`${definition}[^\s]+`, 'ig');
      const replaceReplacement = `${definition}${mask}`;
      masked = masked.replace(replaceRegex, replaceReplacement);
    }
  }

  return masked;
}

function loadEnvironmentVariables(value) {
  if (typeof value === 'object') {
    const result = value instanceof Array ? [] : {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = loadEnvironmentVariables(value[key]);
      }
    }

    return result;
  }

  if (typeof value === 'string') {
    return value.replace(/\${[a-z-_]+}/ig, (matched) => {
      const name = matched.replace(/^\${(.*?)}$/, '$1');
      return process.env[name] || matched;
    });
  }

  return value;
}

function getOptionString(key, value) {
  const prefix = key.length === 1
    ? `-${key}` : `--${key}`;

  // boolean value
  // something like `--flag`
  if (typeof value === 'boolean') {
    return value ? prefix : '';
  }

  return `${prefix} ${value}`;
}

function getOptionsString(options) {
  return Object.keys(options).map((name) => {
    const value = options[name];

    // multiple values with the same key
    // something like `-v ./app:/app -v ./data:/data`
    return value instanceof Array
      ? value.map((part) => getOptionString(name, part)).join(' ')
      : getOptionString(name, value);
  }).filter((value) => value).join(' ');
}

function getUniqueValues(items) {
  return Object.keys(items.reduce((stack, value) => (stack[value] = true) && stack, {}));
}
