export function filterUnique<T>(item: T, index: number, array: T[]) {
  return array.indexOf(item) === index;
}
