import { InstanceObject, Value } from "./common";

export type ValueIfCondition = {
  _if?: (
    fieldValue: Value | Value[] | undefined,
    obj: InstanceObject,
  ) => boolean;
};

/*
 * Os seguinte tipos aceitos nesse argumento estão declarados assim
 * para satisfazer as limitações do typescript. Na prática deve ser
 * feita validação manual para recusar valores de tais tipos
 */

export type MatchConditionNode = {
  _not?: MatchConditionNode;
  _some?: MatchConditionNode;

  [identifier: string]:
    | Value
    | Value[]
    // Na prática não deve ser aceito:
    | undefined
    | MatchConditionNode;
};

export type MatchCondition = {
  _match?: MatchConditionNode;
};

export const MATCH_CONDITION_KEYS = ["_not", "_some"] as const;
