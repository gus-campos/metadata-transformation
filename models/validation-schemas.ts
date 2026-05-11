import { z } from "zod";
import { strictAndHelper } from "../src/utils/flatten-union";

// Behavior

const schema_behavior = z
  .object({
    behavior: z.enum(["omitted", "mandatory", "editable", "displayed"]),
  })
  .strict();

const schema_behaviorProps = z
  .object({
    readonly: z.boolean().optional(),
    required: z.boolean().optional(),
    hidden: z.boolean().optional(),
  })
  .strict();

const schema_behaviorConfig = z.union([schema_behavior, schema_behaviorProps]);

// Layout

const schema_layoutConfig = z
  .object({
    breakLine: z.boolean().optional(),
    size: z.enum(["sm", "md", "lg"]).optional(),
  })
  .strict();

// Selection

const schema_selectOption = z
  .object({
    value: z.string(),
    identifier: z.string(),
  })
  .strict();

const schema_selectOptions = z
  .object({
    options: z.array(schema_selectOption).optional(),
  })
  .strict();

const schema_selectQuery = z
  .object({
    query: z.unknown().optional(),
  })
  .strict();

const schema_selectionConfig = z
  .object({
    ...schema_selectOptions.shape,
    ...schema_selectQuery.shape,
  })
  .strict();

// Field

const schema_metadataProps = z
  .object({
    ...schema_behaviorProps.required().shape,
    ...schema_layoutConfig.required().shape,
    options: z.array(schema_selectOption),
    query: z.unknown(),
  })
  .strict();

const schema_metadataConfig = strictAndHelper(
  schema_behaviorConfig,
  z.object({
    ...schema_layoutConfig.shape,
    ...schema_selectionConfig.shape,
  }),
);

const schema_value: z.ZodType<unknown> = z.lazy(() =>
  z.union([schema_instanceObject, z.boolean(), z.string(), z.date(), z.null()]),
);

const schema_instanceObject: z.ZodType<unknown> = z.lazy(() =>
  z.record(z.string(), schema_value),
);

// Fields

const schema_fieldId = z
  .object({
    _field: z.string().optional(),
  })
  .strict();

const schema_fieldsIds = z
  .object({
    _fields: z.array(z.string()),
  })
  .strict();

// Conditions

const schema_valueConditionIs = z
  .object({
    ...schema_fieldId.shape,
    _is: schema_value,
  })
  .strict();

const schema_valueConditionIsNot = z
  .object({
    ...schema_fieldId.shape,
    _isNot: schema_value,
  })
  .strict();

const schema_valueConditionIsIn = z
  .object({
    ...schema_fieldId.shape,
    _isIn: z.array(schema_value),
  })
  .strict();

const schema_valueConditionIsNotIn = z
  .object({
    ...schema_fieldId.shape,
    _isNotIn: z.array(schema_value),
  })
  .strict();

const schema_valueConditionAre = z
  .object({
    ...schema_fieldsIds.shape,
    _are: z.array(schema_value),
  })
  .strict();

const schema_valueConditionSomeIs = z
  .object({
    ...schema_fieldsIds.shape,
    _someIs: schema_value,
  })
  .strict();

const schema_valueConditionIf = z
  .object({
    _if: z.function({
      input: z.tuple([schema_instanceObject]),
      output: z.boolean(),
    }),
  })
  .strict();

// Condition

const schema_unitValueCondition = z.union([
  schema_valueConditionIs,
  schema_valueConditionIsNot,
  schema_valueConditionIsIn,
  schema_valueConditionIsNotIn,
  schema_valueConditionAre,
  schema_valueConditionSomeIs,
  schema_valueConditionIf,
]);

// Composed

// Futuramente será implementado e usado
const schema_composedValueCondition: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    schema_unitValueCondition,
    z.object({ _all: z.array(schema_unitValueCondition) }),
    z.object({ _any: z.array(schema_unitValueCondition) }),
    z.object({ _not: schema_unitValueCondition }),
  ]),
);

const schema_unitChangedCondition = z.union([
  z.object({ _fieldChanged: z.string().optional() }).strict(),
  z.object({ _someFieldChanged: z.array(z.string()).optional() }).strict(),
  z
    .object({
      _if: z.function({
        input: z.tuple([schema_instanceObject, schema_instanceObject]),
        output: z.boolean(),
      }),
    })
    .strict(),
]);

const schema_unitDraftCondition = z.union([
  schema_unitChangedCondition,
  schema_unitValueCondition,
]);

const schema_draftConfig = z
  .object({
    setValue: schema_value,
  })
  .strict();

const schema_conditionalValueSet = strictAndHelper(
  schema_unitDraftCondition,
  schema_draftConfig,
);

const schema_fieldDraftTransform = z.union([
  schema_draftConfig,
  schema_conditionalValueSet,
  z.array(schema_conditionalValueSet),
]);

const schema_unitMetadataCondition = schema_unitValueCondition;

// Interface expota

const schema_conditionalMetadata = strictAndHelper(
  schema_unitMetadataCondition,
  schema_metadataConfig,
);

export const schema_fieldMetadataTransform = z.union([
  schema_metadataConfig,
  schema_conditionalMetadata,
  z.array(schema_conditionalMetadata),
]);

export const schema_metadataTransform = z.record(
  z.string(),
  schema_fieldMetadataTransform,
);

export const schema_metadata = z
  .object({
    fields: z.record(z.string(), schema_metadataProps),
  })
  .strict();

export const schema_draftTransform = z.record(
  z.string(),
  schema_fieldDraftTransform,
);
