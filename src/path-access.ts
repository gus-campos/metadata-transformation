import { InstanceObject, Value } from "./models/common";

export function accessPathInObject(path: string, object: InstanceObject) {
  const pathArray = path.split(".");
  const value = accessSequenceKeysInObject(pathArray, object);

  // TODO: Imprimir objeto?
  if (value === undefined)
    throw Error(`O caminho ${path} não foi encontrado no objeto.`);

  return value;
}

function accessSequenceKeysInObject(
  pathArray: string[],
  object: InstanceObject,
): Value | undefined {
  /*
   * Lê recursivamente, uma sequência de chaves de um objeto,
   * usando acessos condicionais.
   *
   * Exemplo:
   * Para um pathArry `["chave1", "chave2", "chave3"]`
   * Lê `object?.["chave1"]?.["chave2"]?.["chave3"]`
   */

  const [firstKey, ...pathRest] = pathArray;

  const result = object?.[firstKey];

  // Caminho não encontrado
  if (result === undefined) return undefined;

  // Fim do path
  if (pathRest.length === 0) return result;

  // Se ainda tem chave pra ler, tem que ser um objeto
  // Se não for, o path foi inválido
  // Obs: Array está incluso no tipo "object"
  if (typeof result !== "object" || result instanceof Date || result === null)
    return undefined;

  return accessSequenceKeysInObject(pathRest, result);
}
