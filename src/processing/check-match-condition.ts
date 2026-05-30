import { InstanceIdSet, InstanceObject, Value } from "../models/pure/common";
import {
  MatchConditionNode,
  FieldMatchExpect,
  COMPAUND_MATCH_KEYS,
  CompoundMatch,
  AnyOfMatch,
  AllOfMatch,
  MatchSimpleExpect,
} from "../models/pure/instance-condition";
import { isPlainObject } from "../utils/is-plain-object";
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
      const valueExpected = content as FieldMatchExpect;

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
  fieldMatchExpect: FieldMatchExpect,
): boolean {
  // TODO: Decidir se mant´em comportamento silencioso

  const valueGot = accessPathInObject(instance, pathToField);
  if (valueGot === undefined) return false;

  // Isso permite tratar da mesma forma tanto quando vem valor único e quando vem múltiplo
  const arrayGot = Array.isArray(valueGot) ? valueGot : [valueGot];

  // Comparação com valor
  if (!isPlainObject(fieldMatchExpect)) {
    const valueExpected = fieldMatchExpect;
    return arrayGot.some((got) => valuesAreEqual(got, valueExpected));
  }

  // Comparação com matches compostos
  if (COMPAUND_MATCH_KEYS.some((key) => key in fieldMatchExpect)) {
    if ("anyOf" in fieldMatchExpect) {
      const { anyOf } = fieldMatchExpect as AnyOfMatch;
      return anyOf.some((expected) =>
        arrayGot.some((got) => valuesAreEqual(got, expected)),
      );
    }

    if ("allOf" in fieldMatchExpect) {
      const { allOf } = fieldMatchExpect as AllOfMatch;
      return allOf.every((expected) =>
        arrayGot.some((got) => valuesAreEqual(got, expected)),
      );
    }

    return false;
  }

  // TESTAR ISSO
  // ESTA CERTO?
  // TESTAR COMPARAÇÂO ENTRE OBJETOS

  // Comparação com valores/objeto
  const partialInstance = fieldMatchExpect as InstanceObject;
  return arrayGot.some((got) => valuesAreEqual(got, partialInstance));
}

function isReferenceObject(obj: InstanceObject) {
  return "_id" in obj;
}
