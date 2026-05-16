import { MetadataConfig } from "./metadata-config";
import { UnitValueCondition } from "./value-condition";

// => Tipos que devem ser validados manualmente

// Inútil por enquanto, mas deixa flexível pra outros tipos de condições
export type UnitMetadataCondition = UnitValueCondition;
// => Validados manualmente

export type UnitFieldMetadataTransform = MetadataConfig | (MetadataConfig & UnitMetadataCondition);

// Prefere uniformidade
export type FieldMetadataTransform =
  | UnitFieldMetadataTransform
  | UnitFieldMetadataTransform[];

export type MetadataTransform = Record<string, FieldMetadataTransform>;
