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

type ImplicitExpected = Value | Value[];

export type SlimMultExpected = Expected | Expected[] | MultExpected;

export type SlimMatchNode = {
  // Quando tiver expect direto, está se referindo ao próprio campo
  _not?: SlimMatchNode | ImplicitExpected;
  _some?: SlimMatchNode | ImplicitExpected;

  [identifier: string]:
    | SlimMultExpected
    // Na prática não devem ser aceitos:
    | undefined
    | SlimMatchNode;
};

export type SlimMatchCondition = {
  _match?: SlimMatchNode | ImplicitExpected;
};

export function toMatchCondition(
  slimCondition: SlimMatchCondition,
  fieldIdentifier: string,
): MatchCondition {
  const { _match } = slimCondition;
  if (_match === undefined) return {};

  // Se for valor esperado
  if (!isPlainObject(_match)) {
    return { _match: getImplicitNode(_match, fieldIdentifier) };
  }

  return { _match: toMatchConditionNode(_match, fieldIdentifier) };
}

function toMatchConditionNode(
  slimNode: SlimMatchNode,
  fieldIdentifier: string,
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
          value as SlimMatchNode,
          fieldIdentifier,
        );
      } else {
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
