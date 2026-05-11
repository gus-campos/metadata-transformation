
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}

export function typedAssignValueToObject<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
  obj[key] = value;
}