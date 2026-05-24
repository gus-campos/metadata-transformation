import { InstanceObject, Value } from "../models/common";
import { MatchConditionNode } from "../models/instance-condition";
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
      const valueExpected = content as Value;

      // Verificação de uso de chaves de condição de valor dentro do valor de um campo
      // if (
      //   typeof valueExpected === "object" &&
      //   Object.keys(valueExpected).some((key) =>
      //     MATCH_CONDITION_KEYS.includes(key),
      //   )
      // ) {
      //   throw new Error(
      //     `Não é permitido o das chaves ${MATCH_CONDITION_KEYS.join(", ")} dentro da chave de um campo.`,
      //   );
      // }

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
  valueExpected: Value | Value[],
): boolean {
  const valueGot = accessPathInObject(instance, pathToField);

  if (valueGot === undefined) return false;

  const arrayGot = Array.isArray(valueGot) ? valueGot : [valueGot];
  const arrayExpected = Array.isArray(valueExpected)
    ? valueExpected
    : [valueExpected];
    
  if (arrayExpected.length === 0) return true;

  return arrayGot.some((valueGot) =>
    arrayExpected.some((valueExpected) =>
      valuesAreEqual(valueGot, valueExpected),
    ),
  );
}
