import { schema_metadataConfig } from "../models/metadata-config";
import {
  FieldMetadataTransform,
  MetadataTransform,
  UnitFieldMetadataTransform,
} from "../models/metadata-transform";
import {
  schema_valueConditionIf,
  schema_valueConditionIs,
  schema_valueConditionIsIn,
  schema_valueConditionIsNot,
  schema_valueConditionIsNotIn,
  UnitValueCondition,
  VALUE_MAIN_KEYS,
  VALUE_SECONDARIES_BY_PRIMARIES_KEYS,
  VALUE_SECONDARY_KEYS,
} from "../models/value-condition";

import { fail, formatList, isPlainObject } from "./utils";

export function assertFieldMetadataFieldTransform(
  candidate: unknown,
  secondPass: boolean = false,
): candidate is FieldMetadataTransform {
  // ConditionalMetadata[]
  if (Array.isArray(candidate)) {
    if (secondPass) {
      fail(
        "Não é permitido passar UnitFieldMetadataTransform em array multidimencionais",
        candidate,
      );
    }

    for (const item of candidate) {
      assertFieldMetadataFieldTransform(item, true);
    }

    return true;
  }

  if (!isPlainObject(candidate)) {
    fail("Era esperado um objeto ou um array.", candidate);
  }

  assertUnitFieldMetadataTransform(candidate);

  return true;
}

function assertUnitFieldMetadataTransform(
  candidate: Record<string, unknown>,
): candidate is UnitFieldMetadataTransform {

  // MetadataConfig
  schema_metadataConfig.parse(candidate);

  // UnitMetadataCondition
  const secondaryKeyFound = VALUE_SECONDARY_KEYS.find(
    (key) => key in candidate,
  );
  
  // Não é UnitMetadataCondition, mas é UnitFieldMetadataTransform
  if (!secondaryKeyFound) 
    return true;
  
  const primaryKeyFound = VALUE_MAIN_KEYS.find((key) => key in candidate);
  const matchingPrimary = VALUE_MAIN_KEYS.find((key) =>
    VALUE_SECONDARIES_BY_PRIMARIES_KEYS[key].includes(secondaryKeyFound),
  )!;

  // Única que pode vir implícita é _field
  if (!primaryKeyFound && matchingPrimary !== "_field") {
    fail(
      "O único campo primário que pode vir implícito é o campo _field. Está faltando algum campo primário",
      candidate,
    );
  }

  // Se não está implícita e está diferente da esperada
  if (primaryKeyFound && primaryKeyFound !== matchingPrimary) {
    fail(
      `A chave primária ${primaryKeyFound} só pode ser usada junto das seguintes chaves secundárias: ` +
        formatList(VALUE_SECONDARIES_BY_PRIMARIES_KEYS[primaryKeyFound]),
      candidate,
    );
  }

  // Flexível para outros campos primários futuros
  switch (matchingPrimary) {
    case "_field":
      return assertFieldConditionalMetadata(candidate);

    default:
      throw new Error(
        "Chave primária não possui implementação de verificação: " +
          matchingPrimary,
      );
  }
}

function assertFieldConditionalMetadata(
  candidate: unknown,
): candidate is UnitFieldMetadataTransform {
  if (!isPlainObject(candidate)) {
    fail("Era esperado um objeto ou um array.", candidate);
  }

  // UnitMetadataCondition
  assertUnitValueCondition(candidate);

  return true;
}

// Ou MetadataCondition
export function assertUnitValueCondition(
  candidate: Record<string, unknown>,
): candidate is UnitValueCondition {
  const secondaryKeyFound = VALUE_SECONDARIES_BY_PRIMARIES_KEYS._field.find(
    (key) => key in candidate,
  );

  switch (secondaryKeyFound) {
    case "_is":
      schema_valueConditionIs.parse(candidate);
      return true;

    case "_isNot":
      schema_valueConditionIsNot.parse(candidate);
      return true;

    case "_isIn":
      schema_valueConditionIsIn.parse(candidate);
      return true;

    case "_isNotIn":
      schema_valueConditionIsNotIn.parse(candidate);
      return true;

    case "_if":
      schema_valueConditionIf.parse(candidate);
      return true;

    default:
      throw new Error(
        `Chave secundária de condição de valor não tratada ${secondaryKeyFound}`,
      );
  }
}
