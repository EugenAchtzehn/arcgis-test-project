export function arrayEqual(arr1: string[], arr2: string[]) {
  return arr1.length === arr2.length && arr1.every((item, index) => item === arr2[index]);
}
