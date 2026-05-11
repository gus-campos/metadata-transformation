import { UnitDraftCondition } from "./draft-condition";
import { DraftConfig } from "./draft-config";

export type ConditionalValueSet = UnitDraftCondition & DraftConfig;

export type FieldDraftTransform =
  | DraftConfig
  | ConditionalValueSet
  | ConditionalValueSet[];

export type DraftTransform = Record<string, FieldDraftTransform>;
