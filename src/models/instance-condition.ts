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

type BaseMatchCondition = {
  _not?: BaseMatchCondition;
  _some?: BaseMatchCondition;

  [identifier: string]:
    | Value
    | Value[]
    // Na prática não deve ser aceito:
    | undefined
    | BaseMatchCondition;
};

export type MatchCondition = {
  _match?: BaseMatchCondition;
};

export const MATCH_CONDITION_KEYS = ["_not", "_some"] as const;
