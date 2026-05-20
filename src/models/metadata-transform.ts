import { Metadata, PlainObject } from "./common";
import { MetadataConfig } from "./metadata-config";
import { ComposedValueCondition } from "./value-condition";

export type UnitFieldMetadataTransform = MetadataConfig | (MetadataConfig & ComposedValueCondition);

export type FieldMetadataTransform =
  | UnitFieldMetadataTransform
  | UnitFieldMetadataTransform[];

export type MetadataTransform = Record<string, FieldMetadataTransform>;

// Context

export interface MetadataContext {
  object: PlainObject;
  metadata: Metadata;
}

export interface FieldMetadataContext extends MetadataContext {
  fieldIdentifier: string;
}