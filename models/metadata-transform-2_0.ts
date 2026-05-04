type MetaProps = {
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
  breakLine?: boolean;
  size?: "sm" | "md" | "lg";
};

type BaseValue = boolean | string | Date | null;
type Value = BaseValue | { not: BaseValue };

type FieldId = { _field?: string }; // opcional -> se não passado, assume o próprio campo
type FieldsIds = { _fields: string[] };

type UnitCondition =
  | (FieldId & { _is: Value })
  | (FieldId & { _isNot: Value })
  | (FieldId & { _isIn: Value[] })
  | (FieldId & { _isNotIn: Value[] })
  | (FieldsIds & { _are: Value[] })
  | (FieldsIds & { _someIs: Value })
  | { _if: (obj: any) => boolean };

type Condition =
  | UnitCondition
  | { _all: Condition[] }
  | { _any: Condition[] }
  | { _not: Condition };

type ConditionalChange = Condition & MetaProps;
type UnitTransform = MetaProps | ConditionalChange | ConditionalChange[];
type MetadataTransform = Record<string, UnitTransform>;

// function getDotPathValue(dotPath, object) {
//   // validar path (se tem ponto, n pode ter no inicio nem fim)
//   // Tem que existir no object
//   const path = dotPath.split(".");
//   // Recursivamente obter
// }

const exemploA = {
  nomeCampo: {
    _all: [
      {
        _field: "campoA",
        _is: true,
      },
      {
        _field: "campoB",
        _isNot: "verde",
      },
    ],
    readonly: true,
  },
};

const exemploB = {
  nomeCampo: {
    _fields: ["campoA", "campoB"],
    _are: [true, { not: "verde" }],
    readonly: true,
  },
};

// Ou deveria ser cumulativo ???
// Aplica todos que são satisfeitos na ordem? Ou só o primeiro?
const exemploC = {
  nomeCampo: [
    {
      _field: "campoA",
      _is: "cpf",
      hidden: false,
    },
    {
      _field: "campoB",
      _isNot: "iptu",
      required: true,
    },
  ],
};

// Próximas funcionalidades:
// * Incluir mais metaprops, como o valueOptions  (internamente é dado push)

// ===== Talvez seja demais =====
// Talvez { not: "value" } seja demais, fugir do escopo e tal
// * Apenas no _are, além do valor, aceitar um "{ not: valor }" ou aceitar em todos 
//    os valores por questão de padronização?
// Talvez só o lambda já ia melhorar mto a coisa
// * Composição através de _all, _any, _not (só vale pra condições, não nome de campos)

// Não será feito:
// * Are aceitando condições em array -> usar _all:
// * String fazendo operações entre campos -> usar _if
// * Uso de "!" dentro do campo para indicar negação -> confuso, gambiarra, e não escalável
// * Funcionalidades adicionais -> usar _if, priorizar minimalismo, e aprendizado sobre funcionalismo
// * Composição de condições que incluem _field ou _fields -> usar_if, baixa demanda, priorizar simplicidade.
// * _is aceitando array -> usar _isIn, que é mais semântico e legível

const example = {
  _fields: ["campoA", "campoB"],
  _are: [{ _is: "value1" }, { _isNot: ["value1", "value2"] }],
};
