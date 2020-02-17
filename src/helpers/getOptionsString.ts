import getOptionString from './getOptionString';

export default function getOptionsString(options: { [key: string]: string | string[] }): string {
  return Object.keys(options).map((name) => {
    const value = options[name];

    // multiple values with the same key
    // something like `-v ./app:/app -v ./data:/data`
    return value instanceof Array
      ? value.map((part) => getOptionString(name, part)).join(' ')
      : getOptionString(name, value);
  }).filter((value) => value).join(' ');
};
