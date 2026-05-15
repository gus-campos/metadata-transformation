import { InstanceObject, Metadata, Value } from "../models/common";
import { assertMetadataProps } from "./metadata-config";
import { fail, isPlainObject, ValidationError } from "./utils";

export function assertValue(candidate: unknown): candidate is Value {
  if (
    candidate === null ||
    typeof candidate === "boolean" ||
    typeof candidate === "string" ||
    candidate instanceof Date
  ) {
    return true;
  }

  if (isPlainObject(candidate)) {
    for (const [key, val] of Object.entries(candidate)) {
      try {
        assertValue(val);
      } catch (e) {
        throw new ValidationError(
          `Value inválido na chave '${key}': ${(e as Error).message}`,
        );
      }
    }
    return true;
  }

  return fail(
    `Esperado: Value\n` +
      `  Tipos válidos: InstanceObject | boolean | string | Date | null`,
    candidate,
  );
}

export function assertInstanceObject(
  candidate: unknown,
): candidate is InstanceObject {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: InstanceObject\n  Formato: { [key: string]: Value }`,
      candidate,
    );
  }

  for (const [key, val] of Object.entries(candidate)) {
    try {
      assertValue(val);
    } catch (e) {
      throw new ValidationError(
        `InstanceObject: valor inválido na chave '${key}': ${(e as Error).message}`,
      );
    }
  }

  return true;
}

export function assertMetadata(candidate: unknown): candidate is Metadata {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: Metadata\n  Formato: { fields: Record<string, MetadataProps> }`,
      candidate,
    );
  }

  if (!("fields" in candidate) || !isPlainObject(candidate.fields)) {
    return fail(`Metadata: 'fields' deve ser um objeto`, candidate);
  }

  for (const [key, val] of Object.entries(candidate.fields)) {
    try {
      assertMetadataProps(val);
    } catch (e) {
      throw new ValidationError(
        `Metadata.fields['${key}']: ${(e as Error).message}`,
      );
    }
  }

  return true;
}
