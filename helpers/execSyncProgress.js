const { execSync } = require('child_process');
const colors = require('colors/safe');
const ensureCommand = require('./ensureCommand');
const secretCommandVariables = require('./secretCommandVariables');

module.exports = function execSyncProgress(scenario, ...parts) {
  const command = ensureCommand(...parts);
  const compiled = command.compile();

  console.log(`$ ${secretCommandVariables(compiled)}`);

  try {
    switch (scenario) {
      case 'display':
        return execSync(compiled, { stdio: 'inherit' });
      case 'return':
        return execSync(compiled).toString().trim();
      default:
        throw new Error('Invalid scenario passed');
    }
  } catch (error) {
    console.log(colors.red(secretCommandVariables(error.stack)));
    process.exit(1);
    return false;
  }
};