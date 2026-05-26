import { InstanceId, InstanceObject, Value } from "./common";

export type ValueIfCondition = {
  _if?: (
    fieldValue: Value | Value[] | InstanceObject | undefined,
    obj: InstanceObject,
  ) => boolean;
};

/*
 * Os seguinte tipos aceitos nesse argumento estão declarados assim
 * para satisfazer as limitações do typescript. Na prática deve ser
 * feita validação manual para recusar valores de tais tipos
 */

// Na implementação olhar tanto _classId quanto _class._id

export type ReferenceMatch = Required<InstanceId>

export type MatchConditionNode = {
  _not?: MatchConditionNode;
  _some?: MatchConditionNode;

  [identifier: string]:
    | ReferenceMatch[]
    | Value[]
    // Na prática não deve ser aceito:
    | undefined
    | MatchConditionNode;
};

export type MatchCondition = {
  _match?: MatchConditionNode;
};

export const MATCH_CONDITION_KEYS = ["_not", "_some"] as const;
