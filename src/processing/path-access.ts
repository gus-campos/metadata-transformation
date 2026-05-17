import { PlainObject, Value } from "../models/common";


export function accessPathInObject(path: string, object: PlainObject) {

  /*
  * Acessa um caminho separado por pontos em um objeto que possui
  * sucessivos objetos como valor.
  * 
  * Ex:
  * 
  * accessPathInObject("data.person.name.firstName", {
  *   data: {
  *      person: {
  *         name: {
  *           firstName: "Pedro"
  *         } 
  *      }
  *   }
  * })
  * 
  * Retorna: "Pedro"
  */

  const pathArray = path.split(".");
  return accessSequenceKeysInObject(pathArray, object);
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
   * 
   * accessSequenceKeysInObject(["chave1", "chave2", "chave3"], object)
   * 
   * Retorna : object?.["chave1"]?.["chave2"]?.["chave3"]
   * 
   * Ou seja, se o caminho não for encontrado, "undefined" é retornado.
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
