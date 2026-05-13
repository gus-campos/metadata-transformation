import { ZodAny, ZodType } from "zod";
import { Metadata } from "./models/common";
import { DraftTransform } from "./models/draft-transform";
import {
  FieldMetadataTransform,
  MetadataTransform,
} from "./models/metadata-transform";
import {
  schema_draftTransform,
  schema_fieldMetadataTransform,
  schema_metadata,
  schema_metadataTransform,
} from "./models/validation-schemas";

// Observação: Objeto da instância não é validado, nem as chaves de objeto
// Elas apenas retornam "caminho não encontrado", quando tenta ler

// FIXME: Pode ignorar condição com identificador inexistente!
// Funciona, mas é estranho???

export function throwToNotValidMetadataTransform(
  candidate: unknown,
): candidate is MetadataTransform {
  validateCandidateWithSchema(schema_metadataTransform, candidate);
  return true;
}

export function throwToNotValidDraftTransform(
  candidate: unknown,
): candidate is DraftTransform {
  validateCandidateWithSchema(schema_draftTransform, candidate);
  return true;
}

export function throwToNotValidMetadata(
  candidate: unknown,
): candidate is Metadata {
  validateCandidateWithSchema(schema_metadata, candidate);
  return true;
}

export function throwToNotValidFieldMetadataTransform(
  candidate: unknown,
): candidate is FieldMetadataTransform {
  validateCandidateWithSchema(schema_fieldMetadataTransform, candidate);
  return true;
}

function validateCandidateWithSchema(schema: ZodType<any>, candidate: unknown) {
  const result = schema.safeParse(candidate);
  if (!result.success) {
    const issue = result.error.issues[0];
    const message = issue.message + `, em: "${issue.input}"`;
    throw new Error(message);
  }
}
