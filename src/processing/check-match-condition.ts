import { InstanceObject } from "../models/pure/common";
import {
    Match,
    ValueCheck,
    AnyOf,
    AllOf,
    ALL_OF_KEY,
    ANY_OF_KEY,
    NOT_KEY,
    SOME_KEY,
    MATCH_CONDITION_KEYS,
    MATCH_KEY,
} from "../models/pure/instance-condition";
import { accessPathInObject } from "../utils/path-access";
import { valuesAreEqual } from "../utils/values-are-equal";

export function checkMatch(
    instance: InstanceObject,
    matchCondition: Match,
): boolean {
    return checkMatchHelper(instance, matchCondition, "every");
}

// TODO: Verificar se diferencia bem quando passar um objeto como valor para comparar com o 
// objeto do campo e quando passa um objeto com not dentro
function checkMatchHelper(
    instance: InstanceObject,
    matchCondition: Match,
    mode: "every" | "some",
): boolean {
    const evaluationOfAllConditions = Object.entries(matchCondition).map(
        ([key, content]) => {
            if (key === MATCH_KEY) {
                const matchCondition = content as Match;
                return checkMatchHelper(
                    instance,
                    matchCondition,
                    "every",
                );
            }

            if (key === NOT_KEY) {
                const notCondition = content as Match;
                return !checkMatchHelper(
                    instance,
                    notCondition,
                    "every",
                );
            }

            if (key === SOME_KEY) {
                const someCondition = content as Match;
                return checkMatchHelper(
                    instance,
                    someCondition,
                    "some",
                );
            }

            const path = key as string;
            const valueExpected = content as ValueCheck;

            // TODO: Passar para o validador?
            if (MATCH_CONDITION_KEYS.some((key) => key in valueExpected))
                throw new Error(
                    "Chaves not e some só podem ser usadas dentro de 'match', ou outros not's e some's",
                );

            return checkFieldValue(instance, path, valueExpected);
        },
    );

    if (mode === "every") {
        return evaluationOfAllConditions.every(Boolean);
    }

    return evaluationOfAllConditions.some(Boolean);
}

function checkFieldValue(
    instance: InstanceObject,
    pathToField: string,
    fieldMatchExpect: ValueCheck,
): boolean {
    const valueGot = accessPathInObject(instance, pathToField);
    if (valueGot === undefined) return false;

    // Isso permite tratar da mesma forma para valor único e para valor múltiplo
    const arrayGot = Array.isArray(valueGot) ? valueGot : [valueGot];

    if (ANY_OF_KEY in fieldMatchExpect) {
        const { _anyOf } = fieldMatchExpect as AnyOf;

        // Sem condição, é sempre verdadeiro
        if (_anyOf.length === 0) return true;

        return _anyOf.some((expected) =>
            arrayGot.some((got) => valuesAreEqual(got, expected)),
        );
    }

    if (ALL_OF_KEY in fieldMatchExpect) {
        const { _allOf } = fieldMatchExpect as AllOf;

        // Sem condição, é sempre verdadeiro
        if (_allOf.length === 0) return true;

        return _allOf.every((expected) =>
            arrayGot.some((got) => valuesAreEqual(got, expected)),
        );
    }

    throw new Error("Tipo de chave não tratada");
}
