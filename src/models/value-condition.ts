import z from "zod";
import { schema_instanceObject, schema_value } from "./common";

// Fields
export const schema_fieldId = z.object({
  _field: z.string().optional(),
});

export const schema_fieldsIds = z.object({
  _fields: z.array(z.string()),
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

export const schema_valueConditionAre = schema_fieldsIds.extend({
  _are: z.array(schema_value),
});

export const schema_valueConditionSomeIs = schema_fieldsIds.extend({
  _someIs: schema_value,
});

export const schema_valueConditionIf = z.object({
  _if: z.function({
    input: z.tuple([schema_instanceObject]),
    output: z.boolean(),
  }),
});

// Fields
export type FieldId = z.infer<typeof schema_fieldId>;
export type FieldsIds = z.infer<typeof schema_fieldsIds>;

// Conditions
export type ValueConditionIs = z.infer<typeof schema_valueConditionIs>;
export type ValueConditionIsNot = z.infer<typeof schema_valueConditionIsNot>;
export type ValueConditionIsIn = z.infer<typeof schema_valueConditionIsIn>;
export type ValueConditionIsNotIn = z.infer<typeof schema_valueConditionIsNotIn>;
export type ValueConditionAre = z.infer<typeof schema_valueConditionAre>;
export type ValueConditionSomeIs = z.infer<typeof schema_valueConditionSomeIs>;
export type ValueConditionIf = z.infer<typeof schema_valueConditionIf>;

// => Tipos que devem ser validados manualmente

export type UnitValueCondition =
  | ValueConditionIs
  | ValueConditionIsNot
  | ValueConditionIsIn
  | ValueConditionIsNotIn
  | ValueConditionAre
  | ValueConditionSomeIs
  | ValueConditionIf;

// Implementação futura

type ComposedValueCondition =
  | UnitValueCondition
  | { _all: UnitValueCondition[] }
  | { _any: UnitValueCondition[] }
  | { _not: UnitValueCondition };
