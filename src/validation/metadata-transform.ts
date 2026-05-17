import { string } from "zod";
import {
  ALL_VALID_METADATA_CONFIG_KEYS,
  schema_metadataConfig,
} from "../models/metadata-config";
import {
  FieldMetadataTransform,
  MetadataTransform,
  UnitFieldMetadataTransform,
} from "../models/metadata-transform";
import {
  ALL_VALID_CONDITION_KEYS,
  schema_valueConditionIf,
  schema_valueConditionIs,
  schema_valueConditionIsIn,
  schema_valueConditionIsNot,
  schema_valueConditionIsNotIn,
  UnitValueCondition,
  VALUE_valueOf_KEY,
  VALUE_IF_KEY,
  VALUE_MAIN_KEYS,
  VALUE_SECONDARY_KEYS,
} from "../models/value-condition";

import {
  fail,
  isPlainObject,
  assertSchemaType,
  formatList as formatArray,
} from "./utils";
import { Metadata } from "../models/common";

export function assertMetadataTransform(
  candidate: unknown,
  metadata: Metadata,
): candidate is MetadataTransform {
  if (!isPlainObject(candidate)) {
    fail("Era esperado um objeto", candidate);
  }

  const metadataFields = Object.keys(metadata.fields);
  const candidateFields = Object.keys(candidate);

  const extraKeysInCandidate = candidateFields.filter(
    (candidateKey) => !metadataFields.includes(candidateKey),
  );

  if (extraKeysInCandidate.length > 0) {
    fail(
      `As seguintes chaves estão presente no objeto passado, mas não estão presentes no '_metadata.fields' ${formatArray(extraKeysInCandidate)}`,
      candidate,
    );
  }

  return Object.entries(candidate).every(
    ([identifier, fieldTransformCandidate]) => {
      return assertFieldMetadataTransform(fieldTransformCandidate, identifier);
    },
  );
}

export function assertFieldMetadataTransform(
  candidate: unknown,
  identifier?: string,
  secondPass: boolean = false,
): candidate is FieldMetadataTransform {
  // ConditionalMetadata[]

  if (Array.isArray(candidate)) {
    if (secondPass) {
      fail(
        "O array de UnitFieldMetadataTransform não deve ter profundidade maior que 1.",
        candidate,
      );
    }

    return Object.entries(candidate).every(([_, fieldTransformCandidate]) =>
      assertFieldMetadataTransform(fieldTransformCandidate, identifier, true),
    );
  }

  // ConditionalMetadata

  if (!isPlainObject(candidate))
    fail("Era esperado um objeto ou um array.", candidate);

  const allValidKeys = [
    ...ALL_VALID_METADATA_CONFIG_KEYS,
    ...ALL_VALID_CONDITION_KEYS,
  ];

  const extraKeys = Object.keys(candidate).filter(
    (key) => !allValidKeys.includes(key),
  );

  if (extraKeys.length > 0) {
    fail(
      `Não era esperada nenhuma chave extra, porém as seguintes chaves foram encontradas ${formatArray(extraKeys)}`,
      candidate,
    );
  }

  return assertUnitFieldMetadataTransform(candidate, identifier);
}

function assertUnitFieldMetadataTransform(
  candidate: Record<string, unknown>,
  identifier?: string,
): candidate is UnitFieldMetadataTransform {
  // MetadataConfig

  assertSchemaType(schema_metadataConfig, candidate, identifier);

  // UnitValueCondition

  const secondaryKeyFound = VALUE_SECONDARY_KEYS.some(
    (key) => key in candidate,
  );
  const primaryKeysIncluded = VALUE_MAIN_KEYS.some((key) => key in candidate);
  if (secondaryKeyFound || primaryKeysIncluded)
    return assertUnitValueCondition(candidate);

  return true;
}

export function assertUnitValueCondition(
  candidate: Record<string, unknown>,
  identifier?: string,
): candidate is UnitValueCondition {
  // Chaves principais

  const mainKeysFound = VALUE_MAIN_KEYS.filter((key) => key in candidate);

  if (mainKeysFound.length > 1) {
    fail(
      `Apenas uma das seguintes chaves principais eram esperadas: ${formatArray(VALUE_MAIN_KEYS)}`,
      candidate,
    );
  }

  const mainKeyFound = mainKeysFound[0];

  const secondaryKeysFound = VALUE_SECONDARY_KEYS.filter(
    (key) => key in candidate,
  );

  // Condição IF

  if (mainKeyFound === VALUE_IF_KEY) {
    if (secondaryKeysFound.length > 0) {
      fail(
        `Não era esperado nenhuma das seguintes chaves secundárias ${formatArray(VALUE_SECONDARY_KEYS)} junto da chave ${VALUE_IF_KEY}`,
        candidate,
      );
    }

    return assertSchemaType(schema_valueConditionIf, candidate, identifier);
  }

  // Condição FIELD - aceita implícito

  if (secondaryKeysFound.length > 1) {
    fail(
      `Apenas uma das seguintes chaves secundárias eram esperadas: ${formatArray(VALUE_SECONDARY_KEYS)}`,
      candidate,
    );
  }

  if (secondaryKeysFound.length === 0) {
    fail(
      `Esperada uma das seguintes chaves secundárias junto com a chave ${VALUE_valueOf_KEY} ${formatArray(VALUE_SECONDARY_KEYS)}`,
      candidate,
    );
  }

  const secondaryKeyFound = secondaryKeysFound[0];
  const path = [identifier, secondaryKeyFound].filter(Boolean).join(".");

  switch (secondaryKeyFound) {
    case "_is":
      return assertSchemaType(schema_valueConditionIs, candidate, path);

    case "_isNot":
      return assertSchemaType(schema_valueConditionIsNot, candidate, path);

    case "_in":
      return assertSchemaType(schema_valueConditionIsIn, candidate, path);

    case "_notIn":
      return assertSchemaType(schema_valueConditionIsNotIn, candidate, path);

    default:
      throw new Error(
        `Chave secundária de condição de valor não tratada ${secondaryKeyFound}`,
      );
  }
}
