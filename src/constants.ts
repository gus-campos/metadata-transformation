import { Behavior, BehaviorProps, LayoutConfig, SelectionConfig, SelectOptions, SelectQuery } from "./models/metadata-config";

export const conditionalValuekeys = [
  "_field",
  "_fields",
  "_is",
  "_isNot",
  "_isIn",
  "_isNotIn",
  "_are",
  "_someIs",
  "obj",
];

export const metadataConfigKeys = {
  behavior: ["omitted", "mandatory", "editable", "displayed"] as Behavior["behavior"][],
  behaviorProps: ["readonly", "required", "hidden"] as (keyof BehaviorProps)[],
  layoutConfig: ["breakLine", "size"] as (keyof LayoutConfig)[],
  selectionConfig: ["options", "query"] as (keyof SelectOptions | keyof SelectQuery)[],
};

// export const metaPropsKeys = [
//   "readonly",
//   "required",
//   "hidden",
//   "breakLine",
//   "size",
// ];

// export const booleanMetaProps = ["readonly", "required", "hidden", "breakLine"];

// export const sizeValidValues = ["sm", "md", "lg"];

// export const exclusiveKeys = ["_field", "_fields", "_if"];

// export const dependantToExclusiveKeys: Record<string, string[]> = {
//   _field: ["_is", "_isNot", "_isIn", "_isNotIn"],
//   _fields: ["_are", "_someIs"],
//   _if: [],
// };

// export const allNonMetaKeys = [
//   ...exclusiveKeys,
//   ...Object.entries(dependantToExclusiveKeys).flatMap(([key, value]) => value),
// ];

// export const allValidKeys = [
//   ...metaPropsKeys,
//   ...exclusiveKeys,
//   ...exclusiveKeys.flatMap((key) => dependantToExclusiveKeys[key]),
// ];
