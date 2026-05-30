import { InstanceIdSet, InstanceObject, Value } from "./common";
import { KeysOfUnion } from "./util";

export type ValueIfCondition = {
  _if?: (
    fieldValue: Value | Value[] | InstanceObject | undefined,
    obj: InstanceObject,
  ) => boolean;
};

// Na implementação olhar tanto _classId quanto _class._id

/*
 * Simple: Se buscar igualdade entre dois elemetos, ou um elemento em um array
 * Any of: Se for único ou múltiplo (um deve estar incluso)
 * All of: Se for múltiplo (todos devem estar inclusos)
 */

export type MatchSimpleExpect = InstanceObject | Value;
export type AnyOfMatch = { anyOf: MatchSimpleExpect[] };
export type AllOfMatch = { allOf: MatchSimpleExpect[] };

export type CompoundMatch =
  | AnyOfMatch
  | AllOfMatch

export type FieldMatchExpect = MatchSimpleExpect | CompoundMatch;

export const COMPAUND_MATCH_KEYS = [
  "anyOf",
  "allOf",
] as const satisfies KeysOfUnion<CompoundMatch>[];

export type MatchConditionNode = {
  _not?: MatchConditionNode;
  _some?: MatchConditionNode;

  [identifier: string]:
    | FieldMatchExpect
    // FIXME: Na prática não devem ser aceitos:
    | undefined
    | MatchConditionNode;
};

export type MatchCondition = {
  _match?: MatchConditionNode;
};

export const MATCH_CONDITION_KEYS = ["_not", "_some"] as const;
