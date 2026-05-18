import z from "zod";
import { schema_plainObject } from "./common";

export const schema_changeConditionChanged = z.object({
  _changed: z.string(),
});

export const schema_changeConditionAnyChanged = z.object({
  _anyChanged: z.array(z.string()),
});

export const schema_changeConditionIfPredicate = z.function({
  input: z.tuple([schema_plainObject, schema_plainObject]),
  output: z.boolean(),
});

export const schema_changeConditionIf = z.object({
  _if: schema_changeConditionIfPredicate,
});

export const ALL_VALID_CHANGE_KEYS = [
  "_changed",
  "_anyChanged",
  "_if",
] as const;

export type ChangeConditionChanged = z.infer<
  typeof schema_changeConditionChanged
>;
export type ChangeConditionAnyChanged = z.infer<
  typeof schema_changeConditionAnyChanged
>;
export type ChangeConditionIf = z.infer<typeof schema_changeConditionIf>;

// Validado manualmente
export type UnitChangeCondition =
  | ChangeConditionChanged
  | ChangeConditionAnyChanged
  | ChangeConditionIf;
