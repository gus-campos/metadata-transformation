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
  ALL_VALID_VALUE_CONDITION_KEYS,
  VALUE_MAIN_KEYS,
  VALUE_SECONDARY_KEYS,
} from "../models/value-condition";

import {
  fail,
  isPlainObject,
  assertSchemaType,
  formatArray
} from "./utils";
import { Metadata } from "../models/common";
import { assertUnitValueCondition } from "./value-condition";

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
  // UnitFieldMetadataTransform[]

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

  // UnitFieldMetadataTransform

  if (!isPlainObject(candidate))
    fail("Era esperado um objeto ou um array.", candidate);

  const allValidKeys = [
    ...ALL_VALID_METADATA_CONFIG_KEYS,
    ...ALL_VALID_VALUE_CONDITION_KEYS,
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
    return assertUnitValueCondition(candidate, identifier);

  return true;
}
