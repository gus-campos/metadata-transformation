import { ConditionalMetadata, FieldMetadataTransform, MetadataTransform } from "../models/metadata-transform";
import { VALUE_CONDITION_KEYS } from "./constants";
import { assertMetadataConfig } from "./metadata-config";
import { fail, isPlainObject, ValidationError } from "./utils";
import { assertUnitValueCondition } from "./value-condition";

export function assertConditionalMetadata(
  candidate: unknown,
): candidate is ConditionalMetadata {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ConditionalMetadata\n  Formato: UnitValueCondition & MetadataConfig`,
      candidate,
    );
  }

  assertUnitValueCondition(candidate);
  assertMetadataConfig(candidate);
  return true;
}

export function assertFieldMetadataTransform(
  candidate: unknown,
): candidate is FieldMetadataTransform {
  if (Array.isArray(candidate)) {
    for (const [i, item] of candidate.entries()) {
      try {
        assertConditionalMetadata(item);
      } catch (e) {
        throw new ValidationError(
          `FieldMetadataTransform[${i}] com valor: "${JSON.stringify(item, null, 2)}": \n${(e as Error).message}`,
        );
      }
    }
    return true;
  }

  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: FieldMetadataTransform\n` +
        `  MetadataConfig         → configuração direta\n` +
        `  ConditionalMetadata    → { <condição>, ...MetadataConfig }\n` +
        `  ConditionalMetadata[]  → lista de condicionais`,
      candidate,
    );
  }

  const hasCondition = VALUE_CONDITION_KEYS.some((k) => k in candidate);
  if (hasCondition) return assertConditionalMetadata(candidate);
  return assertMetadataConfig(candidate);
}

export function assertMetadataTransform(
  candidate: unknown,
): candidate is MetadataTransform {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: MetadataTransform\n  Formato: Record<string, FieldMetadataTransform>`,
      candidate,
    );
  }

  for (const [key, value] of Object.entries(candidate)) {
    try {
      assertFieldMetadataTransform(value);
    } catch (e) {
      throw new ValidationError(
        `MetadataTransform['${key}'] com valor "${JSON.stringify(value, null, 2)}". ${(e as Error).message}`,
      );
    }
  }

  return true;
}
