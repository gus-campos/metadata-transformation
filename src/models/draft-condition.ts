import { ALL_VALID_CHANGE_CONDITION_KEYS, UnitChangeCondition } from "./change-condition";
import {
  UnitValueCondition,
  VALUE_MAIN_KEYS,
  VALUE_SECONDARY_KEYS,
} from "./value-condition";

// NOTA SOBRE INTERSEÇÃO NO UNION:
// A chave _if existe tanto no UnitChangeCondition quanto no UnitValueCondition
// Para isso, no draft, o if é sempre avaliado como sendo vindo do changed
// já que a assinatura do if no changed é um superset do if no value
// e o comportamento identico é garantido

export const DRAFT_CONDITION_VALID_KEYS = [
  ...VALUE_MAIN_KEYS,
  ...VALUE_SECONDARY_KEYS,
  ...ALL_VALID_CHANGE_CONDITION_KEYS,
] as const;

export type UnitDraftCondition = UnitChangeCondition | UnitValueCondition;

// Implementação futura
type ComposedDraftCondition =
  | UnitDraftCondition
  | { _all: UnitDraftCondition[] }
  | { _any: UnitDraftCondition[] }
  | { _not: UnitDraftCondition };
