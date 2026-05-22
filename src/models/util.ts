type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);