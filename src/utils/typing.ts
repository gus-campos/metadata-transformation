export function typedAssignValueToObject<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K],
) {
  obj[key] = value;
}
