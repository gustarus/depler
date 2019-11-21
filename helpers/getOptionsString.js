const getOptionString = require('./getOptionString');

module.exports = function getOptionsString(options) {
  return Object.keys(options).map((name) => {
    const value = options[name];

    // multiple values with the same key
    // something like `-v ./app:/app -v ./data:/data`
    return value instanceof Array
      ? value.map((part) => getOptionString(name, part)).join(' ')
      : getOptionString(name, value);
  }).filter((value) => value).join(' ');
};