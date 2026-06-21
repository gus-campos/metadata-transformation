import { InstanceObject, Value } from "../models/pure/common";
import { isPlainObject } from "./is-plain-object";
import isMatch from "lodash/isMatch";

export function valuesAreEqual(
    got: Value | InstanceObject | undefined,
    expected: Value | InstanceObject | undefined,
): boolean {
    if (got instanceof Date && expected instanceof Date)
        return got.getTime() === expected.getTime();

    // Compara objetos profundamente, mas só procura no got oq vem no expected
    if (isPlainObject(got) && isPlainObject(expected)) {
        return isMatch(
            normalizeInstanceClassIds(got),
            normalizeInstanceClassIds(expected),
        );
    }

    // Não faz diferenciação entre null e undefined
    return (got ?? null) === (expected ?? null);
}

function normalizeInstanceClassIds(instance: InstanceObject): InstanceObject {
    const classId = instance._classId ?? instance._class?._id;

    return {
        ...instance,

        // Só cria chaves se tiver o valor para ela
        ...(classId && {
            _classId: classId,
            _class: {
                ...instance._class,
                _id: classId,
            },
        }),
    };
}
