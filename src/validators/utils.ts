
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function fail(expected: string, received: unknown): never {
  throw new ValidationError(`${expected}\n  Recebido: ${serialize(received)}`);
}

export function serialize(val: unknown): string {
  try {
    return JSON.stringify(
      val,
      (_k, v) => (typeof v === "function" ? "[Function]" : v),
      2,
    );
  } catch {
    return String(val);
  }
}

export function isPlainObject(val: unknown): val is Record<string, unknown> {
  return (
    typeof val === "object" &&
    val !== null &&
    !Array.isArray(val) &&
    !(val instanceof Date)
  );
}

export function formatList(array: unknown[]) {
  return `[${
    array.map(item => serialize(item)).join(", ")
  }]`;
}