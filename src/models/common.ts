import z from "zod";
import {
  schema_behaviorProps,
  schema_layoutConfig,
  schema_selectOptions,
  schema_selectQuery,
} from "./metadata-config";

// Manter equivalência entre schema e tipagem explicitada
export type Value =
  | { [key: string]: Value }
  | number
  | boolean
  | string
  | Date
  | null;

// Se mudar tipagem, lembrar de mudar mensagem de erro também!
export const schema_value: z.ZodType<Value> = z.lazy(() =>
  z.union(
    [
      z.number(),
      z.boolean(),
      z.string(),
      z.date(),
      z.null(),
      schema_plainObject, // recursão tardia
    ],
    {
      error: () => ({
        message: `Únicos valores aceitos são: number, boolean, string, Date, null ou objeto.`,
      }),
    },
  ),
);

export const schema_plainObject = z.record(z.string(), schema_value);

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

export type PlainObject = z.infer<typeof schema_plainObject>;
export type MetadataField = z.infer<typeof schema_metadataField>;
export type Metadata = z.infer<typeof schema_metadata>;
