type TCollectionItem = string | number | boolean;

export default function ensureCollection<T = TCollectionItem>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  return typeof value === 'undefined' ? [] : [value];
};
