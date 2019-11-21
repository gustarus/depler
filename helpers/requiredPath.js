const fs = require('fs');
const colors = require('colors/safe');

module.exports = function requiredPath(path, message = 'Path doesn\'t exist') {
  if (!fs.existsSync(path)) {
    throw colors.red(message);
  }
};