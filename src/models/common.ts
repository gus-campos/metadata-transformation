import z from "zod";
import {
  schema_behaviorProps,
  schema_layoutConfig,
  schema_selectOptions,
  schema_selectQuery,
} from "./metadata-config";

// A compatibilidade deste tipo com a tipagem do esquema abaixo
// deve ser mantida manualmente, pois não é verificada
export type Value =
  | { [key: string]: Value }
  | number
  | boolean
  | Date
  | null;

export const schema_value: z.ZodType<Value> = z.lazy(() =>
  z.union([
    z.record(z.string(), schema_value), // recursão tardia
    z.number(),
    z.boolean(),
    z.date(),
    z.null(),
  ]),
);

// =================================================================================================

// 3. O GUARDA-COSTAS (Verificação Estática Estrita)
// TODO: Verificar que está funcionando 
type AssertEqual<T, U> = T extends U ? (U extends T ? true : false) : false;
const _assertTypesAreEqual: AssertEqual<Value, z.infer<typeof schema_value>> = true;

// =================================================================================================

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