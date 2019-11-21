module.exports = function getOptionString(key, value) {
  const prefix = key.length === 1
    ? `-${key}` : `--${key}`;

  // boolean value
  // something like `--flag`
  if (typeof value === 'boolean') {
    return value ? prefix : '';
  }

  return `${prefix} ${value}`;
};