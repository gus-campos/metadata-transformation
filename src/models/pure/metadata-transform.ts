import { InstanceIdSet, PlainObject } from "./common";
import { ValueIfCondition, Match } from "./instance-condition";

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

export type Apply = MetadataProps;

export type FieldMetadataTransform = {
    _if?: ValueIfCondition;
    _match?: Match;
    _apply?: Apply;
};

export type FieldsMetadataTransform = {
    [fieldIdentifier: string]: FieldMetadataTransform[];
};

// ======================== RulesMetadataTransform ========================

export type FieldsApply = {};

export type RuleMetadataTransform = {
    _if?: ValueIfCondition;
    _match?: Match;
    _apply?: {
        [fieldIdentifier: string]: Apply;
    };
};
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
