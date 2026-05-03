import { dependantToExclusiveKeys, exclusiveKeys } from "./constants.js";

export function areConditionsMet(conditionalChange, object) {
  const keys = Object.keys(conditionalChange);

  const exclusiveKey = keys.find((key) => exclusiveKeys.includes(key));

  switch (exclusiveKey) {
    case "_field":
      return evaluateFieldCondition(conditionalChange, object);

    case "_fields":
      return evaluateFieldsCondition(conditionalChange, object);

    case "_if":
      return evaluateIfCondition(conditionalChange, object);
  }
}

function evaluateFieldsCondition(conditionalChange, object) {
  const keys = Object.keys(conditionalChange);
  const dependantKey = keys.find((key) =>
    dependantToExclusiveKeys._fields.includes(key),
  );

  const fieldsValuesInObject = conditionalChange._fields.map(
    (fieldKey) => object[fieldKey],
  );

  switch (dependantKey) {
    case "_are":
      const expectedValues = conditionalChange._are;
      return fieldsValuesInObject.every(
        (value, index) => value === expectedValues[index],
      );

    case "_someIs":
      const expectedValue = conditionalChange._someIs;
      return fieldsValuesInObject.some((value) => value === expectedValue);
  }
}

function evaluateFieldCondition(conditionalChange, object) {
  const keys = Object.keys(conditionalChange);
  const dependantKey = keys.find((key) =>
    dependantToExclusiveKeys._field.includes(key),
  );

  const fieldValueInObject = object[conditionalChange._field];

  switch (dependantKey) {
    case "_is":
      const valueExpected = conditionalChange._is;
      return valueExpected === fieldValueInObject;

    case "_isNot":
      const valueNotExpected = conditionalChange._isNot;
      return valueNotExpected !== fieldValueInObject;

    case "_isIn":
      const acceptedValues = conditionalChange._isIn;
      return acceptedValues.includes(fieldValueInObject);
  }
}

function evaluateIfCondition(conditionalChange, object) {
  const checkIfRuleIsValid = conditionalChange._if;
  const predicateEvaluation = checkIfRuleIsValid(object);
  return !!predicateEvaluation; // força boolean
}
