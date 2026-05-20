import { ALL_VALID_CHANGE_CONDITION_KEYS, schema_changeConditionAnyChanged, schema_changeConditionChanged, schema_changeConditionIf, UnitChangeCondition } from "../models/change-condition";
import { assertSchemaType, fail, formatArray } from "./utils";

export function assertUnitChangeCondition(
  candidate: Record<string, unknown>,
  fieldIdentifier?: string,
): candidate is UnitChangeCondition {
  const chageKeysFound = ALL_VALID_CHANGE_CONDITION_KEYS.filter(
    (key) => key in candidate,
  );

  if (chageKeysFound.length > 1) {
    fail(
      `Apenas uma das seguintes chaves principais eram esperadas: ${formatArray(ALL_VALID_CHANGE_CONDITION_KEYS)}`,
      candidate,
    );
  }

  const chageKeyFound = chageKeysFound[0];
  const pathToObjectValidated = [fieldIdentifier, chageKeyFound]
    .filter(Boolean)
    .join(".");

  switch (chageKeyFound) {
    case "_changed":
      return assertSchemaType(
        schema_changeConditionChanged,
        candidate,
        pathToObjectValidated,
      );

    case "_anyChanged":
      return assertSchemaType(
        schema_changeConditionAnyChanged,
        candidate,
        pathToObjectValidated,
      );

    case "_if":
      return assertSchemaType(
        schema_changeConditionIf,
        candidate,
        pathToObjectValidated,
      );

    default:
      throw new Error(
        `Chave secundária de condição de valor não tratada ${chageKeyFound}`,
      );
  }
}
