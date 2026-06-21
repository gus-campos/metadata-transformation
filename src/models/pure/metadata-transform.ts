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

// =================================================================================================

export const NAME_PROP_KEYS = [
    "name",
    "editHelp",
    "placeholder",
] as const satisfies (keyof MetadataProps)[];
