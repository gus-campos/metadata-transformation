import { dependantToExclusiveKeys, exclusiveKeys } from "./constants.js";

export function areConditionsMet(conditionalChange, object) {
  const keys = Object.keys(conditionalChange);

  const exclusiveKey = keys.find((key) => exclusiveKeys.includes(key));

  switch (exclusiveKey) {
    case "field":
      return evaluateFieldCondition(conditionalChange, object);

    case "fields":
      return evaluateFieldsCondition(conditionalChange, object);

    case "rule":
      return evaluateRuleCondition(conditionalChange, object);
  }
}

export function evaluateFieldsCondition(conditionalChange, object) {
  const keys = Object.keys(conditionalChange);
  const dependantKey = keys.find((key) =>
    dependantToExclusiveKeys.fields.includes(key),
  );

  const fieldsValuesInObject = conditionalChange.fields.map(
    (fieldKey) => object[fieldKey],
  );

  switch (dependantKey) {
    case "equalsPairwise":
      const expectedValues = conditionalChange.equalsPairwise;
      return fieldsValuesInObject.every(
        (value, index) => value === expectedValues[index],
      );

    case "someIsEqual":
      const expectedValue = conditionalChange.someIsEqual;
      return fieldsValuesInObject.some((value) => value === expectedValue);
  }
}

export function evaluateFieldCondition(conditionalChange, object) {
  const keys = Object.keys(conditionalChange);
  const dependantKey = keys.find((key) =>
    dependantToExclusiveKeys.field.includes(key),
  );

  const fieldValueInObject = object[conditionalChange.field];

  switch (dependantKey) {
    case "equal":
      const valueExpected = conditionalChange.equal;
      return valueExpected === fieldValueInObject;

    case "notEqual":
      const valueNotExpected = conditionalChange.notEqual;
      return valueNotExpected !== fieldValueInObject;

    case "oneOf":
      const acceptedValues = conditionalChange.oneOf;
      return acceptedValues.includes(fieldValueInObject);
  }
}

export function evaluateRuleCondition(conditionalChange, object) {
  const checkIfRuleIsValid = conditionalChange.rule;
  const predicateEvaluation = checkIfRuleIsValid(object);
  return !!predicateEvaluation; // força boolean
}
