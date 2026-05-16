import z from "zod";
import {
  schema_behaviorProps,
  schema_layoutConfig,
  schema_selectOptions,
  schema_selectQuery,
} from "./metadata-config";

// Esta tipagem deve coincidir com a tipagem do especificado pelo schema abaixo
// É necessário que se garanta manualmente isto, pois o ts não reclamará
// caso haja algo a mais no tipo declarado explicitamente
export type Value =
  | { [key: string]: Value }
  | number
  | boolean
  | string
  | Date
  | null;

// Manter equivalência deste schema com a tipagem explicitada acima
export const schema_value: z.ZodType<Value> = z.lazy(() =>
  z.union([
    z.record(z.string(), schema_value), // recursão tardia
    z.number(),
    z.boolean(),
    z.string(),
    z.date(),
    z.null(),
  ]),
);

export const schema_instanceObject = z.record(z.string(), schema_value);

export const schema_metadataField = schema_layoutConfig
  .required()
  .and(
    schema_behaviorProps
      .required()
      .and(schema_selectOptions.required().and(schema_selectQuery.required())),
  );

export const schema_metadata = z.object({
  fields: z.record(z.string(), schema_metadataField),
});

export type InstanceObject = z.infer<typeof schema_instanceObject>;
export type MetadataField = z.infer<typeof schema_metadataField>;
export type Metadata = z.infer<typeof schema_metadata>;