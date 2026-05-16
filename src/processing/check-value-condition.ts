import z from "zod";
import { PlainObject, Value } from "../models/common";
import {
  schema_if,
  UnitValueCondition,
  ValueConditionIf,
  ValueConditionIs,
  ValueConditionIsIn,
  ValueConditionIsNot,
  ValueConditionIsNotIn,
} from "../models/value-condition";
import { areObjectsEquals } from "../utils/are-objects-equals";
import { fail, isPlainObject, ValidationError } from "../validation/utils";
import { accessPathInObject } from "./path-access";
import { wrappedError } from "./wrap-error";

export function checkValueCondition(
  valueCondition: UnitValueCondition,
  object: PlainObject,
  fieldIdentifier: string,
): boolean {
  if ("_if" in valueCondition)
    return checkValueConditionIf(valueCondition, object);

  // Explicitar o campos _field que veio implícito
  if (!("_field" in valueCondition)) valueCondition._field = fieldIdentifier;

  if ("_is" in valueCondition)
    return checkValueConditionIs(valueCondition, object);

  if ("_isNot" in valueCondition)
    return checkValueConditionIsNot(valueCondition, object);

  if ("_isIn" in valueCondition)
    return checkValueConditionIsIn(valueCondition, object);

  if ("_isNotIn" in valueCondition)
    return checkValueConditionIsNotIn(valueCondition, object);

  return false;
}

function checkValueConditionIs(
  valueCondition: ValueConditionIs,
  object: PlainObject,
): boolean {
  if (!valueCondition._field) {
    throw new Error("Condição não especificada");
  }

  const value = accessPathInObject(valueCondition._field, object);
  const expectedValue = valueCondition._is;

  return areValuesEquals(value, expectedValue);
}

function checkValueConditionIsNot(
  valueCondition: ValueConditionIsNot,
  object: PlainObject,
): boolean {
  if (!valueCondition._field) {
    throw new Error("Campo _field não especificado");
  }

  const value = accessPathInObject(valueCondition._field, object);
  const expectedValue = valueCondition._isNot;

  return !areValuesEquals(value, expectedValue);
}

function checkValueConditionIsIn(
  valueCondition: ValueConditionIsIn,
  object: PlainObject,
): boolean {
  if (!valueCondition._field) {
    throw new Error("Campo _field não especificado");
  }

  const value = accessPathInObject(valueCondition._field, object);
  const expectedValues = valueCondition._isIn;

  return expectedValues.some((item) => areValuesEquals(value, item));
}

function checkValueConditionIsNotIn(
  valueCondition: ValueConditionIsNotIn,
  object: PlainObject,
): boolean {
  if (!valueCondition._field) {
    throw new Error("Campo _field não especificado");
  }

  const value = accessPathInObject(valueCondition._field, object);
  const expectedValues = valueCondition._isNotIn;

  return !expectedValues.some((item) => areValuesEquals(value, item));
}

function checkValueConditionIf(
  valueCondition: ValueConditionIf,
  object: PlainObject,
): boolean {
  const predicate = valueCondition._if;
  const safePredicate = schema_if.implement(predicate);

  try {
    return safePredicate(object);
  } catch (err) {
    throw wrapIfError(err);
  }
}

function wrapIfError(err: unknown) {
  if (err instanceof z.core.$ZodError) {
    const issue = err.issues[0];

    const message =
      issue.code === "invalid_type" && issue.path.length === 0
        ? `Função lambda _if retornou um tipo inválido:\n${issue.message}`
        : issue.message;

    throw new ValidationError(message);
  }

  return wrappedError(
    "Erro inesperado ao executar lambda passada em chave _if:",
    err,
  );
}

function areValuesEquals(a: Value, b: Value): boolean {
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (isPlainObject(a) && isPlainObject(b)) return areObjectsEquals(a, b);

  // cobre boolean, string e null
  return a === b;
}
