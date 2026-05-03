type MetaProps = {
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
  breakLine?: boolean;
  size?: "sm" | "md" | "lg";
};

type Value = boolean | string | Date | null | { _not: Value };

type FieldId = { _field?: string }; // opcional -> se não passado, assume o próprio campo
type FieldsIds = { _fields: string[] };

type UnitCondition =
  | (FieldId & { _is: Value }) 
  | (FieldId & { _isNot: Value })
  | (FieldId & { _isIn: Value[] })
  | (FieldId & { _isNotIn: Value[] })
  | (FieldsIds & { _are: Value[] })
  | (FieldsIds & { _someIs: Value })
  | { _if: (object: any) => boolean };

type Condition =
  | UnitCondition
  | { _all: Condition[] }
  | { _any: Condition[] }
  | { _not: Condition }

type ConditionalChange = UnitCondition & MetaProps;
type UnitTransform = MetaProps | ConditionalChange | ConditionalChange[];
type MetadataTransform = Record<string, UnitTransform>;


// are poderia aceitar array de valores, ou { _not: valor }

// Próximas funcionalidades:
// * Composição através de _all, _any, _not (só vale pra )
// * Possível passar caminhos (split(".")) ---- nem pensei que podia ser um campo... ?
      // metadata vale assim?
// * Incluir mais metaprops, com valueOptions  (internamente é dado push)
// * Depois do nome do campo, é aceito um array de UnitTransform -> o primeiro truthy é aplicado

// Não será feito:
// * Are aceitando condições em array -> usar _all:  
// * String fazendo operações entre campos -> usar _if
// * Uso de "!" dentro do campo para indicar negação -> confuso, gambiarra, e não escalável 
// * Funcionalidades adicionais -> usar _if, priorizar minimalismo, e aprendizado sobre funcionalismo 
// * Composição de condições que incluem _field ou _fields -> usar_if, baixa demanda, priorizar simplicidade.
// * _is aceitando array -> usar _isIN, que é mais semântico e legível

const example = {
  _fields: ["campoA", "campoB"],
  _are: [{_is: "value1"}, { _isNotIs: ["value1", "value2"] }],
};
