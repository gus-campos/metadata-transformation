import { DraftConfig } from "../models/draft-config";
import { ConditionalValueSet } from "../models/draft-transform";
import { assertValue } from "./common";
import { assertUnitDraftCondition } from "./draft-condition";
import { fail, isPlainObject } from "./utils";

export function assertDraftConfig(
  candidate: unknown,
): candidate is DraftConfig {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: DraftConfig\n  Formato: { setValue: Value }`,
      candidate,
    );
  }

  if (!("setValue" in candidate)) {
    return fail(`DraftConfig: campo 'setValue' é obrigatório`, candidate);
  }

  assertValue(candidate.setValue);
  return true;
}

export function assertConditionalValueSet(
  candidate: unknown,
): candidate is ConditionalValueSet {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ConditionalValueSet\n  Formato: UnitDraftCondition & { setValue: Value }`,
      candidate,
    );
  }

  assertUnitDraftCondition(candidate);
  assertDraftConfig(candidate);
  return true;
}