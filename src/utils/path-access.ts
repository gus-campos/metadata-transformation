
import { InstanceObject, Value } from "../models/pure/common";
import { isPlainObject } from "./is-plain-object";

export function accessPathInObject(object: InstanceObject, path: string) {

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
  return accessSequenceKeysInObject(object, pathArray);
}

function accessSequenceKeysInObject(
  object: InstanceObject,
  pathArray: string[],
): Value | Value[] | InstanceObject | undefined {
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

  // Caminho não encontrado
  if (!firstKey) return undefined;

  const result = object[firstKey];

  // Caminho não encontrado
  if (result === undefined) return undefined;

  // Fim do path
  if (pathRest.length === 0) return result;

  // Se ainda tem chave pra ler, tem que ser um objeto
  // Se não for, o path foi inválido
  
  if (!isPlainObject(result))
    return undefined;

  return accessSequenceKeysInObject(result, pathRest);
}