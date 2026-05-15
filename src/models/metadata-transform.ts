import { MetadataConfig } from "./metadata-config";
import { UnitValueCondition } from "./value-condition";

// => Tipos que devem ser validados manualmente

// Inútil por enquanto, mas deixa flexível pra outros tipos de condições
export type UnitMetadataCondition = UnitValueCondition;
export type ConditionalMetadata = UnitMetadataCondition & MetadataConfig;

export type FieldMetadataTransform =
  | MetadataConfig
  | ConditionalMetadata
  | ConditionalMetadata[];

export type MetadataTransform = Record<string, FieldMetadataTransform>;
