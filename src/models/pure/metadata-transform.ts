import { ExeptionHandling, PlainObject } from "./common";
import { ValueIfCondition, MatchCondition } from "./instance-condition";

export type Option = { value: string; identifier: string };

export type NameProp = { pt?: string; _current?: string };

export type MetadataProps = {
  readOnly?: boolean;
  required?: boolean;
  hidden?: boolean;

  size?: "sm" | "md" | "bg";
  breakLine?: boolean;

  valueOptions?: Option[];
  query?: PlainObject;

  mask?: { _id: string };
  name?: NameProp;
  editHelp?: NameProp;
  placeholder?: NameProp;
};

export type Apply = {
  _apply?: MetadataProps;
};

export type FieldMetadataTransform = ValueIfCondition &
  ExeptionHandling &
  MatchCondition &
  Apply;

export type MetadataTransform = {
  [fieldIdentifier: string]: FieldMetadataTransform[];
};

// =============================================================================