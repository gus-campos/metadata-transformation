import { InstanceObject } from "./commom";

export type UnitChangedCondition =
  | { _fieldChanged?: string }
  | { _someFieldChanged?: string[] }
  | { _if: (oldObj: InstanceObject, newObj: InstanceObject) => boolean };
