
import { PlainObject } from "./common";

export type UnitChangedCondition =
  | { _fieldChanged?: string }
  | { _someFieldChanged?: string[] }
  | { _if: (oldObj: PlainObject, newObj: PlainObject) => boolean };
