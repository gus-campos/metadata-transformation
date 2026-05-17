
import { PlainObject } from "./common";

export type UnitChangedCondition =
  | { _changed: string }
  | { _anyChanged: string[] }
  | { _if: (object: PlainObject, oldObject: PlainObject) => boolean };
