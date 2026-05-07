//

type Value = boolean | string | Date | null;

// ================================== METADATA SET ==================================

// Behavior

type Behavior = {
  behavior: "omitted" | "mandatory" | "editable" | "displayed";
};
type BehaviorProps = {
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
};
type BehaviorConfig = Behavior | BehaviorProps;

// Layout

type LayoutConfig = {
  breakLine?: boolean;
  size?: "sm" | "md" | "lg";
};

// Selection

type SelectOption = { value: string; identifier: string };
type SelectionConfig = { options?: SelectOption[] } | { query?: Object };

// Field

type MetadataConfig = BehaviorConfig & LayoutConfig & SelectionConfig;

// ================================== VALUE SET ==================================

type ValueSet = { setValue: Value };

// ================================== VALUE CONDITIONS ==================================

type FieldId = { _field?: string };
type FieldsIds = { _fields: string[] };

type ValueCondition =
  | (FieldId & { _is: Value })
  | (FieldId & { _isNot: Value })
  | (FieldId & { _isIn: Value[] })
  | (FieldId & { _isNotIn: Value[] })
  | (FieldsIds & { _are: Value[] })
  | (FieldsIds & { _someIs: Value })
  
type ValueCustomCondtion = { _if: (obj: any) => boolean };

type UnitValueCondition = ValueCondition | ValueCustomCondtion;

// type MetadataCondition =
//   | UnitCondition
//   | { _all: Condition[] }
//   | { _any: Condition[] }
//   | { _not: Condition };

// ================================== DRAFT CONDITIONS ==================================

type ChangedCondition =
  | { _fieldChanged?: string }
  | { _someFieldChanged?: string[] };

// ================================== METADATA TRANSFORM ==================================

type ConditionalMetadata = UnitValueCondition & MetadataConfig;

type FieldMetadataTransform =
  | BehaviorConfig
  | ConditionalMetadata
  | ConditionalMetadata[];

export type MetadataTransform = Record<string, FieldMetadataTransform>;

// ================================== DRAFT TRANSFORM ==================================

type DraftCondition = UnitValueCondition | ChangedCondition;
type ConditionalValueSet = DraftCondition & ValueSet;

type FieldDraftTransform =
  | ValueSet
  | ConditionalValueSet
  | ConditionalValueSet[];

export type DraftTransform = Record<string, FieldDraftTransform>;

// ======================================================================================

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
