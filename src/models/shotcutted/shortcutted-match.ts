import {
  FieldMatchExpect,
  MATCH_CONDITION_KEYS,
  MATCH_EXPECT_KEYS,
  MatchCondition,
  MatchConditionNode,
  MatchSimpleExpect,
} from "../pure/instance-condition";
import { InstanceObject } from "../pure/common";
import { isPlainObject } from "../../utils/is-plain-object";

// Se passado _allOf com mais de um item para campo não múltiplo, vai falhar sempre
export type ShortcuttedFieldMatchExpect = MatchSimpleExpect | FieldMatchExpect;

export type ShortcuttedMatchConditionNode = {
  _not?: ShortcuttedMatchConditionNode;
  _some?: ShortcuttedMatchConditionNode;

  [identifier: string]:
    | ShortcuttedFieldMatchExpect
    // FIXME: Na prática não devem ser aceitos:
    | undefined
    | ShortcuttedMatchConditionNode;
};

export type ShortcuttedMatchCondition = {
  _match?: ShortcuttedMatchConditionNode;
};

export function toMatchCondition(
  shortcuttedCondition: ShortcuttedMatchCondition,
): MatchCondition {
  const { _match } = shortcuttedCondition;
  if (_match === undefined) return {};
  return { _match: toMatchConditionNode(_match) };
}

function toMatchConditionNode(
  shortcuttedNode: ShortcuttedMatchConditionNode,
): MatchConditionNode {
  const nodeCopy = { ...shortcuttedNode };

  // Chamar recursivamente até chegar no ShortcuttedFieldMatchExpect
  // converter

  for (const [key, value] of Object.entries(shortcuttedNode)) {
    if ((MATCH_CONDITION_KEYS as string[]).includes(key)) {
      nodeCopy[key] = toMatchConditionNode(value as ShortcuttedMatchConditionNode);
    } else {
      nodeCopy[key] = toFieldMatchExpect(value as ShortcuttedFieldMatchExpect);
    }
  }

  return nodeCopy as MatchConditionNode;
}

function toFieldMatchExpect(
  shortcuttedExpect: ShortcuttedFieldMatchExpect,
): FieldMatchExpect {
  // Assume array unitário de _anyOf quando passado valor único

  if (isPlainObject(shortcuttedExpect)) {
    // Já está na forma padrão
    if (MATCH_EXPECT_KEYS.some((key) => key in shortcuttedExpect))
      return shortcuttedExpect as FieldMatchExpect;

    // Comparação com instância
    return { _anyOf: [shortcuttedExpect as InstanceObject] };
  }

  // Comparação com valor
  return { _anyOf: [shortcuttedExpect] };
}
