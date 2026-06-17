import { InstanceObject, InstanceValue, Value } from "./common";
import { KeysOfUnion } from "./util";

export type ValueIfCondition = {
  _if?: (args: {
    // O valor pode ser encontrado ou não, para ser passado pro predicato
    value: InstanceValue | undefined;
    obj: InstanceObject;
  }) => boolean;
};

/*
 * Any of: Se for único ou múltiplo um deve estar incluso
 * All of: Se for múltiplo, todos devem estar inclusos, se for único, mesma coisa
 * ou seja, vai falhar se passar mais de um valor diferente.
 */

// Se passado _allOf com mais de um item para campo não múltiplo, vai falhar sempre
export type Expected = InstanceObject | Value;
export type AnyOf = { _anyOf: Expected[] };
export type AllOf = { _allOf: Expected[] };
export type MultExpected = AnyOf | AllOf;

export const ANY_OF_KEY = "_anyOf";
export const ALL_OF_KEY = "_allOf";

export const MATCH_EXPECT_KEYS = [
  ANY_OF_KEY,
  ALL_OF_KEY,
] as const satisfies KeysOfUnion<MultExpected>[];

export type MatchNode = {
  _not?: MatchNode;
  _some?: MatchNode;
  // Incluído para permitir referência implícita internamente
  _match?: MatchNode;

  [identifier: string]:
    | MultExpected
    // Na prática não devem ser aceitos:
    | undefined
    | MatchNode;
};

export type MatchCondition = {
  _match?: MatchNode;
};

export const NOT_KEY = "_not";
export const SOME_KEY = "_some";
export const MATCH_KEY = "_match";

export const MATCH_CONDITION_KEYS = [
  NOT_KEY,
  SOME_KEY,
  MATCH_KEY
] as const satisfies KeysOfUnion<MatchNode>[];
