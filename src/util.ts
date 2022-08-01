export function debounce(fn: Function, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function filterUnique<T>(item: T, index: number, array: T[]) {
  return array.indexOf(item) === index;
}

export function uniqueOnProp<T>(prop: keyof T) {
  return (item: T, index: number, array: T[]) => {
    return array.findIndex((i) => i[prop] === item[prop]) === index;
  };
}
