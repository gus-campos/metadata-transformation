import { FieldId, FieldsIds, UnitValueCondition, ValueConditionAre, ValueConditionIf, ValueConditionIs, ValueConditionIsIn, ValueConditionIsNot, ValueConditionIsNotIn, ValueConditionSomeIs } from "../models/value-condition";
import { assertValue } from "./common";
import { VALUE_CONDITION_KEYS, ValueConditionKey } from "./constants";
import { fail, isPlainObject, serialize, ValidationError } from "./utils";

export function assertFieldId(candidate: unknown): candidate is FieldId {
  if (!isPlainObject(candidate)) {
    return fail(`Esperado: FieldId\n  Formato: { _field?: string }`, candidate);
  }

  if ("_field" in candidate && typeof candidate._field !== "string") {
    return fail(`FieldId: '_field' deve ser string`, candidate._field);
  }

  return true;
}

export function assertFieldsIds(candidate: unknown): candidate is FieldsIds {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: FieldsIds\n  Formato: { _fields: string[] }`,
      candidate,
    );
  }

  if (!Array.isArray(candidate._fields)) {
    return fail(
      `FieldsIds: '_fields' deve ser um array de strings`,
      candidate._fields,
    );
  }

  for (const [i, f] of (candidate._fields as unknown[]).entries()) {
    if (typeof f !== "string") {
      throw new ValidationError(
        `FieldsIds._fields[${i}]: esperado string\n  Recebido: ${serialize(f)}`,
      );
    }
  }

  return true;
}

// ─── Value Conditions ─────────────────────────────────────────────────────────

export function assertValueConditionIs(
  candidate: unknown,
): candidate is ValueConditionIs {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIs\n  Formato: { _field?: string; _is: Value }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!("_is" in candidate)) {
    return fail(`ValueConditionIs: campo '_is' é obrigatório`, candidate);
  }

  assertValue(candidate._is);
  return true;
}

export function assertValueConditionIsNot(
  candidate: unknown,
): candidate is ValueConditionIsNot {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIsNot\n  Formato: { _field?: string; _isNot: Value }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!("_isNot" in candidate)) {
    return fail(`ValueConditionIsNot: campo '_isNot' é obrigatório`, candidate);
  }

  assertValue(candidate._isNot);
  return true;
}

export function assertValueConditionIsIn(
  candidate: unknown,
): candidate is ValueConditionIsIn {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIsIn\n  Formato: { _field?: string; _isIn: Value[] }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!Array.isArray(candidate._isIn)) {
    return fail(
      `ValueConditionIsIn: '_isIn' deve ser um array`,
      candidate._isIn,
    );
  }

  for (const [i, v] of candidate._isIn.entries()) {
    try {
      assertValue(v);
    } catch (e) {
      throw new ValidationError(
        `ValueConditionIsIn._isIn[${i}]: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

export function assertValueConditionIsNotIn(
  candidate: unknown,
): candidate is ValueConditionIsNotIn {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIsNotIn\n  Formato: { _field?: string; _isNotIn: Value[] }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!Array.isArray(candidate._isNotIn)) {
    return fail(
      `ValueConditionIsNotIn: '_isNotIn' deve ser um array`,
      candidate._isNotIn,
    );
  }

  for (const [i, v] of candidate._isNotIn.entries()) {
    try {
      assertValue(v);
    } catch (e) {
      throw new ValidationError(
        `ValueConditionIsNotIn._isNotIn[${i}]: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

export function assertValueConditionAre(
  candidate: unknown,
): candidate is ValueConditionAre {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionAre\n  Formato: { _fields: string[]; _are: Value[] }`,
      candidate,
    );
  }

  assertFieldsIds(candidate);

  if (!Array.isArray(candidate._are)) {
    return fail(`ValueConditionAre: '_are' deve ser um array`, candidate._are);
  }

  const fields = candidate._fields as string[];
  if (candidate._are.length !== fields.length) {
    return fail(
      `ValueConditionAre: '_are' deve ter o mesmo número de elementos que '_fields'\n` +
        `  _fields.length: ${fields.length}\n` +
        `  _are.length:    ${candidate._are.length}`,
      candidate._are,
    );
  }

  for (const [i, v] of candidate._are.entries()) {
    try {
      assertValue(v);
    } catch (e) {
      throw new ValidationError(
        `ValueConditionAre._are[${i}]: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

export function assertValueConditionSomeIs(
  candidate: unknown,
): candidate is ValueConditionSomeIs {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionSomeIs\n  Formato: { _fields: string[]; _someIs: Value }`,
      candidate,
    );
  }

  assertFieldsIds(candidate);

  if (!("_someIs" in candidate)) {
    return fail(
      `ValueConditionSomeIs: campo '_someIs' é obrigatório`,
      candidate,
    );
  }

  assertValue(candidate._someIs);
  return true;
}

export function assertValueConditionIf(
  candidate: unknown,
): candidate is ValueConditionIf {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIf\n  Formato: { _if: (obj: InstanceObject) => boolean }`,
      candidate,
    );
  }

  if (typeof candidate._if !== "function") {
    return fail(
      `ValueConditionIf: '_if' deve ser uma função\n  Assinatura: (obj: InstanceObject) => boolean`,
      candidate._if,
    );
  }

  return true;
}

const assertByValueConditionKey: Record<
  ValueConditionKey,
  (c: unknown) => c is UnitValueCondition
> = {
  _is: assertValueConditionIs as (c: unknown) => c is UnitValueCondition,
  _isNot: assertValueConditionIsNot as (c: unknown) => c is UnitValueCondition,
  _isIn: assertValueConditionIsIn as (c: unknown) => c is UnitValueCondition,
  _isNotIn: assertValueConditionIsNotIn as (
    c: unknown,
  ) => c is UnitValueCondition,
  _are: assertValueConditionAre as (c: unknown) => c is UnitValueCondition,
  _someIs: assertValueConditionSomeIs as (
    c: unknown,
  ) => c is UnitValueCondition,
  _if: assertValueConditionIf as (c: unknown) => c is UnitValueCondition,
};

export function assertUnitValueCondition(
  candidate: unknown,
): candidate is UnitValueCondition {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: UnitValueCondition — objeto com exatamente uma das chaves:\n  ${VALUE_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  const present = VALUE_CONDITION_KEYS.filter((k) => k in candidate);

  if (present.length === 0) {
    return fail(
      `UnitValueCondition: nenhuma chave de condição encontrada\n` +
        `  Esperado uma de: ${VALUE_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  if (present.length > 1) {
    return fail(
      `UnitValueCondition: apenas uma chave de condição por vez\n` +
        `  Encontradas: ${present.join(", ")}`,
      candidate,
    );
  }

  const valueConditionKey = present[0] as ValueConditionKey;
  const assertConditionValue = assertByValueConditionKey[valueConditionKey];
  return assertConditionValue(candidate);
}
