import { PlainObject, Value } from "../models/common";
import { fail } from "../validation/utils";


export function accessPathInObject(path: string, object: PlainObject) {
  const pathArray = path.split(".");
  const value = accessSequenceKeysInObject(pathArray, object);

  if (value === undefined)
    fail(`O caminho ${path} não foi encontrado no objeto.`, object);

  return value;
}

function accessSequenceKeysInObject(
  pathArray: string[],
  object: PlainObject,
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
