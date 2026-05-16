import z from "zod";
import { schema_instanceObject, schema_value } from "./common";

export const VALUE_MAIN_KEYS = ["_field"] as const;

export const VALUE_SECONDARY_KEYS = [
  "_is",
  "_isNot",
  "_isIn",
  "_isNotIn",
  "_if",
] as const;

export const VALUE_SECONDARIES_BY_PRIMARIES_KEYS: Record<
  (typeof VALUE_MAIN_KEYS)[number],
  ((typeof VALUE_SECONDARY_KEYS)[number][])
> = {
  _field: ["_is", "_isNot", "_isIn", "_isNotIn", "_if"] as const,
};

// Fields
export const schema_fieldId = z.object({
  _field: z.string().optional(),
});

// Conditions
export const schema_valueConditionIs = schema_fieldId.extend({
  _is: schema_value,
});

export const schema_valueConditionIsNot = schema_fieldId.extend({
  _isNot: schema_value,
});

export const schema_valueConditionIsIn = schema_fieldId.extend({
  _isIn: z.array(schema_value),
});

export const schema_valueConditionIsNotIn = schema_fieldId.extend({
  _isNotIn: z.array(schema_value),
});

export const schema_valueConditionIf = z.object({
  _if: z.function({
    input: z.tuple([schema_instanceObject]),
    output: z.boolean(),
  }),
});

// Fields
export type FieldId = z.infer<typeof schema_fieldId>;

// Conditions
export type ValueConditionIs = z.infer<typeof schema_valueConditionIs>;
export type ValueConditionIsNot = z.infer<typeof schema_valueConditionIsNot>;
export type ValueConditionIsIn = z.infer<typeof schema_valueConditionIsIn>;
export type ValueConditionIsNotIn = z.infer<
  typeof schema_valueConditionIsNotIn
>;
export type ValueConditionIf = z.infer<typeof schema_valueConditionIf>;

// Union validada manualmente

export type UnitValueCondition =
  | ValueConditionIs
  | ValueConditionIsNot
  | ValueConditionIsIn
  | ValueConditionIsNotIn
  | ValueConditionIf;

// Implementação futura

type ComposedValueCondition =
  | UnitValueCondition
  | { _all: UnitValueCondition[] }
  | { _any: UnitValueCondition[] }
  | { _not: UnitValueCondition };
