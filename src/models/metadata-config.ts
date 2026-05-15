import z from "zod";


export const schema_behavior = z.object({
  behavior: z.enum(["omitted", "mandatory", "editable", "displayed"]),
});

export const schema_behaviorProps = z.object({
  readonly: z.boolean().optional(),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

export const schema_layoutConfig = z.object({
  breakline: z.boolean().optional(),
  size: z.enum(["sm", "md", "lg"]).optional(),
});

export const schema_selectOption = z.object({
  value: z.string(),
  identifier: z.string(),
});

export const schema_selectOptions = z.object({
  options: z.array(schema_selectOption).optional(),
});

export const schema_selectQuery = z.object({
  query: z.unknown(),
});

export const schema_selectionConfig = schema_selectOptions.and(schema_selectQuery);

export const schema_metadataConfig = schema_layoutConfig.and(
  schema_behaviorProps.and(schema_selectionConfig),
);

export type Behavior = z.infer<typeof schema_behavior>;
export type BehaviorProps = z.infer<typeof schema_behaviorProps>
export type BehaviorConfig = Behavior | BehaviorProps;
export type LayoutConfig = z.infer<typeof schema_layoutConfig>;
export type SelectOption = z.infer<typeof schema_selectOption>;
export type SelectOptions = z.infer<typeof schema_selectOptions>;
export type SelectQuery = z.infer<typeof schema_selectQuery>;
export type SelectionConfig = z.infer<typeof schema_selectionConfig>;
export type MetadataConfig = z.infer<typeof schema_metadataConfig>;
