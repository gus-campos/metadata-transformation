import {
  ALL_VALID_CHANGE_KEYS,
  schema_changeConditionAnyChanged,
  schema_changeConditionChanged,
  schema_changeConditionIf,
  UnitChangeCondition,
} from "../models/change-condition";
import {
  DRAFT_CONDITION_VALID_KEYS,
  UnitDraftCondition,
} from "../models/draft-condition";
import {
  ALL_VALID_DRAFT_CONFIG_KEYS,
  schema_draftConfig,
} from "../models/draft-config";
import {
  DraftTransform,
  FieldDraftTransform,
  UnitFieldDraftTransform,
} from "../models/draft-transform";
import { ALL_VALID_VALUE_CONDITION_KEYS } from "../models/value-condition";
import { assertSchemaType, fail, formatArray, isPlainObject } from "./utils";
import { assertUnitValueCondition } from "./value-condition";

export function assertDraftTransform(
  candidate: unknown,
): candidate is DraftTransform {
  if (!isPlainObject(candidate)) {
    fail("Era esperado um objeto", candidate);
  }

  // FIXME: Decidir como a validação das chaves existentes será lidada
  // Tem filhos que só são instanciados depois!
  // Logo não dá pra acessar, mas não é erro
  // Mas as raízes podem ser validadas?

  return Object.entries(candidate).every(
    ([identifier, fieldTransformCandidate]) => {
      return assertFieldDraftTransform(fieldTransformCandidate, identifier);
    },
  );
}

export function assertFieldDraftTransform(
  candidate: unknown,
  identifier?: string,
  secondPass: boolean = false,
): candidate is FieldDraftTransform {
  // UnitFieldDraftTransform[]

  if (Array.isArray(candidate)) {
    if (secondPass) {
      fail(
        "O array de UnitFieldMetadataTransform não deve ter profundidade maior que 1.",
        candidate,
      );
    }

    return Object.entries(candidate).every(([_, fieldTransformCandidate]) =>
      assertFieldDraftTransform(fieldTransformCandidate, identifier, true),
    );
  }

  // UnitFieldDraftTransform

  if (!isPlainObject(candidate))
    fail("Era esperado um objeto ou um array.", candidate);

  const allValidKeys = [
    ...ALL_VALID_CHANGE_KEYS,
    ...ALL_VALID_VALUE_CONDITION_KEYS,
    ...ALL_VALID_DRAFT_CONFIG_KEYS,
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

  return assertUnitFieldDraftTransform(candidate, identifier);
}

function assertUnitFieldDraftTransform(
  candidate: Record<string, unknown>,
  identifier?: string,
): candidate is UnitFieldDraftTransform {
  // DraftConfig

  assertSchemaType(schema_draftConfig, candidate, identifier);

  // UnitValueCondition

  const hasChangeConditionKeys = ALL_VALID_CHANGE_KEYS.some(
    (key) => key in candidate,
  );

  const hasValueConditionKeys = ALL_VALID_VALUE_CONDITION_KEYS.filter(
    (key) => key !== "_if",
  ).some((key) => key in candidate);

  if (hasChangeConditionKeys && hasValueConditionKeys) {
    fail(
      "Não eram esperadas chaves de condição de valor e de condição mudança ao mesmo tempo",
      candidate,
    );
  }

  const draftConditionKeyIncluded = DRAFT_CONDITION_VALID_KEYS.some(
    (key) => key in candidate,
  );

  // Verificar se não tem os dois ao mesmo tempo

  if (draftConditionKeyIncluded) return assertUnitDraftCondition(candidate);

  return true;
}

function assertUnitDraftCondition(
  candidate: Record<string, unknown>,
  identifier?: string,
): candidate is UnitDraftCondition {
  // UnitChangedCondition
  if (ALL_VALID_CHANGE_KEYS.some((key) => key in candidate))
    return assertUnitChangeCondition(candidate, identifier);

  // UnitValueCondition

  if (ALL_VALID_VALUE_CONDITION_KEYS.some((key) => key in candidate))
    return assertUnitValueCondition(candidate, identifier);

  return false;
}

export function assertUnitChangeCondition(
  candidate: Record<string, unknown>,
  identifier?: string,
): candidate is UnitChangeCondition {
  const chageKeysFound = ALL_VALID_CHANGE_KEYS.filter(
    (key) => key in candidate,
  );

  if (chageKeysFound.length > 1) {
    fail(
      `Apenas uma das seguintes chaves principais eram esperadas: ${formatArray(ALL_VALID_CHANGE_KEYS)}`,
      candidate,
    );
  }

  const chageKeyFound = chageKeysFound[0];
  const pathToObjectValidated = [identifier, chageKeyFound]
    .filter(Boolean)
    .join(".");

    console.log(pathToObjectValidated)

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
