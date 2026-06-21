import { InstanceObject, InstanceValue, Value } from "../models/pure/common";
import { isPlainObject } from "./is-plain-object";

export function accessPathInObject(
    object: InstanceObject,
    path: string,
): InstanceValue | undefined {
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
     *
     * Se não encontrar o caminho, retorna undefined.
     */

    const pathArray = path.split(".");
    return accessSequenceKeysInObject(object, pathArray);
}

function accessSequenceKeysInObject(
    object: InstanceObject | InstanceObject[],
    pathArray: string[],
): InstanceValue | undefined {
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

    // Se for um array
    if (Array.isArray(object))
        return accessPathInInstanceArray(object, pathArray);

    const result = object[firstKey];

    // Caminho não encontrado
    if (result === undefined) return undefined;

    // Fim do path
    if (pathRest.length === 0) return result;

    // Se ainda tem chave pra ler, tem que ser um objeto
    // Se não for, o path foi inválido

    if (
        isPlainObject(result) ||
        (Array.isArray(result) && result.every((item) => isPlainObject(item)))
    ) {
        return accessSequenceKeysInObject(result, pathRest);
    }

    return undefined;
}

function accessPathInInstanceArray(
    objects: InstanceObject[],
    pathArray: string[],
): Value[] | InstanceObject[] {
    const accessResults = objects
        .map((obj) => accessSequenceKeysInObject(obj, pathArray))
        .filter((obj) => obj !== undefined);

    const flattenResult = accessResults.reduce(
        (acc, item) => {
            if (Array.isArray(item)) {
                return [...acc, ...item];
            } else {
                return [...acc, item];
            }
        },
        [] as (Value | InstanceObject)[],
    );

    if (flattenResult.length === 0) return [];

    if (flattenResult.every((item) => isPlainObject(item)))
        return flattenResult;
    else if (flattenResult.every((item) => !isPlainObject(item)))
        return flattenResult as Value[];

    throw new Error("Array mistura itens array com itens não array");
}
