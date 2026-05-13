import { InstanceObject, Value } from "./models/common";
import {
  UnitValueCondition,
  ValueConditionAre,
  ValueConditionIf,
  ValueConditionIs,
  ValueConditionIsIn,
  ValueConditionIsNot,
  ValueConditionIsNotIn,
  ValueConditionSomeIs,
} from "./models/value-condition";
import { accessPathInObject } from "./path-access";
import { areObjectsEquals } from "./utils/are-objects-equals";
import { isPlainObject } from "./utils/extra";

export function checkValueCondition(
  valueCondition: UnitValueCondition,
  object: InstanceObject,
): boolean {
  if ("_is" in valueCondition)
    return checkValueConditionIs(valueCondition, object);

  if ("_isNot" in valueCondition)
    return checkValueConditionIsNot(valueCondition, object);

  if ("_isIn" in valueCondition)
    return checkValueConditionIsIn(valueCondition, object);

  if ("_isNotIn" in valueCondition)
    return checkValueConditionIsNotIn(valueCondition, object);

  if ("_are" in valueCondition)
    return checkValueConditionAre(valueCondition, object);

  if ("_someIs" in valueCondition)
    return checkValueConditionSomeIs(valueCondition, object);

  if ("_if" in valueCondition)
    return checkValueConditionIf(valueCondition, object);

  return false;
}

function checkValueConditionIs(
  valueCondition: ValueConditionIs,
  object: InstanceObject,
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
  object: InstanceObject,
): boolean {
  if (!valueCondition._field) throw new Error("Condição não especificada");

  const value = accessPathInObject(valueCondition._field, object);
  const expectedValue = valueCondition._isNot;

  return !areValuesEquals(value, expectedValue);
}

function checkValueConditionIsIn(
  valueCondition: ValueConditionIsIn,
  object: InstanceObject,
): boolean {
  if (!valueCondition._field) throw new Error("Condição não especificada");

  const value = accessPathInObject(valueCondition._field, object);
  const expectedValues = valueCondition._isIn;

  return expectedValues.some((item) => areValuesEquals(value, item));
}

function checkValueConditionIsNotIn(
  valueCondition: ValueConditionIsNotIn,
  object: InstanceObject,
): boolean {
  if (!valueCondition._field) throw new Error("Condição não especificada");

  const value = accessPathInObject(valueCondition._field, object);
  const expectedValues = valueCondition._isNotIn;

  return !expectedValues.some((item) => areValuesEquals(value, item));
}

function checkValueConditionAre(
  valueCondition: ValueConditionAre,
  object: InstanceObject,
): boolean {
  const expectedValues = valueCondition._are;

  if (valueCondition._fields.length !== expectedValues.length) return false;

  return valueCondition._fields.every((field, index) => {
    const value = accessPathInObject(field, object);
    const expectedValue = expectedValues[index];

    return areValuesEquals(value, expectedValue);
  });
}

function checkValueConditionSomeIs(
  valueCondition: ValueConditionSomeIs,
  object: InstanceObject,
): boolean {
  const expectedValue = valueCondition._someIs;

  return valueCondition._fields.some((field) => {
    const value = accessPathInObject(field, object);
    return areValuesEquals(value, expectedValue);
  });
}

function checkValueConditionIf(
  valueCondition: ValueConditionIf,
  object: InstanceObject,
): boolean {
  const predicate = valueCondition._if;
  return predicate(object);
}

export function areValuesEquals(a: Value, b: Value): boolean {
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (isPlainObject(a) && isPlainObject(b)) return areObjectsEquals(a, b);

  // cobre boolean, string e null
  return a === b;
}
