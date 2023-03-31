export function uniqueOnProp<T>(prop: keyof T) {
  return (item: T, index: number, array: T[]) => {
    return array.findIndex((i) => i[prop] === item[prop]) === index;
  };
}
