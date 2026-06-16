
import { InstanceIdSet, PlainObject } from "./common";
import { ValueIfCondition, MatchCondition } from "./instance-condition";

export type Option = { value: string; identifier: string };

export type NameProp = { pt?: string; _current?: string };

export type MetadataProps = {
  readOnly?: boolean;
  required?: boolean;
  hidden?: boolean;

  breakLine?: boolean;
  size?: "sm" | "md" | "bg";

  valueOptions?: Option[];
  query?: PlainObject;

  minMultiplicity?: number;
  maxMultiplicity?: number;

  mask?: InstanceIdSet;
  name?: NameProp;
  editHelp?: NameProp;
  placeholder?: NameProp;
};

export type Apply = {
  _apply?: MetadataProps;
};

export type FieldMetadataTransform = ValueIfCondition &
  // ExceptionHandling &
  MatchCondition &
  Apply;

export type FieldsMetadataTransform = {
  [fieldIdentifier: string]: FieldMetadataTransform[];
};

// ======================== RulesMetadataTransform ========================

export type FieldsApply = {
  _apply: {
    [fieldIdentifier: string]: Apply["_apply"];
  };
};

export type RuleMetadataTransform = ValueIfCondition &
  MatchCondition &
  FieldsApply;

export type RulesMetadataTransform = RuleMetadataTransform[];

// const rulesMetadataTransformExample: RulesMetadataTransform = [
//   {
//     _if: () => true,

//     _match: {
//       _not: {
//         campo: { _anyOf: ["valor"] },
//       },
//     },

//     _apply: {
//       campo1: {
//         hidden: true,
//       },
//       campo2: {
//         valueOptions: [],
//       },
//     },
//   },
// ];
