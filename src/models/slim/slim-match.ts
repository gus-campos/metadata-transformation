import {
  ValueCheck,
  MATCH_CONDITION_KEYS,
  MATCH_EXPECT_KEYS,
  Match,
  ValueExpected,
} from "../pure/instance-condition";
import { InstanceObject, Value } from "../pure/common";
import { isPlainObject } from "../../utils/is-plain-object";

// Pode receber uma checagem explícita ou resumida
export type SlimValueCheck = ValueCheck | ValueExpected | ValueExpected[];

export type SlimMatch = {
  _not?: SlimMatch;
  _some?: SlimMatch;
  _match?: SlimMatch;

  [identifier: string]:
    | SlimValueCheck
    // Na prática não devem ser aceitos:
    | undefined
    | SlimMatch;
};

// =================================================================================================

// Para comparações implícitas do próprio campo, não permite passagem de objeto
type ImplicitExpected = Value | Value[];

export type SlimImplicitMatchNode =
  | ImplicitExpected
  | {
      _not?: SlimImplicitMatchNode | ImplicitExpected;
      _some?: SlimImplicitMatchNode | ImplicitExpected;
      _match?: SlimImplicitMatchNode | ImplicitExpected;

      [identifier: string]:
        | SlimValueCheck
        // Na prática não devem ser aceitos:
        | undefined
        | SlimImplicitMatchNode;
    };

// =================================================================================================

export function toMatchCondition(
  slimCondition: SlimImplicitMatchCondition,
  fieldIdentifier: string | null = null,
): Match {
  const { _match } = slimCondition;
  if (_match === undefined) return {};

  // Se for valor esperado (campo implícito)
  if (!isPlainObject(_match)) {
    if (!fieldIdentifier) {
      throw new Error(
        "Deve ser passado fieldIdentifier quando houver campo implícito",
      );
    }
    return { _match: getImplicitNode(_match, fieldIdentifier) };
  }

  return { _match: toMatchConditionNode(_match, fieldIdentifier) };
}

function toMatchConditionNode(
  slimNode: SlimImplicitMatchNode,
  fieldIdentifier: string | null = null,
): Match {
  const nodeCopy = { ...slimNode };

  // Chamar recursivamente até chegar no SlimFieldMatchExpect
  // converter

  for (const [key, value] of Object.entries(slimNode)) {
    if ((MATCH_CONDITION_KEYS as string[]).includes(key)) {
      // É valor direto (implicitamente o próprio campo)

      if (isPlainObject(value)) {
        // É chave recursiva
        nodeCopy[key] = toMatchConditionNode(
          value as SlimImplicitMatchNode,
          fieldIdentifier,
        );
      } else {
        if (!fieldIdentifier) {
          throw new Error(
            "Deve ser passado fieldIdentifier quando houver campo implícito",
          );
        }
        nodeCopy[key] = getImplicitNode(
          value as ImplicitExpected,
          fieldIdentifier,
        );
      }
    } else {
      nodeCopy[key] = toFieldMatchExpect(value as SlimValueCheck);
    }
  }

  return nodeCopy as Match;
}

function toFieldMatchExpect(slimExpect: SlimValueCheck): ValueCheck {
  // Assume array unitário de _anyOf quando passado valor único

  if (isPlainObject(slimExpect)) {
    // Já está na forma padrão
    if (MATCH_EXPECT_KEYS.some((key) => key in slimExpect))
      return { ...slimExpect } as ValueCheck;

    // Comparação com instância
    return { _anyOf: [{ ...slimExpect } as InstanceObject] };
  }

  // Comparação com valor
  const expectArray = Array.isArray(slimExpect) ? slimExpect : [slimExpect];

  return { _anyOf: expectArray };
}

function getImplicitNode(
  implicitExpected: ImplicitExpected,
  fieldIdentifier: string,
): Match {
  const expectArray = Array.isArray(implicitExpected)
    ? implicitExpected
    : [implicitExpected];

  return {
    [fieldIdentifier]: { _anyOf: expectArray },
  };
}
