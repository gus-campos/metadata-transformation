import { UnitDraftCondition } from "../models/draft-condition";
import { assertUnitChangedCondition } from "./changed-condition";
import { CHANGED_CONDITION_KEYS, VALUE_CONDITION_KEYS } from "./constants";
import { fail, isPlainObject } from "./utils";
import { assertUnitValueCondition } from "./value-condition";

export function assertUnitDraftCondition(
  candidate: unknown,
): candidate is UnitDraftCondition {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: UnitDraftCondition (UnitValueCondition | UnitChangedCondition)`,
      candidate,
    );
  }

  const exclusiveValueKeys = VALUE_CONDITION_KEYS.filter(
    (k) => k !== "_if" && k in candidate,
  );
  const exclusiveChangedKeys = CHANGED_CONDITION_KEYS.filter(
    (k) => k !== "_if" && k in candidate,
  );
  const hasIf = "_if" in candidate;
   
  if (exclusiveValueKeys.length > 0 && exclusiveChangedKeys.length > 0) {
    return fail(
      `UnitDraftCondition: não é possível combinar condições de valor com condições de alteração\n` +
        `  Condições de valor encontradas:     ${exclusiveValueKeys.join(", ")}\n` +
        `  Condições de alteração encontradas: ${exclusiveChangedKeys.join(", ")}`,
      candidate,
    );
  }

  if (!exclusiveValueKeys.length && !exclusiveChangedKeys.length && !hasIf) {
    return fail(
      `UnitDraftCondition: nenhuma chave de condição encontrada\n` +
        `  Condições de valor:     ${VALUE_CONDITION_KEYS.join(", ")}\n` +
        `  Condições de alteração: ${CHANGED_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  if (exclusiveChangedKeys.length > 0)
    return assertUnitChangedCondition(candidate);
  return assertUnitValueCondition(candidate);
}
