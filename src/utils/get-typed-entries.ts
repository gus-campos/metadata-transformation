
export function getTypedEntries<T extends object>(obj: T) {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}
    