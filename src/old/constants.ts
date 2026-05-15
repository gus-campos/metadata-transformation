export const BEHAVIOR_VALUES = [
  "omitted",
  "mandatory",
  "editable",
  "displayed",
] as const;

export const BEHAVIOR_PROP_KEYS = ["readonly", "required", "hidden"] as const;

export const SIZE_VALUES = ["sm", "md", "lg"] as const;

export const VALUE_CONDITION_KEYS = [
  "_is",
  "_isNot",
  "_isIn",
  "_isNotIn",
  "_are",
  "_someIs",
  "_if",
] as const;
export type ValueConditionKey = (typeof VALUE_CONDITION_KEYS)[number];

export const CHANGED_CONDITION_KEYS = [
  "_fieldChanged",
  "_someFieldChanged",
  "_if",
] as const;
export type ChangedConditionKey = (typeof CHANGED_CONDITION_KEYS)[number];
