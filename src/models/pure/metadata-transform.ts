import { ExeptionHandling, InstanceId, PlainObject } from "./common";
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

  mask?: InstanceId;
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