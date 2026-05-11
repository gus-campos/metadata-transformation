import { InstanceObject, Value } from "./common";

// Fields

export type FieldId = { _field?: string };
export type FieldsIds = { _fields: string[] };

// Conditions

export type ValueConditionIs = (FieldId & { _is: Value });
export type ValueConditionIsNot = (FieldId & { _isNot: Value });
export type ValueConditionIsIn = (FieldId & { _isIn: Value[] });
export type ValueConditionIsNotIn = (FieldId & { _isNotIn: Value[] });
export type ValueConditionAre = (FieldsIds & { _are: Value[] });
export type ValueConditionSomeIs = (FieldsIds & { _someIs: Value });
export type ValueConditionIf = { _if: (obj: InstanceObject) => boolean };

// Condition

export type UnitValueCondition =
  | ValueConditionIs
  | ValueConditionIsNot
  | ValueConditionIsIn
  | ValueConditionIsNotIn
  | ValueConditionAre
  | ValueConditionSomeIs
  | ValueConditionIf;

// Implementação futura

type ComposedValueCondition =
  | UnitValueCondition
  | { _all: UnitValueCondition[] }
  | { _any: UnitValueCondition[] }
  | { _not: UnitValueCondition };
