import { InstanceObject, InstanceValue, Value } from "./common";
import { KeysOfUnion } from "./util";

// O valor pode ser encontrado ou não, para ser passado pro predicato
export type ValueIfCondition = {
    _if?: (args: {
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
export type ValueExpected = InstanceObject | Value;
export type AnyOf = { _anyOf: ValueExpected[] };
export type AllOf = { _allOf: ValueExpected[] };
export type ValueCheck = AnyOf | AllOf;

export type Match = {
    _not?: Match;
    _some?: Match;
    _match?: Match;

    [identifier: string]:
        | ValueCheck
        // Na prática não devem ser aceitos:
        | undefined
        | Match;
};

// =================================================================================================

export const ANY_OF_KEY = "_anyOf";
export const ALL_OF_KEY = "_allOf";
export const MATCH_EXPECT_KEYS = [
    ANY_OF_KEY,
    ALL_OF_KEY,
] as const satisfies KeysOfUnion<ValueCheck>[];

export const NOT_KEY = "_not";
export const SOME_KEY = "_some";
export const MATCH_KEY = "_match";
export const MATCH_CONDITION_KEYS = [
    NOT_KEY,
    SOME_KEY,
    MATCH_KEY,
] as const satisfies KeysOfUnion<Match>[];
