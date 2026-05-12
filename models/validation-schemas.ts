import { z } from "zod";
import { strictAndHelper } from "../src/utils/flatten-union";

// Behavior

const schema_behavior = z
  .object({
    behavior: z.enum(["omitted", "mandatory", "editable", "displayed"], {
      error: "Behavior inválido",
    }),
  })
  .strict();

const schema_behaviorProps = z
  .object({
    readonly: z.boolean({
      error: "O campo 'readonly' deve ser booleano",
    }).optional(),

    required: z.boolean({
      error: "O campo 'required' deve ser booleano",
    }).optional(),

    hidden: z.boolean({
      error: "O campo 'hidden' deve ser booleano",
    }).optional(),
  })
  .strict();

const schema_behaviorConfig = z.union(
  [schema_behavior, schema_behaviorProps],
  {
    error: "Configuração de comportamento inválida",
  },
);

// Layout

const schema_layoutConfig = z
  .object({
    breakLine: z.boolean({
      error: "O campo 'breakLine' deve ser booleano",
    }).optional(),

    size: z
      .enum(["sm", "md", "lg"], {
        error: "O campo 'size' deve ser 'sm', 'md' ou 'lg'",
      })
      .optional(),
  })
  .strict();

// Selection

const schema_selectOption = z
  .object({
    value: z.string({
      error: "O campo 'value' deve ser string",
    }),

    identifier: z.string({
      error: "O campo 'identifier' deve ser string",
    }),
  })
  .strict();

const schema_selectOptions = z
  .object({
    options: z
      .array(schema_selectOption, {
        error: "O campo 'options' deve ser um array",
      })
      .optional(),
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

    options: z.array(schema_selectOption, {
      error: "O campo 'options' deve ser um array de opções válidas",
    }),

    query: z.unknown(),
  })
  .strict();

const schema_metadataConfig = strictAndHelper(
  schema_behaviorConfig,
  z.object({
    ...schema_layoutConfig.shape,
    ...schema_selectionConfig.shape,
  }),
  "Configuração de metadata inválida",
);

const schema_value: z.ZodType<unknown> = z.lazy(() =>
  z.union(
    [
      schema_instanceObject,
      z.boolean({
        error: "Valor booleano inválido",
      }),
      z.string({
        error: "Valor string inválido",
      }),
      z.date({
        error: "Valor date inválido",
      }),
      z.null(),
    ],
    {
      error: "Valor inválido",
    },
  ),
);

const schema_instanceObject: z.ZodType<unknown> = z.lazy(() =>
  z.record(
    z.string({
      error: "A chave do objeto deve ser string",
    }),
    schema_value,
  ),
);

// Fields

const schema_fieldId = z
  .object({
    _field: z
      .string({
        error: "O campo '_field' deve ser string",
      })
      .optional(),
  })
  .strict();

const schema_fieldsIds = z
  .object({
    _fields: z.array(z.string(), {
      error: "O campo '_fields' deve ser um array de strings",
    }),
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
    _isIn: z.array(schema_value, {
      error: "O campo '_isIn' deve ser um array",
    }),
  })
  .strict();

const schema_valueConditionIsNotIn = z
  .object({
    ...schema_fieldId.shape,
    _isNotIn: z.array(schema_value, {
      error: "O campo '_isNotIn' deve ser um array",
    }),
  })
  .strict();

const schema_valueConditionAre = z
  .object({
    ...schema_fieldsIds.shape,

    _are: z.array(schema_value, {
      error: "O campo '_are' deve ser um array",
    }),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data._are.length !== data._fields.length) {
      ctx.addIssue({
        code: "custom",
        message:
          "O número de valores em '_are' deve corresponder ao número de campos em '_fields'",
        path: ["_are"],
      });
    }
  });

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
      output: z.boolean({
        error: "A função '_if' deve retornar boolean",
      }),
    }),
  })
  .strict();

// Condition

const schema_unitValueCondition = z.union(
  [
    schema_valueConditionIs,
    schema_valueConditionIsNot,
    schema_valueConditionIsIn,
    schema_valueConditionIsNotIn,
    schema_valueConditionAre,
    schema_valueConditionSomeIs,
    schema_valueConditionIf,
  ],
  {
    error: "Condição de valor inválida",
  },
);

// Composed

// Futuramente será implementado e usado
const schema_composedValueCondition: z.ZodType<unknown> = z.lazy(() =>
  z.union(
    [
      schema_unitValueCondition,

      z.object({
        _all: z.array(schema_unitValueCondition, {
          error: "O campo '_all' deve ser um array",
        }),
      }),

      z.object({
        _any: z.array(schema_unitValueCondition, {
          error: "O campo '_any' deve ser um array",
        }),
      }),

      z.object({
        _not: schema_unitValueCondition,
      }),
    ],
    {
      error: "Condição composta inválida",
    },
  ),
);

const schema_unitChangedCondition = z.union(
  [
    z
      .object({
        _fieldChanged: z
          .string({
            error: "O campo '_fieldChanged' deve ser string",
          })
          .optional(),
      })
      .strict(),

    z
      .object({
        _someFieldChanged: z.array(z.string(), {
          error: "O campo '_someFieldChanged' deve ser um array de strings",
        }).optional(),
      })
      .strict(),

    z
      .object({
        _if: z.function({
          input: z.tuple([
            schema_instanceObject,
            schema_instanceObject,
          ]),

          output: z.boolean({
            error: "A função '_if' deve retornar boolean",
          }),
        }),
      })
      .strict(),
  ],
  {
    error: "Condição de alteração inválida",
  },
);

const schema_unitDraftCondition = z.union(
  [schema_unitChangedCondition, schema_unitValueCondition],
  {
    error: "Condição de draft inválida",
  },
);

const schema_draftConfig = z
  .object({
    setValue: schema_value,
  })
  .strict();

const schema_conditionalValueSet = strictAndHelper(
  schema_unitDraftCondition,
  schema_draftConfig,
  "Configuração condicional de valor inválida",
);

const schema_fieldDraftTransform = z.union(
  [
    schema_draftConfig,
    schema_conditionalValueSet,
    z.array(schema_conditionalValueSet, {
      error: "Transformações condicionais inválidas",
    }),
  ],
  {
    error: "Transformação de draft inválida",
  },
);

const schema_unitMetadataCondition = schema_unitValueCondition;

// Interface exporta

const schema_conditionalMetadata = strictAndHelper(
  schema_unitMetadataCondition,
  schema_metadataConfig,
  "Configuração condicional de metadata inválida",
);

export const schema_fieldMetadataTransform = z.union(
  [
    schema_metadataConfig,
    schema_conditionalMetadata,
    z.array(schema_conditionalMetadata, {
      error: "Metadados condicionais inválidos",
    }),
  ],
  {
    error: "Transformação de metadados inválida",
  },
);

export const schema_metadataTransform = z.record(
  z.string({
    error: "A chave do metadata transform deve ser string",
  }),
  schema_fieldMetadataTransform,
);

export const schema_metadata = z
  .object({
    fields: z.record(
      z.string({
        error: "A chave do campo deve ser string",
      }),
      schema_metadataProps,
    ),
  })
  .strict();

export const schema_draftTransform = z.record(
  z.string({
    error: "A chave do draft transform deve ser string",
  }),
  schema_fieldDraftTransform,
);