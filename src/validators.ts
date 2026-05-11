
import { Metadata } from "../models/common";
import { DraftTransform } from "../models/draft-transform";
import { MetadataTransform } from "../models/metadata-transform";
import {
  schema_draftTransform,
  schema_fieldMetadataTransform,
  schema_metadata,
  schema_metadataTransform,
} from "../models/validation-schemas";

// Observação: Objeto da instância não é validado, nem as chaves de objeto
// Elas apenas retornam "caminho não encontrado", quando tenta ler

// FIXME: Pode ignorar condição com identificador inexistente!
// Funciona, mas é estranho???

export function throwToNotValidMetadataTransform(
  candidate: unknown,
): candidate is MetadataTransform {
  const result = schema_metadataTransform.parse(candidate);
  return true;
}

export function throwToNotValidDraftTransform(
  candidate: unknown,
): candidate is DraftTransform {
  const result = schema_draftTransform.parse(candidate);
  return true;
}

export function throwToNotValidMetadata(
  candidate: unknown,
): candidate is Metadata {
  const result = schema_metadata.parse(candidate);
  return true;
}

export function throwToNotValidFieldMetadataTransform(
  candidate: unknown,
): candidate is Metadata {
  const result = schema_fieldMetadataTransform.parse(candidate);
  return true;
}