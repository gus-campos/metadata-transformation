import { InstanceObject, Value } from "../models/pure/common";
import { MatchConditionNode, ReferenceMatch } from "../models/pure/instance-condition";
import { accessPathInObject } from "../utils/path-access";
import { valuesAreEqual } from "../utils/values-are-equal";

export function checkMatchCondition(
  instance: InstanceObject,
  matchCondition: MatchConditionNode,
): boolean {
  return checkMatchConditionHelper(instance, matchCondition, "every");
}

function checkMatchConditionHelper(
  instance: InstanceObject,
  matchCondition: MatchConditionNode,
  mode: "every" | "some",
): boolean {
  
  const evaluationOfAllConditions = Object.entries(matchCondition).map(
    ([key, content]) => {
      if (key === "_not") {
        const notCondition = content as MatchConditionNode;
        return !checkMatchConditionHelper(instance, notCondition, "every");
      }

      if (key === "_some") {
        const someCondition = content as MatchConditionNode;
        return checkMatchConditionHelper(instance, someCondition, "some");
      }

      const path = key as string;
      const valueExpected = content as Value[] | ReferenceMatch[];

      // FIXME: Validar que não tem chaves _not e _some dentro
      // da chave do campo, para compensar limitação da tipagem

      return checkFieldMatch(instance, path, valueExpected);
    },
  );

  if (mode === "every") {
    return evaluationOfAllConditions.every(Boolean);
  }

  return evaluationOfAllConditions.some(Boolean);
}

function checkFieldMatch(
  instance: InstanceObject,
  pathToField: string,
  valuesExpected: Value[] | ReferenceMatch[],
): boolean {

  const valueGot = accessPathInObject(instance, pathToField);
  if (valueGot === undefined) return false;
  const arrayGot = Array.isArray(valueGot) ? valueGot : [valueGot];
    
  if (valuesExpected.length === 0) return true;

  return arrayGot.some((valueGot) =>
    valuesExpected.some((valueExpected) =>
      valuesAreEqual(valueGot, valueExpected),
    ),
  );
}


function isReferenceObject(obj: InstanceObject) {
  return "_id" in obj;
}
