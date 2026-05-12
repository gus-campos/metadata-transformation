import z from "zod";

export function strictAndHelper(
  left: z.ZodTypeAny,
  right: z.ZodTypeAny,
  errorMessage?: string,
): z.ZodTypeAny {
  const lefts = flattenUnion(left);
  const rights = flattenUnion(right);

  const merged = lefts.flatMap((l) =>
    rights.map((r) => l.extend(r.shape).strict()),
  );

  if (merged.length === 1) return merged[0];

  const [first, second, ...rest] = merged;
  return z.union([first, second, ...rest], {
    ...(errorMessage && {
      error: "Valor inválido",
    }),
  });
}

function flattenUnion(schema: z.ZodTypeAny): z.ZodObject<any>[] {
  if (schema instanceof z.ZodObject) {
    return [schema];
  }
  if (schema instanceof z.ZodUnion) {
    return (schema.options as z.ZodTypeAny[]).flatMap(flattenUnion);
  }
  throw new Error(`strictAnd: tipo não suportado — ${schema.constructor.name}`);
}
