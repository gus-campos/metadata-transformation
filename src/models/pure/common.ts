import { MetadataProps } from "./metadata-transform";

export type Value = string | number | Date | null;

export type PlainObject = {
  [key: string]: any;
};

export type InstanceIdSet = {
  _id?: string;
  _classId?: string;
  // _class?: { _id?: string; }
};

export type InstanceObject = InstanceIdSet & {
  [key: string]: Value | Value[] | InstanceObject;
};

export type Metadata = {
  fields: Record<string, Required<MetadataProps>>;
};

// TODO: Implementar
export type ExeptionHandling = {
  _fail?: string | string[];
  _warn?: string | string[];
};
