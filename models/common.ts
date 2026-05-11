import { MetadataProps } from "./metadata-config";

export type InstanceObject = { [key: string]: Value };

export type Value = InstanceObject | boolean | string | Date | null;

export type Metadata = {
  fields: Record<string, MetadataProps>;
};
