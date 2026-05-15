import { DraftTransform, FieldDraftTransform } from "../models/draft-transform";
import { CHANGED_CONDITION_KEYS, VALUE_CONDITION_KEYS } from "./constants";
import { assertConditionalValueSet, assertDraftConfig } from "./draft-config";
import { fail, isPlainObject, ValidationError } from "./utils";

export function assertFieldDraftTransform(
  candidate: unknown,
): candidate is FieldDraftTransform {
  if (Array.isArray(candidate)) {
    for (const [i, item] of candidate.entries()) {
      try {
        assertConditionalValueSet(item);
      } catch (e) {
        throw new ValidationError(
          `FieldDraftTransform[${i}]: ${(e as Error).message}`,
        );
      }
    }
    return true;
  }

  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: FieldDraftTransform\n` +
        `  { setValue }                  → valor fixo\n` +
        `  { <condição>, setValue }       → valor condicional\n` +
        `  [{ <condição>, setValue }, …]  → lista de condicionais`,
      candidate,
    );
  }

  const allConditionKeys = [
    ...VALUE_CONDITION_KEYS,
    ...CHANGED_CONDITION_KEYS,
  ] as const;
  const hasCondition = allConditionKeys.some((k) => k in candidate);
  const hasSetValue = "setValue" in candidate;

  if (!hasCondition && !hasSetValue) {
    return fail(
      `FieldDraftTransform: deve conter 'setValue' (valor fixo) ou uma chave de condição + 'setValue'`,
      candidate,
    );
  }

  if (hasCondition && !hasSetValue) {
    return fail(
      `FieldDraftTransform: 'setValue' é obrigatório quando uma condição está presente`,
      candidate,
    );
  }

  if (hasCondition) return assertConditionalValueSet(candidate);
  return assertDraftConfig(candidate);
}

export function assertDraftTransform(
  candidate: unknown,
): candidate is DraftTransform {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: DraftTransform\n  Formato: Record<string, FieldDraftTransform>`,
      candidate,
    );
  }

  for (const [key, val] of Object.entries(candidate)) {
    try {
      assertFieldDraftTransform(val);
    } catch (e) {
      throw new ValidationError(
        `DraftTransform['${key}']: ${(e as Error).message}`,
      );
    }
  }

  return true;
}