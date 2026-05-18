import { ZodType } from "zod";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function fail(expected: string, received: unknown): never {
  throw new ValidationError(`${expected}\nRecebido: ${serialize(received)}`);
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

export function formatArray(array: readonly any[]) {
  return `[${array.map((item) => serialize(item)).join(", ")}]`;
}

export function assertSchemaType<T>(
  schema: ZodType<T>,
  candidate: unknown,
  validationPath?: string,
): candidate is T {
  const result = schema.safeParse(candidate);

  if (!result.success) {
    const zodMessage = result.error.issues[0].message;
    const additionalMessage = validationPath ? `Erro na validação no caminho ${validationPath}:\n` : "";
    fail(
      `${additionalMessage}${zodMessage}`,
      candidate,
    );
  }

  return true;
}
