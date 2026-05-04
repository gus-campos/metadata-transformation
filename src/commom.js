export function getPathValueFromObject(pathArray, valueOrObject) {
  /* Presume identificadores válidos */

  const [firstKey, ...pathRest] = pathArray;

  // Fim da leitura
  if (firstKey === undefined) return valueOrObject;

  // Path inválido
  if (firstKey === "") return undefined;

  // Leitura
  const result = valueOrObject[firstKey];

  if (result === undefined) return undefined;

  // Próximas camadas
  return getPathValueFromObject(pathRest, result);
}
