export function safeClone<T>(obj: T, seen = new WeakMap()): T {
    if (obj === null || (typeof obj !== "object" && typeof obj !== "function"))
        return obj;

    // Objetos host da plataforma podem ter typeof "object"
    // mas não serem válidos como chave de WeakMap
    try {
        if (seen.has(obj as object)) return seen.get(obj as object);
    } catch {
        return obj; // não é clonável — devolve a referência original
    }

    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as T;
    if (typeof obj === "function") return obj;

    if (obj instanceof Map) {
        const clone = new Map();
        seen.set(obj, clone);
        obj.forEach((v, k) =>
            clone.set(safeClone(k, seen), safeClone(v, seen)),
        );
        return clone as T;
    }

    if (obj instanceof Set) {
        const clone = new Set();
        seen.set(obj, clone);
        obj.forEach((v) => clone.add(safeClone(v, seen)));
        return clone as T;
    }

    if (Array.isArray(obj)) {
        const clone: any[] = [];
        seen.set(obj, clone);
        obj.forEach((item, i) => {
            clone[i] = safeClone(item, seen);
        });
        return clone as T;
    }

    const clone = Object.create(Object.getPrototypeOf(obj));

    try {
        seen.set(obj as object, clone);
    } catch {
        return obj; // mesmo caso — objeto host não clonável
    }

    for (const key of Reflect.ownKeys(obj as object)) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key)!;
        if ("value" in descriptor) {
            descriptor.value = safeClone(descriptor.value, seen);
        }
        Object.defineProperty(clone, key, descriptor);
    }

    return clone as T;
}
