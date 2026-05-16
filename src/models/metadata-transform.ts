import { MetadataConfig } from "./metadata-config";
import { UnitValueCondition } from "./value-condition";

export type UnitFieldMetadataTransform = MetadataConfig | (MetadataConfig & UnitValueCondition);

export type FieldMetadataTransform =
  | UnitFieldMetadataTransform
  | UnitFieldMetadataTransform[];

export type MetadataTransform = Record<string, FieldMetadataTransform>;
