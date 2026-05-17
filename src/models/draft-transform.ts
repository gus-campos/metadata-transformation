import { UnitDraftCondition } from "./draft-condition";
import { DraftConfig } from "./draft-config";

// TODO: Implementar validador
// TODO: Implementar avaliador
// TODO: Implementar testes

export type UnitFieldDraftTransform = DraftConfig | (UnitDraftCondition & DraftConfig);

export type FieldDraftTransform =
  | UnitFieldDraftTransform
  | UnitFieldDraftTransform[];

export type DraftTransform = Record<string, FieldDraftTransform>;
