import { Value } from "../models/metadata-transform";

export function getPathValueFromObject(
  pathArray: string[],
  object: Record<string, Value>,
): Value | undefined {
  const [firstKey, ...pathRest] = pathArray;

  // Path vazio ou inválido
  if (!firstKey) return undefined;

  const result = object[firstKey];

  if (result === undefined) return undefined;

  // Fim do path
  if (pathRest.length === 0) return result;

  // Próxima camada só é possível se result for um objeto simples
  if (
    typeof result !== "object" ||
    result === null ||
    Array.isArray(result) ||
    result instanceof Date
  ) {
    return undefined;
  }

  return getPathValueFromObject(pathRest, result);
}