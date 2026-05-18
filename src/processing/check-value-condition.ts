import z from "zod";
import { PlainObject, Value } from "../models/common";
import {
  schema_valueConditionIfPredicate,
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

// FIXME: Mudar tratativa de caminho inexistente?

export function checkValueCondition(
  valueCondition: UnitValueCondition,
  object: PlainObject,
  fieldIdentifier?: string,
): boolean {
  if ("_if" in valueCondition)
    return checkValueConditionIf(valueCondition, object);

  // Explicitar o campo _valueOf que estava implícito
  if (!("_valueOf" in valueCondition)) {
    if (!fieldIdentifier) {
      throw new Error(
        "O campo _valueOf está implícito, mas não foi passado um fieldIdentifier",
      );
    }
    valueCondition._valueOf = fieldIdentifier;
  }

  if ("_is" in valueCondition)
    return checkValueConditionIs(valueCondition, object);

  if ("_isNot" in valueCondition)
    return checkValueConditionIsNot(valueCondition, object);

  if ("_in" in valueCondition)
    return checkValueConditionIsIn(valueCondition, object);

  if ("_notIn" in valueCondition)
    return checkValueConditionIsNotIn(valueCondition, object);

  return false;
}

function checkValueConditionIs(
  valueCondition: ValueConditionIs,
  object: PlainObject,
): boolean {
  if (!valueCondition._valueOf) {
    throw new Error("Condição não especificada");
  }

  const path = valueCondition._valueOf;
  const value = accessPathInObject(path, object);
  const expectedValue = valueCondition._is;

  if (value === undefined)
    fail(`Caminho passado "${path}" não foi encontrado no objeto`, object);

  return areValuesEquals(value, expectedValue);
}

function checkValueConditionIsNot(
  valueCondition: ValueConditionIsNot,
  object: PlainObject,
): boolean {
  if (!valueCondition._valueOf) {
    throw new Error("Campo _valueOf não especificado");
  }

  const path = valueCondition._valueOf;
  const value = accessPathInObject(path, object);
  const expectedValue = valueCondition._isNot;

  if (value === undefined)
    fail(`Caminho passado "${path}" não foi encontrado no objeto`, object);

  return !areValuesEquals(value, expectedValue);
}

function checkValueConditionIsIn(
  valueCondition: ValueConditionIsIn,
  object: PlainObject,
): boolean {
  if (!valueCondition._valueOf) {
    throw new Error("Campo _valueOf não especificado");
  }

  const path = valueCondition._valueOf;
  const value = accessPathInObject(path, object);
  const expectedValues = valueCondition._in;

  if (value === undefined)
    fail(`Caminho passado "${path}" não foi encontrado no objeto`, object);

  return expectedValues.some((item) => areValuesEquals(value, item));
}

function checkValueConditionIsNotIn(
  valueCondition: ValueConditionIsNotIn,
  object: PlainObject,
): boolean {
  if (!valueCondition._valueOf) {
    throw new Error("Campo _valueOf não especificado");
  }

  const path = valueCondition._valueOf;
  const value = accessPathInObject(path, object);

  if (value === undefined)
    fail(`Caminho passado "${path}" não foi encontrado no objeto`, object);

  const expectedValues = valueCondition._notIn;

  return !expectedValues.some((item) => areValuesEquals(value, item));
}

function checkValueConditionIf(
  valueCondition: ValueConditionIf,
  object: PlainObject,
): boolean {
  const predicate = valueCondition._if;
  const safePredicate = schema_valueConditionIfPredicate.implement(predicate);

  try {
    return safePredicate(object);
  } catch (err) {
    throw wrapIfError(err);
  }
}

function wrapIfError(err: unknown) {
  if (err instanceof z.core.$ZodError) {
    const issue = err.issues[0];

    if (issue.code === "invalid_type" && issue.path.length === 0) {
      const message = `Função lambda _if retornou um tipo inválido:\n${issue.message}`;
      return new ValidationError(message);
    }
  }

  return wrappedError(
    "Erro inesperado ao executar lambda passada em chave _if",
    err,
  );
}

export function areValuesEquals(a: Value, b: Value): boolean {
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (isPlainObject(a) && isPlainObject(b)) {
    return areObjectsEquals(a, b);
  }

  // cobre boolean, string e null
  return a === b;
}
