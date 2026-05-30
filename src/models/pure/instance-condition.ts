import { InstanceIdSet, InstanceObject, Value } from "./common";
import { KeysOfUnion } from "./util";

export type ValueIfCondition = {
  _if?: (args: {
    value: Value | Value[] | InstanceObject | undefined;
    obj: InstanceObject;
  }) => boolean;
};

// TODO: Decidir se na implementação deve olhar tanto _classId quanto _class._id?

/*
 * Simple: Se buscar igualdade entre dois elemetos, ou um elemento em um array
 * Any of: Se for único ou múltiplo (um deve estar incluso)
 * All of: Se for múltiplo (todos devem estar inclusos)
 */

// Se passado _allOf com mais de um item para campo não múltiplo, vai falhar sempre
export type MatchSimpleExpect = InstanceObject | Value;
export type AnyOfMatch = { _anyOf: MatchSimpleExpect[] };
export type AllOfMatch = { _allOf: MatchSimpleExpect[] };
export type FieldMatchExpect = AnyOfMatch | AllOfMatch;

export const ANY_OF_KEY = "_anyOf";
export const ALL_OF_KEY = "_allOf";

export const MATCH_EXPECT_KEYS = [
  ANY_OF_KEY,
  ALL_OF_KEY,
] as const satisfies KeysOfUnion<FieldMatchExpect>[];

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

export const MATCH_CONDITION_KEYS = [
  "_not",
  "_some",
] as const satisfies KeysOfUnion<MatchConditionNode>[];
