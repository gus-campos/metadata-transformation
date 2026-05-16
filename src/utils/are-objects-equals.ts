import { PlainObject } from "../models/common";
import { isPlainObject } from "../validation/utils";

export function areObjectsEquals(
  obj1: PlainObject | null,
  obj2: PlainObject | null,
) {
  if (obj1 === null || obj2 === null) return obj1 === obj2;

  const nonRecursiveObj1 = convertToNonRecursiveObject(obj1);
  const nonRecursiveObj2 = convertToNonRecursiveObject(obj2);

  const sortedObj1 = sortObjectKeys(nonRecursiveObj1);
  const sortedObj2 = sortObjectKeys(nonRecursiveObj2);

  return JSON.stringify(sortedObj1) === JSON.stringify(sortedObj2);
}

function sortObjectKeys(obj: PlainObject): PlainObject {
  
  /* 
  * Ordena recursivamente as chaves dentro do objeto
  * Ignora campos do sistema, já que podem mudar de forma inesperada
  */

  if (obj === null) return obj;

  return Object.keys(obj)
    .sort()
    .filter((key) => !key.startsWith("_"))
    .reduce((acc, key) => {
      const childObj = obj[key];
      if (isPlainObject(childObj)) return (acc[key] = sortObjectKeys(childObj));
      return acc;
    }, {} as PlainObject);
}

function convertToNonRecursiveObject(obj: PlainObject) {
  // CONTEXTUALIZAÇÃO: O stringify da sydle remove referências recursivas
  // que são comuns em objetos da Sydle
  // TODO: Melhor usar solução própria e testar no ONE se funciona

  return obj;
}
