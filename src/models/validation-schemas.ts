import { z } from "zod";
import { strictAndHelper } from "../utils/flatten-union";

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

// Objeto achatado com superRefine no lugar do z.union — garante que
// strictAndHelper ainda enxerga o .shape, e o refine cuida da exclusividade.
const schema_behaviorConfig = z
  .object({
    behavior: z.enum(["omitted", "mandatory", "editable", "displayed"]).optional(),
    readonly: z.boolean().optional(),
    required: z.boolean().optional(),
    hidden: z.boolean().optional(),
  })
  .strict()
  .superRefine(refineBehaviorConfig);

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

// Condition — z.unknown().superRefine para garantir que o refine sempre roda,
// mesmo quando nenhuma branch do z.union original teria passado.

const schema_unitValueCondition = z
  .unknown()
  .superRefine(refineUnitValueCondition);

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

const schema_unitChangedCondition = z
  .unknown()
  .superRefine(refineUnitChangedCondition);

const schema_unitDraftCondition = z
  .unknown()
  .superRefine(refineUnitDraftCondition);

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

const schema_fieldDraftTransform = z
  .unknown()
  .superRefine(refineFieldDraftTransform);

const schema_unitMetadataCondition = schema_unitValueCondition;

// Interface exporta

const schema_conditionalMetadata = strictAndHelper(
  schema_unitMetadataCondition,
  schema_metadataConfig,
  "Configuração condicional de metadata inválida",
);

export const schema_fieldMetadataTransform = z
  .unknown()
  .superRefine(refineFieldMetadataTransform);

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

// ============================================================
// Refine functions
//
// Declaradas com `function` (não `const`) para serem içadas (hoisted)
// ao topo do módulo — os schemas acima podem referenciá-las antes
// desta linha no código-fonte sem problema, pois no momento em que
// qualquer validação for executada todos os `const` já terão sido
// inicializados.
// ============================================================

// --- Constantes de discriminante ---

const BEHAVIOR_PROP_KEYS = ["readonly", "required", "hidden"] as const;
type BehaviorPropKey = (typeof BEHAVIOR_PROP_KEYS)[number];

const VALUE_CONDITION_KEYS = [
  "_is",
  "_isNot",
  "_isIn",
  "_isNotIn",
  "_are",
  "_someIs",
  "_if",
] as const;
type ValueConditionKey = (typeof VALUE_CONDITION_KEYS)[number];

// _if aparece nas duas listas; as duas mais específicas vêm primeiro
// para que a detecção de intenção priorize chaves não-ambíguas.
const CHANGED_CONDITION_KEYS = [
  "_fieldChanged",
  "_someFieldChanged",
  "_if",
] as const;
type ChangedConditionKey = (typeof CHANGED_CONDITION_KEYS)[number];

// --- Utilitários ---

function assertIsObject(
  val: unknown,
  ctx: z.RefinementCtx,
  label: string,
): val is Record<string, unknown> {
  if (typeof val !== "object" || val === null || Array.isArray(val)) {
    ctx.addIssue({
      code: "custom",
      message: `${label} deve ser um objeto`,
    });
    return false;
  }
  return true;
}

function forwardIssues(
  result: z.ZodSafeParseResult<unknown>,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue({
        ...issue,
        path: [...pathPrefix, ...(issue.path ?? [])],
      });
    }
  }
}

// --- Refines ---

function refineBehaviorConfig(
  val: Record<string, unknown>,
  ctx: z.RefinementCtx,
): void {
  const hasBehavior = "behavior" in val;
  const presentProps = BEHAVIOR_PROP_KEYS.filter((k) => k in val);

  if (hasBehavior && presentProps.length > 0) {
    ctx.addIssue({
      code: "custom",
      message:
        `'behavior' não pode ser combinado com: '${presentProps.join("', '")}'. ` +
        `Use 'behavior' sozinho para presets ou as propriedades individuais para controle granular`,
    });
    return;
  }

  if (hasBehavior) {
    // Delega ao schema específico para reutilizar as mensagens de campo
    forwardIssues(schema_behavior.safeParse(val), ctx);
    return;
  }

  forwardIssues(schema_behaviorProps.safeParse(val), ctx);
}

function refineUnitValueCondition(
  val: unknown,
  ctx: z.RefinementCtx,
): void {
  if (!assertIsObject(val, ctx, "Condição de valor")) return;

  const present = VALUE_CONDITION_KEYS.filter((k) => k in val);

  if (present.length === 0) {
    ctx.addIssue({
      code: "custom",
      message:
        `Condição de valor requer exatamente uma das chaves: ${VALUE_CONDITION_KEYS.join(", ")}`,
    });
    return;
  }

  if (present.length > 1) {
    ctx.addIssue({
      code: "custom",
      message:
        `Apenas uma chave de condição pode estar presente por vez. ` +
        `Encontradas: ${present.join(", ")}`,
    });
    return;
  }

  const key = present[0] as ValueConditionKey;

  const schemaByKey: Record<ValueConditionKey, z.ZodTypeAny> = {
    _is:       schema_valueConditionIs,
    _isNot:    schema_valueConditionIsNot,
    _isIn:     schema_valueConditionIsIn,
    _isNotIn:  schema_valueConditionIsNotIn,
    _are:      schema_valueConditionAre,
    _someIs:   schema_valueConditionSomeIs,
    _if:       schema_valueConditionIf,
  };

  forwardIssues(schemaByKey[key].safeParse(val), ctx);
}

function refineUnitChangedCondition(
  val: unknown,
  ctx: z.RefinementCtx,
): void {
  if (!assertIsObject(val, ctx, "Condição de alteração")) return;

  const present = CHANGED_CONDITION_KEYS.filter((k) => k in val);

  if (present.length === 0) {
    ctx.addIssue({
      code: "custom",
      message:
        `Condição de alteração requer uma das chaves: ${CHANGED_CONDITION_KEYS.join(", ")}`,
    });
    return;
  }

  if (present.length > 1) {
    ctx.addIssue({
      code: "custom",
      message:
        `Apenas uma chave de condição de alteração pode estar presente por vez. ` +
        `Encontradas: ${present.join(", ")}`,
    });
    return;
  }
}

function refineUnitDraftCondition(
  val: unknown,
  ctx: z.RefinementCtx,
): void {
  if (!assertIsObject(val, ctx, "Condição de draft")) return;

  // Chaves exclusivas de cada tipo (excluindo _if que é compartilhado)
  const exclusiveValueKeys = VALUE_CONDITION_KEYS.filter(
    (k) => k !== "_if" && k in val,
  ) as ValueConditionKey[];

  const exclusiveChangedKeys = CHANGED_CONDITION_KEYS.filter(
    (k) => k !== "_if" && k in val,
  ) as ChangedConditionKey[];

  const hasIf = "_if" in val;

  const isValueCondition  = exclusiveValueKeys.length > 0;
  const isChangedCondition = exclusiveChangedKeys.length > 0;

  // Combinação impossível
  if (isValueCondition && isChangedCondition) {
    ctx.addIssue({
      code: "custom",
      message:
        `Não é possível combinar condições de valor (${exclusiveValueKeys.join(", ")}) ` +
        `com condições de alteração (${exclusiveChangedKeys.join(", ")})`,
    });
    return;
  }

  // Nenhuma chave de condição encontrada
  if (!isValueCondition && !isChangedCondition && !hasIf) {
    ctx.addIssue({
      code: "custom",
      message:
        `Condição de draft requer uma chave de condição.\n` +
        `  Condições de valor:    ${VALUE_CONDITION_KEYS.join(", ")}\n` +
        `  Condições de alteração: ${CHANGED_CONDITION_KEYS.join(", ")}`,
    });
    return;
  }

  // Delega ao refine correto para validar o restante do objeto
  if (isChangedCondition) {
    refineUnitChangedCondition(val, ctx);
  } else {
    // isValueCondition ou apenas _if — trata como condição de valor por padrão
    refineUnitValueCondition(val, ctx);
  }
}

function refineFieldDraftTransform(
  val: unknown,
  ctx: z.RefinementCtx,
): void {
  // Array de condicionais
  if (Array.isArray(val)) {
    val.forEach((item, i) =>
      forwardIssues(schema_conditionalValueSet.safeParse(item), ctx, [i]),
    );
    return;
  }

  if (!assertIsObject(val, ctx, "Transformação de draft")) return;

  const conditionKeys = [
    ...VALUE_CONDITION_KEYS,
    ...CHANGED_CONDITION_KEYS,
  ] as const;

  const hasCondition = conditionKeys.some((k) => k in val);
  const hasSetValue  = "setValue" in val;

  if (!hasCondition && !hasSetValue) {
    ctx.addIssue({
      code: "custom",
      message:
        `Transformação de draft deve ser:\n` +
        `  { setValue }                  → valor fixo\n` +
        `  { <condição>, setValue }       → valor condicional\n` +
        `  [{ <condição>, setValue }, …]  → lista de condicionais`,
    });
    return;
  }

  if (hasCondition && !hasSetValue) {
    ctx.addIssue({
      code: "custom",
      path: ["setValue"],
      message: `'setValue' é obrigatório quando uma condição está presente`,
    });
    return;
  }

  if (hasCondition) {
    forwardIssues(schema_conditionalValueSet.safeParse(val), ctx);
  } else {
    forwardIssues(schema_draftConfig.safeParse(val), ctx);
  }
}

function refineFieldMetadataTransform(
  val: unknown,
  ctx: z.RefinementCtx,
): void {
  // Array de condicionais
  if (Array.isArray(val)) {
    val.forEach((item, i) =>
      forwardIssues(schema_conditionalMetadata.safeParse(item), ctx, [i]),
    );
    return;
  }

  if (!assertIsObject(val, ctx, "Transformação de metadata")) return;

  const hasCondition = VALUE_CONDITION_KEYS.some((k) => k in val);

  if (hasCondition) {
    forwardIssues(schema_conditionalMetadata.safeParse(val), ctx);
  } else {
    forwardIssues(schema_metadataConfig.safeParse(val), ctx);
  }
}