import {
  MultExpected,
  MATCH_CONDITION_KEYS,
  MATCH_EXPECT_KEYS,
  MatchCondition,
  MatchNode,
  Expected,
} from "../pure/instance-condition";
import { InstanceObject, Value } from "../pure/common";
import { isPlainObject } from "../../utils/is-plain-object";

export type SlimMultExpected = Expected | Expected[] | MultExpected;

export type SlimMatchNode = {
  // Quando tiver expect direto, está se referindo ao próprio campo
  _not?: SlimMatchNode;
  _some?: SlimMatchNode;

  [identifier: string]:
    | SlimMultExpected
    // Na prática não devem ser aceitos:
    | undefined
    | SlimMatchNode;
};

export type SlimMatchCondition = {
  _match?: SlimMatchNode;
};

// WITH INFERENCE

type ImplicitExpected = Value | Value[];

export type SlimImplicitMatchNode = {
  // Quando tiver expect direto, está se referindo ao próprio campo
  _not?: SlimImplicitMatchNode | ImplicitExpected;
  _some?: SlimImplicitMatchNode | ImplicitExpected;

  [identifier: string]:
    | SlimMultExpected
    // Na prática não devem ser aceitos:
    | undefined
    | SlimImplicitMatchNode;
};

export type SlimImplicitMatchCondition = {
  _match?: SlimImplicitMatchNode | ImplicitExpected;
};

export function toMatchCondition(
  slimCondition: SlimImplicitMatchCondition,
  fieldIdentifier: string | null = null,
): MatchCondition {
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
): MatchNode {
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
      nodeCopy[key] = toFieldMatchExpect(value as SlimMultExpected);
    }
  }

  return nodeCopy as MatchNode;
}

function toFieldMatchExpect(slimExpect: SlimMultExpected): MultExpected {
  // Assume array unitário de _anyOf quando passado valor único

  if (isPlainObject(slimExpect)) {
    // Já está na forma padrão
    if (MATCH_EXPECT_KEYS.some((key) => key in slimExpect))
      return { ...slimExpect } as MultExpected;

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
): MatchNode {
  const expectArray = Array.isArray(implicitExpected)
    ? implicitExpected
    : [implicitExpected];

  return {
    [fieldIdentifier]: { _anyOf: expectArray },
  };
}
