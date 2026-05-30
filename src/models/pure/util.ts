
export type KeysOfUnion<T> = T extends unknown ? keyof T : never;