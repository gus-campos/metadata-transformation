import { number } from "zod";
import { InstanceObject } from "../models/pure/common";
import {
  MatchConditionNode,
  FieldMatchExpect,
  AnyOfMatch,
  AllOfMatch,
  ALL_OF_KEY,
  ANY_OF_KEY,
} from "../models/pure/instance-condition";
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
  // TODO: Decidir se mantém erro silencioso

  const valueGot = accessPathInObject(instance, pathToField);
  if (valueGot === undefined) return false;

  // Isso permite tratar da mesma forma para valor único e para valor múltiplo
  const arrayGot = Array.isArray(valueGot) ? valueGot : [valueGot];

  if (ANY_OF_KEY in fieldMatchExpect) {
    const { _anyOf } = fieldMatchExpect as AnyOfMatch;

    // Sem condição, é sempre verdadeiro
    if (_anyOf.length === 0) return true;

    return _anyOf.some((expected) =>
      arrayGot.some((got) => valuesAreEqual(got, expected)),
    );
  }

  if (ALL_OF_KEY in fieldMatchExpect) {
    const { _allOf } = fieldMatchExpect as AllOfMatch;

    // Sem condição, é sempre verdadeiro
    if (_allOf.length === 0) return true;

    return _allOf.every((expected) =>
      arrayGot.some((got) => valuesAreEqual(got, expected)),
    );
  }

  throw new Error("Tipo de chave não tratada");
}
