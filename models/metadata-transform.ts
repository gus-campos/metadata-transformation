//

export type Value = boolean | string | Date | null;

// ================================== METADATA CONFIG ==================================

// Behavior

export type Behavior = {
  behavior: "omitted" | "mandatory" | "editable" | "displayed";
};
export type BehaviorProps = {
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
};
export type BehaviorConfig = Behavior | BehaviorProps;

// Layout

export type LayoutConfig = {
  breakLine?: boolean;
  size?: "sm" | "md" | "lg";
};

// Selection

export type SelectOption = { value: string; identifier: string };
export type SelectionConfig = { options?: SelectOption[] } | { query?: Object };

// Field

export type MetadataConfig = BehaviorConfig & LayoutConfig & SelectionConfig;

// ================================== DRAFT CONFIG ==================================

export type DraftConfig = { setValue: Value };

// ================================== VALUE CONDITIONS ==================================

export type FieldId = { _field?: string };
export type FieldsIds = { _fields: string[] };

export type ValueConditionIs = (FieldId & { _is: Value });
export type ValueConditionIsNot = (FieldId & { _isNot: Value });
export type ValueConditionIsIn = (FieldId & { _isIn: Value[] });
export type ValueConditionIsNotIn = (FieldId & { _isNotIn: Value[] });
export type ValueConditionAre = (FieldsIds & { _are: Value[] });
export type ValueConditionSomeIs = (FieldsIds & { _someIs: Value });
export type ValueConditionIf = { _if: (obj: any) => boolean };

export type UnitValueCondition =
  | ValueConditionIs
  | ValueConditionIsNot
  | ValueConditionIsIn
  | ValueConditionIsNotIn
  | ValueConditionAre
  | ValueConditionSomeIs
  | ValueConditionIf;

// export type ComposedValueCondition =
//   | UnitValueCondition
//   | { _all: UnitValueCondition[] }
//   | { _any: UnitValueCondition[] }
//   | { _not: UnitValueCondition };

// ================================== DRAFT CONDITIONS ==================================

export type UnitChangedCondition =
  | { _fieldChanged?: string }
  | { _someFieldChanged?: string[] }
  | { _if: (oldObj: any, newObj: any) => boolean };

export type UnitDraftCondition = UnitChangedCondition | UnitValueCondition;

// export type ComposedDraftCondition =
//   | UnitDraftCondition
//   | { _all: UnitDraftCondition[] }
//   | { _any: UnitDraftCondition[] }
//   | { _not: UnitDraftCondition };

// ================================== METADATA TRANSFORM ==================================

export type UnitMetadataCondition = UnitValueCondition;
export type ConditionalMetadata = UnitMetadataCondition & MetadataConfig;

export type FieldMetadataTransform =
  | MetadataConfig
  | ConditionalMetadata
  | ConditionalMetadata[];

export type MetadataTransform = Record<string, FieldMetadataTransform>;

// ================================== DRAFT TRANSFORM ==================================

export type ConditionalValueSet = UnitDraftCondition & DraftConfig;

export type FieldDraftTransform =
  | DraftConfig
  | ConditionalValueSet
  | ConditionalValueSet[];

export type DraftTransform = Record<string, FieldDraftTransform>;

// ======================================================================================

export type InstanceObject = { [key: string]: Value | InstanceObject };

type MetadataProps = BehaviorProps & LayoutConfig & SelectionConfig;

export type Metadata = {
  fields: Record<string, MetadataProps>;
};

const metadataTransform: MetadataTransform = {
  taxType: {
    _is: null,
    hidden: true,
    required: false,
  },
  documentType: {
    _field: "adress",
    _isNot: null,
    behavior: "omitted",
  },
  adress: {
    _if: (obj: any) => isValidCep(obj.cep),
    size: "lg",
    behavior: "displayed",
  },
  // Aplica todas que forem verdadeiras, em ordem
  propertyType: [
    {
      _field: "taxType",
      _is: null,
      hidden: false,
    },
    {
      _field: "taxType",
      _isIn: ["iptu", "itbi"],
      required: true,
    },
  ],
  // Compara dois a dois
  cityIdentification: {
    _fields: ["propertyType", "documentType"],
    _are: ["urban", "cpf"],
    behavior: "mandatory",
  },
};

// ===== Próximas funcionalidades =====
// * Incluir mais metaprops, como o valueOptions  (internamente é dado push)
// TODO: Verificar o tipo de select
// TODO: Impedir de usar propriedades que são manipuladas pelo behavior

// ===== Talvez seja demais =====
// Talvez { not: "value" } seja demais, fugir do escopo e tal
// * Apenas no _are, além do valor, aceitar um "{ not: valor }" ou aceitar em todos
//    os valores por questão de padronização?
// Talvez só o lambda já ia melhorar mto a coisa
// * Composição através de _all, _any, _not (só vale pra condições, não nome de campos)

// ===== Não será feito =====
// * Are aceitando condições em array -> usar _all:
// * String fazendo operações entre campos -> usar _if
// * Uso de "!" dentro do campo para indicar negação -> confuso, gambiarra, e não escalável
// * Funcionalidades adicionais -> usar _if, priorizar minimalismo, e aprendizado sobre funcionalismo
// * Composição de condições que incluem _field ou _fields -> usar_if, baixa demanda, priorizar simplicidade.
// * _is aceitando array -> usar _isIn, que é mais semântico e legível

function isValidCep(cep: any) {
  return true;
}
