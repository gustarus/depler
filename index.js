const fs = require('fs');
const {execSync} = require('child_process');
const colors = require('colors/safe');
const program = require('commander');
const info = require('./package.json');
const prefix = 'from-russia-with-love';

program
  .version(info.version)
  .description('Tool to deploy docker containers to remote host');

program
  .command('upload')
  .arguments('<path>')
  .description('Upload source code to the remote host')
  .option('--tag <code:latest>', 'Docker image tag to describe temporary folder')
  .option('--host <john@example.com>', 'Host where to upload source code')
  .action((path, cmd) => {
    requiredOption(cmd, 'host');
    requiredOption(cmd, 'tag');
    console.log(colors.blue('[upload]'));
    console.log('Upload source code to the remote server');

    // get temporary folder to store source code on the remote
    const tmp = getPathToTemporarySourceCode(cmd.tag);

    // execute child command
    execSyncProgress(`ssh ${cmd.host} rm -rf ${tmp}`);
    execSyncProgress(`rsync -az ${path}/ ${cmd.host}:${tmp}`);
    console.log(colors.green('The task was successful'));
  });

program
  .command('build')
  .arguments('<path>')
  .description('Build docker image from source code: local and remote build scenarios are allowed')
  .option('--tag <code:latest>', 'Tag for the image')
  .option('--host <john@example.com>', 'Host where to build docker image; if not passed: will be built locally')
  .option('--build-arg <key=value>', 'Pass build args as to docker build')
  .option('--no-cache', 'Do not use cache when building the image')
  .action((path, cmd) => {
    requiredOption(cmd, 'tag');
    console.log(colors.blue('[build]'));
    console.log('Build docker image from the source code');

    // get ssh prefix command if remote build requested
    const entry = cmd.host && `ssh ${cmd.host}`;

    // extract build args if passed
    const args = getBuildArguments(cmd.parent.rawArgs);

    // as you see, we proxy --no-cache flag
    // by default commander sets cache to true if there is no `--no-cache` flag
    // if you pass `--no-cache` flag in will be stored as false in `cmd.cache`
    // by default `cmd.cache` is enabled
    const child = [entry, 'docker', 'build', !cmd.cache && '--no-cache', `--tag ${cmd.tag}`, args, path];
    execSyncProgress(child.filter((value) => value).join(' '));
    console.log(colors.green('The task was successful'));
  });

program
  .command('archive')
  .description('Archive image to temporary file')
  .option('--tag <code:latest>', 'Docker image tag to archive to temporary file')
  .action((cmd) => {
    requiredOption(cmd, 'tag');
    console.log(colors.blue('[archive]'));
    console.log('Create an archive of the image and store it into temporary folder');

    // get path to temporary archive
    const archive = getPathToTemporaryArchive(cmd.tag);

    execSyncProgress(`docker save -o ${archive} ${cmd.tag}`);
    console.log(colors.green('The task was successful'));
  });

program
  .command('transfer')
  .description('Transfer image archive to remote host')
  .option('--tag <code:latest>', 'Docker image tag to transfer to remote host')
  .option('--host <john@example.com>', 'Host to deploy docker container')
  .action((cmd) => {
    requiredOption(cmd, 'tag');
    requiredOption(cmd, 'host');
    console.log(colors.blue('[transfer]'));
    console.log('Transfer the archive of the image to the remote host');

    // get path to temporary archive and validate it
    const archive = getPathToTemporaryArchive(cmd.tag);
    requiredPath(archive, `The archive doesn\'t exist: ${archive}.`);

    execSyncProgress(`scp ${archive} ${cmd.host}:${archive}`);
    execSyncProgress(`rm -rf ${archive}`);
    console.log(colors.green('The task was successful'));
  });

program
  .command('load')
  .description('Load image from archive on remote host')
  .option('--tag <code:latest>', 'Docker image tag to resolve archive name')
  .option('--host <john@example.com>', 'Host where to load image')
  .action((cmd) => {
    requiredOption(cmd, 'tag');
    requiredOption(cmd, 'host');
    console.log(colors.blue('[load]'));
    console.log('Load image from the archive to the docker');

    // get path to temporary archive and validate it
    const archive = getPathToTemporaryArchive(cmd.tag);

    execSyncProgress(`ssh ${cmd.host} docker load -i ${archive}`);
    execSyncProgress(`ssh ${cmd.host} rm -rf ${archive}`);
    console.log(colors.green('The task was successful'));
  });

program
  .command('run')
  .description('Run container on remote host')
  .option('--tag <code:latest>', 'Docker image tag to run on remote host')
  .option('--host <john@example.com>', 'Host where to run docker container')
  .option('--port <8080>', 'Port to listen when running docker container')
  .action((cmd) => {
    requiredOption(cmd, 'tag');
    requiredOption(cmd, 'host');
    requiredOption(cmd, 'port');
    console.log(colors.blue('[run]'));
    console.log('Run the container inside the remote server');

    execSyncProgress(`ssh ${cmd.host} docker run --rm -d -p ${cmd.port}:80 ${cmd.tag}`);
    console.log(colors.green('The task was successful'));
  });

program
  .command('clean')
  .description('Clean local and remote hosts')
  .option('--tag <code:latest>', 'Docker image tag to clean')
  .option('--host <john@example.com>', 'Host where to clean')
  .action((cmd) => {
    requiredOption(cmd, 'tag');
    requiredOption(cmd, 'host');
    console.log(colors.blue('[clean]'));
    console.log('Clean local and remote hosts before or after deploy');

    // get path to temporary working directory
    const tmp = getPathToTemporarySourceCode(cmd.tag);

    // get path to temporary archive
    const archive = getPathToTemporaryArchive(cmd.tag);

    execSyncProgress(`rm -rf ${tmp} ${archive}`);
    execSyncProgress(`ssh ${cmd.host} rm -rf ${tmp} ${archive}`);
    console.log(colors.green('The task was successful'));
  });

program
  .command('deploy')
  .arguments('<path>')
  .description('Deploy container to the remote host')
  .option('--code <code>', 'Code of the image for tagging')
  .option('--release <latest>', 'Release version of the image for tagging (latest git commit hash by default)')
  .option('--host <john@example.com>', 'Host where to run docker container')
  .option('--port <8080>', 'Port to listen when running docker container')
  .option('--source', 'Deploy source code as files and build on the remote host')
  .option('--image', 'Build locally and transfer image to the remote host')
  .option('--build-arg <key=value>', 'Pass build args as to docker build')
  .option('--no-cache', 'Do not use cache when building the image')
  .action((path, cmd) => {
    requiredOption(cmd, 'code');
    requiredOption(cmd, 'host');
    requiredOption(cmd, 'port');

    if (cmd.source && cmd.image) {
      console.log(colors.red('Arguments conflict: use only `--source` or `--image`, not both of them'));
      cmd.help();
    }

    if (!cmd.source && !cmd.image) {
      console.log(colors.red('Invalid arguments: choose scenario to deploy via `--source` or `--image` flag'));
      cmd.help();
    }

    console.log(colors.blue('[deploy]'));
    console.log('Execute full deploy process');

    // get execution command
    const exec = `node ${__filename}`;

    // get tag based on latest git commit
    const code = cmd.code;
    const release = cmd.release || getLatestCommitHash(path);
    const tag = `${code}:${release}`;

    // extract build args if passed
    const args = getBuildArguments(cmd.parent.rawArgs);

    console.log('');
    execSyncProgress(`${exec} clean --tag ${tag} --host ${cmd.host}`); // clean local and remote before deploy

    switch (true) {
      case cmd.source: // deploy source code as files and build on the remote host
        console.log('');
        console.log(colors.yellow('Deploy source code as files and build on the remote host'));

        console.log('');
        execSyncProgress(`${exec} upload --tag ${tag} --host ${cmd.host} ${path}`); // upload source code to the remote

        console.log('');
        const tmp = getPathToTemporarySourceCode(tag); // get path to tmp folder with source code
        execSyncProgress(`${exec} build --tag ${tag} --host ${cmd.host} --no-cache ${args} ${tmp}`); // build the image on the remote
        break;

      case cmd.image: // build locally and transfer image to the remote host
        console.log('');
        console.log(colors.yellow('Build locally and transfer image to the remote host'));

        console.log('');
        execSyncProgress(`${exec} build --tag ${tag} --release ${release} --no-cache ${args} ${path}`); // build the image locally

        console.log('');
        execSyncProgress(`${exec} archive --tag ${tag}`); // archive the image locally

        console.log('');
        execSyncProgress(`${exec} transfer --tag ${tag} --host ${cmd.host}`); // transfer the image to the remote

        console.log('');
        execSyncProgress(`${exec} load --tag ${tag} --host ${cmd.host}`); // load the image to the remote docker
        break;
    }

    console.log('');
    execSyncProgress(`${exec} run --tag ${tag} --host ${cmd.host} --port ${cmd.port}`); // start the container on the remote

    console.log('');
    execSyncProgress(`${exec} clean --tag ${tag} --host ${cmd.host}`); // clean local and remote after deploy
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

function requiredOption(cmd, option) {
  if (!cmd[option]) {
    console.log(colors.red(`Option --${option} is required.\n`));
    cmd.help();
  }
}

function requiredPath(path, message = 'Path doesn\'t exist') {
  if (!fs.existsSync(path)) {
    throw new Error(colors.red(message));
  }
}

function execSyncProgress(cmd) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, {stdio: 'inherit'});
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

function getBuildArguments(raw) {
  // extract build args if passed
  const args = getOptionsFromRawArgs(raw, 'build-arg');

  // append all build args to the child command
  return args.map((value) => `--build-arg ${value}`).join(' ');
}
