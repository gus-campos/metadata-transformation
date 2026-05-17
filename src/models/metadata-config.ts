import z from "zod";

// TODO: Adicionar os campos, validar quando pode
// TODO: depois adicionar em Metadata, tipos diferentes de metadata??
// edithelp { _current, pt} (string)
// name { _current, pt} (string)
// minMultiplicity
// maxMultiplicity
// shiftable
// mask...??? id???
// maxLength
// placeholder { _current, pt} (string)
// e quando for decimal? tem mais possibilidades?
// quais outras opções podem causar novos campos no metadata?

export const schema_behavior = z.object({
  behavior: z.enum(["omitted", "mandatory", "editable", "displayed"]),
});

export const schema_behaviorProps = z.object({
  readonly: z.boolean().optional(),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

export const schema_layoutConfig = z.object({
  breakLine: z.boolean().optional(),
  size: z.enum(["sm", "md", "lg"]).optional(),
});

export const schema_selectOption = z.object({
  value: z.string(),
  identifier: z.string(),
});

export const schema_selectOptions = z.object({
  valueOptions: z.array(schema_selectOption).optional(),
});

export const schema_selectQuery = z.object({
  query: z.unknown().optional(),
});

export const schema_selectionConfig =
  schema_selectOptions.and(schema_selectQuery);

export const schema_metadataConfig = schema_layoutConfig.and(
  schema_behaviorProps.and(schema_selectionConfig),
);

export const METADATA_CONFIG_KEYS = {
  behavior: Object.keys(schema_behavior.shape) as (keyof Behavior)[],
  behaviorProps: Object.keys(
    schema_behaviorProps.shape,
  ) as (keyof BehaviorProps)[],
  layoutConfig: Object.keys(
    schema_layoutConfig.shape,
  ) as (keyof LayoutConfig)[],
  selectionConfig: [
    ...Object.keys(schema_selectOptions.shape),
    ...Object.keys(schema_selectQuery.shape),
  ] as (keyof SelectionConfig)[],
};

export const ALL_VALID_METADATA_CONFIG_KEYS = [
  ...METADATA_CONFIG_KEYS.behavior,
  ...METADATA_CONFIG_KEYS.behaviorProps,
  ...METADATA_CONFIG_KEYS.layoutConfig,
  ...METADATA_CONFIG_KEYS.selectionConfig,
] as const;

export type Behavior = z.infer<typeof schema_behavior>;
export type BehaviorProps = z.infer<typeof schema_behaviorProps>;
export type BehaviorConfig = Behavior | BehaviorProps;
export type LayoutConfig = z.infer<typeof schema_layoutConfig>;
export type SelectOption = z.infer<typeof schema_selectOption>;
export type SelectOptions = z.infer<typeof schema_selectOptions>;
export type SelectQuery = z.infer<typeof schema_selectQuery>;
export type SelectionConfig = z.infer<typeof schema_selectionConfig>;
export type MetadataConfig = z.infer<typeof schema_metadataConfig>;
