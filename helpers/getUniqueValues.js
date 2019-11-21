module.exports = function getUniqueValues(items) {
  return Object.keys(items.reduce((stack, value) => (stack[value] = true) && stack, {}));
};