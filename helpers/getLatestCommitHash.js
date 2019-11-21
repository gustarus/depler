const { execSync } = require('child_process');
const requiredPath = require('./requiredPath');

module.exports = function getLatestCommitHash(path) {
  requiredPath(path, `Directory '${path}' doesn't exist.`);
  requiredPath(`${path}/.git`, `There is no git repository inside '${path}': we have to fetch latest commit hash to generate docker image tag.`);

  const result = execSync(`cd ${path} && git rev-parse --short HEAD`);
  return result.toString().trim();
};