import { schema_valueConditionIf, schema_valueConditionIs, schema_valueConditionIsIn, schema_valueConditionIsNot, schema_valueConditionIsNotIn, UnitValueCondition, VALUE_IF_KEY, VALUE_MAIN_KEYS, VALUE_SECONDARY_KEYS, VALUE_VALUE_OF_KEY } from "../models/value-condition";
import { assertSchemaType, fail, formatArray } from "./utils";

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
      `Esperada uma das seguintes chaves secundárias junto com a chave ${VALUE_VALUE_OF_KEY} ${formatArray(VALUE_SECONDARY_KEYS)}`,
      candidate,
    );
  }

  const secondaryKeyFound = secondaryKeysFound[0];

  switch (secondaryKeyFound) {
    case "_is":
      console.log("teste")
      return assertSchemaType(schema_valueConditionIs, candidate, identifier);

    case "_isNot":
      return assertSchemaType(schema_valueConditionIsNot, candidate, identifier);

    case "_in":
      return assertSchemaType(schema_valueConditionIsIn, candidate, identifier);

    case "_notIn":
      return assertSchemaType(schema_valueConditionIsNotIn, candidate, identifier);

    default:
      throw new Error(
        `Chave secundária de condição de valor não tratada ${secondaryKeyFound}`,
      );
  }
}
