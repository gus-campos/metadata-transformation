export function wrappedError(message: string, err: unknown): Error {
  return new Error(
    `${message}:\n${err instanceof Error ? err.message : String(err)}`,
    { cause: err },
  );
}