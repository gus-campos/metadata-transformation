import { BahaviorProps, ExtraMetatadaProps } from "./metadata-transform";

export type Value = string | number | Date | InstanceObject | null;

export type PlainObject = {
  [key: string]: any;
};

export type InstanceObject = {
  [key: string]: Value | Value[] | InstanceObject;
};

export type MetadataProps = Required<BahaviorProps & ExtraMetatadaProps>;

export type Metadata = {
  fields: Record<string, MetadataProps>;
};

// TODO: Implementar
export type ExeptionHandling = {
  _fail?: string | string[];
  _warn?: string | string[];
}