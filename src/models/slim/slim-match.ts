import {
    ValueCheck,
    MATCH_CONDITION_KEYS,
    MATCH_EXPECT_KEYS,
    Match,
    ValueExpected,
} from "../pure/instance-condition";
import { InstanceObject, Value } from "../pure/common";
import { isPlainObject } from "../../utils/is-plain-object";

// Pode receber uma checagem explícita ou resumida
export type SlimValueCheck = ValueCheck | ValueExpected | ValueExpected[];

// Para comparações implícitas do próprio campo, não permite passagem de objeto
type ImplicitExpected = Value | Value[];

type SlimMatchNode = {
    _not?: SlimMatch | ImplicitExpected;
    _some?: SlimMatch | ImplicitExpected;
    _match?: SlimMatch | ImplicitExpected;

    // Usado internamente para conditions
    // TODO: Implementar lógica
    __conditionsMatches: SlimMatch[];

    [identifier: string]:
        | SlimValueCheck
        // Na prática não devem ser aceitos:
        | undefined
        | SlimMatch
        | SlimMatch[];
};

export type SlimMatch = SlimMatchNode | ImplicitExpected;

// =================================================================================================

// Também aceita SlimMatch (pois é um superset)
export function toMatch(
    slimImplicitMatch: SlimMatch,
    fieldIdentifier: string | null = null,
): Match {
    // Se for valor esperado (campo implícito)
    if (!isPlainObject(slimImplicitMatch)) {
        if (!fieldIdentifier) {
            throw new Error(
                "Deve ser passado fieldIdentifier quando houver campo implícito",
            );
        }
        return toMatchFromImplicitExpected(slimImplicitMatch, fieldIdentifier);
    }

    return toMatchFromImplicitMatchNode(slimImplicitMatch, fieldIdentifier);
}

function toMatchFromImplicitMatchNode(
    implicitMatchNode: SlimMatchNode,
    currentFieldIdentifier: string | null = null,
): Match {
    /*
     * Processa recursivamente os nós do objeto match, até chegar em um ponto
     * onde invés de ter um objeto de comparação entre campos e valore, há na
     * verdade apenas uma valor. Nesses casos assume que a comparação pretendida
     * era implicitamente uma comparação entre o valor do campo atual, e o valor
     * passado. E então torna explícita essa comparação.
     */

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(implicitMatchNode)) {
        if ((MATCH_CONDITION_KEYS as string[]).includes(key)) {
            // Encontrado um objeto de comparação atalhado, tratar recursivamente
            if (isPlainObject(value)) {
                result[key] = toMatchFromImplicitMatchNode(
                    value as SlimMatchNode,
                    currentFieldIdentifier,
                );
            }

            // Encontrado um valor, invés de um objeto de comparação implícito,
            // esse caso é tratado como uma comparação implícita com o campo atual
            else if (currentFieldIdentifier) {
                result[key] = toMatchFromImplicitExpected(
                    value as ImplicitExpected,
                    currentFieldIdentifier,
                );
            } else {
                throw new Error(
                    "Deve ser passado fieldIdentifier quando houver campo implícito",
                );
            }
        } else {
            result[key] = toValueCheck(value as SlimValueCheck);
        }
    }

    return result as Match;
}

function toValueCheck(slimValueCheck: SlimValueCheck): ValueCheck {
    /*
     * Converte um ValueCheck atalhado que trás apenas valores diretamente
     * para a estrutura padrão que traz um objeto com anyOf
     */

    if (isPlainObject(slimValueCheck)) {
        // Se já está na forma do ValueCheck, retornar assim
        if (MATCH_EXPECT_KEYS.some((key) => key in slimValueCheck))
            return { ...slimValueCheck } as ValueCheck;

        // Se não, considerar que é uma comparação com um objeto num array unitário
        return { _anyOf: [{ ...slimValueCheck } as InstanceObject] };
    }

    // Considerar que é uma comparação com um valor
    const expectArray = Array.isArray(slimValueCheck)
        ? slimValueCheck
        : [slimValueCheck];

    return { _anyOf: expectArray };
}

function toMatchFromImplicitExpected(
    implicitExpected: ImplicitExpected,
    fieldIdentifier: string,
): Match {
    const expectArray = Array.isArray(implicitExpected)
        ? implicitExpected
        : [implicitExpected];

    return {
        [fieldIdentifier]: { _anyOf: expectArray },
    };
}

// TODO: Implementar condition dentro do match

// function getFieldConditionsMatches(
//     fieldTransform: SlimFieldMetadataTransform,
//     conditions: Conditions | null,
// ): Match[] | null {
//     const conditionsNames = toArray(fieldTransform._condition ?? []);
//     if (conditionsNames.length === 0) return null;

//     if (!conditions)
//         throw new Error("Não foi definida nenhuma condição");

//     const namesNotDefined = !conditions
//         ? conditionsNames
//         : conditionsNames.filter((name) => !(name in conditions));

//     if (namesNotDefined.length > 0) {
//         throw new Error(
//             `As seguintes condições não foram definidas: ${namesNotDefined.join(", ")}`,
//         );
//     }

//     return conditionsNames.map((conditionName) => {
//         const slimMatch = conditions![conditionName]!;
//         return toMatch(slimMatch);
//     });
// }
