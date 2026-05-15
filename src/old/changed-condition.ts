import { UnitChangedCondition } from "../models/changed-condition";
import { CHANGED_CONDITION_KEYS, ChangedConditionKey } from "./constants";
import { fail, isPlainObject, serialize, ValidationError } from "./utils";

export function assertUnitChangedCondition(
  candidate: unknown,
): candidate is UnitChangedCondition {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: UnitChangedCondition — objeto com uma das chaves:\n  ${CHANGED_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  const present = CHANGED_CONDITION_KEYS.filter((k) => k in candidate);

  if (present.length === 0) {
    return fail(
      `UnitChangedCondition: nenhuma chave de condição encontrada\n` +
        `  Esperado uma de: ${CHANGED_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  if (present.length > 1) {
    return fail(
      `UnitChangedCondition: apenas uma chave de condição por vez\n` +
        `  Encontradas: ${present.join(", ")}`,
      candidate,
    );
  }

  const key = present[0] as ChangedConditionKey;

  if (key === "_fieldChanged" && typeof candidate._fieldChanged !== "string") {
    return fail(
      `UnitChangedCondition: '_fieldChanged' deve ser string`,
      candidate._fieldChanged,
    );
  }

  if (key === "_someFieldChanged") {
    if (!Array.isArray(candidate._someFieldChanged)) {
      return fail(
        `UnitChangedCondition: '_someFieldChanged' deve ser um array de strings`,
        candidate._someFieldChanged,
      );
    }
    for (const [i, f] of (candidate._someFieldChanged as unknown[]).entries()) {
      if (typeof f !== "string") {
        throw new ValidationError(
          `UnitChangedCondition._someFieldChanged[${i}]: esperado string\n  Recebido: ${serialize(f)}`,
        );
      }
    }
  }

  if (key === "_if" && typeof candidate._if !== "function") {
    return fail(
      `UnitChangedCondition: '_if' deve ser uma função\n  Assinatura: (oldObj: InstanceObject, newObj: InstanceObject) => boolean`,
      candidate._if,
    );
  }

  return true;
}