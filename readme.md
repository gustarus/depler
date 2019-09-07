# Depler ![docker](https://img.shields.io/badge/-docker_deploy-333?style=flat-square&logo=docker) ![with love](https://img.shields.io/badge/-with_love-ff69b4?style=flat-square) ![hardcore](https://img.shields.io/badge/-hardcore-orange?style=flat-square)
**Easily deploy your docker app to single remote host without dependencies**.
No registry. No swarm (actually, optional). No kubernetes.
Only hardcore. Only single remote machine.
What you only need: it is docker on both - local and remote machines.

## Installation
**0. Install docker**

This package requires docker on both: local and remote machines.
Just google for `install docker %os%`.

**1. Install the package**

Install as local package to link with `./node_modules/.bin`.
```bash
npm i --save-dev depler
```

Install globally to use `depler deploy` from everywhere.
```bash
npm i --save-dev -g depler
```

**2. Expose port `80` in your dockerfile**

By default `depler` thinks that you expose port `80` in your dockerfile like below.
In the future, we will improve this feature and will implement ability to bind to another port via argument.
But now, please, expose this port in your dockerfile.
```dockerfile
# run the app
CMD ["node", "server.js", "--port", "80"]
EXPOSE 80
```

**3. [optional] Add scripts to package.json**

Add script to your package.json because commands usually too long to type them every time in console.
```json
{
  "scripts": {
    "deploy": "./node_modules/.bin/depler deploy ..."
  }
}
``` 

## Examples
### Copy-and-paste source code to remote host → build docker image remotely → run docker container remotely
Take a look at this command.
```bash
depler deploy --code my-nodejs-app --host web@192.168.1.22 --as source --run-as container .
```

> Bro, deploy the app (`deploy`) for me with repository name `my-nodejs-app` (`--code`) to host `192.168.1.22` as user `web` (`--host`) using `source` strategy (`--as source`) and run it on port `8080` ([default config](defaults.json)).

The flag `---as source` tells tool that we should copy source code to remote host → build image → run container on remote host.

### Build docker image locally → transfer image to remote host → run docker container remotely
Almost the same command, but instead of `--as source` we should pass `--as image` flag.
```bash
depler deploy --code my-nodejs-app --host web@192.168.1.22 --as image --run-as container .
```

This flag tells tool that we should build image locally first → transfer it to remote host → run container on remote host.

### Deploy your app to raspberry pi from something else
I run into some problems when I tried to deploy my app from OS X to Raspberry PI (both have different architectures).
So, my workaround is easy: deploy only source code of the app and build image remotely from different docker image.

Take a look at this command.
It says to the tool: *bro, deploy the app (`deploy`) with repository name `my-nodejs-app` (`--code`) to host `192.168.1.22` as user `web` (`--host`) using `source` strategy (`--as source`) and build the image with arg `FROM=arm64v8/node:10.16.1-buster-slim` (`--build-arg`) and run the container on port `8080` (default config)*.
```bash
depler deploy --code my-nodejs-app --host web@192.168.1.22 --as source --run-as container --build-arg FROM=arm64v8/node:10.16.1-buster-slim .
``` 

My dockerfile for the app looks like below.
```dockerfile
#!/bin/bash
ARG FROM=mhart/alpine-node:10.16
FROM ${FROM}
# ...
```

As you see, I have default value for base image name (`mhart/alpine-node:10.16`), but I override this value with `--build-arg` and set this arg to `arm64v8/node:10.16.1-buster-slim` on docker build stage.

## Scenario
Deploy tells tool to run the image as a single detached container with te following scenario:
1. Stop all containers with matched name.
2. Run new container with the tag.

## Commands
### `Deploy`
Basically the tool has only one command: `deploy`.
This command performs deploy to remote host.
And it has a lot of options.

#### Options
Option | Example | Default | Description
--- | --- | --- | ---
`--code` | `code` | - | Code of the image for tagging. | 
`--release` | `gelborg` | Latest git commit short hash, for example: `b2508fe`. | Release version of the image for tagging. |
`--host` | `john@example.com` | - | Host where to run docker container. |
`--as` | `source` or `image` | - | Define deploy scenario:<br/>`source`: deploy source code as files and build on the remote host without files under the .gitignore;<br/>`image`: build locally and transfer image to the remote host. |
`--build-arg` | `FROM=node:10.16` | - | Pass build args as to docker build |
`--no-cache` | - | - | Do not use cache when building the image |
`--config` | - | - | Pass path to custom config file. |
`--help` | - | - | Show help readme. |

#### `--as source` vs. `--as image`
Which to chose? 

The first one (`--as source`) tells tool to use the next flow:
1. Copy-and-paste source code from local folder to remote host into `/tmp/...` folder.
2. Build docker image on remote host via ssh from source code from `/tmp/...` folder.
3. Run docker container on remote host.

The second one (`--as image`) tells tool to use the another flow:
1. Build docker image locally.
2. Archive image to `.tar` file and put it into local `/tmp/...` folder.
3. Transfer archive to remote host and put it into `/tmp/...` remote folder.
4. Load archive to docker from `/tmp/...` folder.
5. Run docker container on remote host.

I prefer to use the second scenario (`--as image`).

### Other commands
All other commands from this tool are not usable as standalone commands.
But, if something went wrong, you can just rerun failed command with logged arguments.

Command | Description 
--- | ---
upload [options] <path> | Upload source code to the remote host.
build [options] <path> | Build docker image from source code: local and remote build scenarios are allowed.
archive [options] | Archive image to temporary file.
transfer [options] | Transfer image archive to remote host.
load [options] | Load image from archive on remote host.
exit [options] | Stop and remove running container.
run [options] | Run container on remote host.
clean [options] | Clean local and remote hosts.
deploy [options] <path> | Deploy container to the remote host.

### Overrides for commands
There is an ability to override some commands like `docker run` or `docker build`.
You can pass custom arguments to this commands through `.json` settings file with `--config` argument.
Section `default` will be used for all commands.
Section `run:container` will be used to pass variables to docker run script.
```json
{
  "default": {},
  "commands": {
    "run": {
      "container": {
        "publish": "8080:80",
        "volume": ["./app:/app", "./data:/data"]
      }
    }
  }
}
```


## To be done
* [ ] Automatically run `docker swarm init` on remote host.
* [ ] Additional overrides for the commands via `settings.json`.
