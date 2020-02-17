export default function getUniqueValues(items: string[]): string[] {
  return Object.keys(items.reduce((stack, value) => (stack[value] = true) && stack, {} as { [key: string]: true }));
};
