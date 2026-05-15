import { InstanceObject } from "./common";

// => Tipos que devem ser validados manualmente

export type UnitChangedCondition =
  | { _fieldChanged?: string }
  | { _someFieldChanged?: string[] }
  | { _if: (oldObj: InstanceObject, newObj: InstanceObject) => boolean };
