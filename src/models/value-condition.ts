import z from "zod";
import { schema_plainObject, schema_value } from "./common";
import { _file } from "zod/v4/core";



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

export const schema_if = z.function({
  input: z.tuple([schema_plainObject]),
  output: z.boolean(),
});

export const schema_valueConditionIf = z.object({
  _if: schema_if,
});

// Atualizar conforme houverem modificações nas tipagens
export const VALUE_IF_KEY = "_if";
export const VALUE_FIELD_KEY = "_field";
export const VALUE_MAIN_KEYS = [VALUE_FIELD_KEY, VALUE_IF_KEY] as const;
export const VALUE_SECONDARY_KEYS = [
  "_is",
  "_isNot",
  "_isIn",
  "_isNotIn"
] as const;

export const ALL_VALID_CONDITION_KEYS = [
  VALUE_IF_KEY,
  VALUE_FIELD_KEY,
  ...VALUE_FIELD_KEY,
  ...VALUE_SECONDARY_KEYS
] as const;

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
