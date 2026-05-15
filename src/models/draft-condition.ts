import { UnitChangedCondition } from "./changed-condition";
import { UnitValueCondition } from "./value-condition";

// => Tipos que devem ser validados manualmente

export type UnitDraftCondition = UnitChangedCondition | UnitValueCondition;

// Implementação futura
type ComposedDraftCondition =
  | UnitDraftCondition
  | { _all: UnitDraftCondition[] }
  | { _any: UnitDraftCondition[] }
  | { _not: UnitDraftCondition };
