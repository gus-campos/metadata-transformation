import { InstanceObject, PlainObject, Value } from "./common";
import { MatchCondition } from "./match-condition";
import { XOR } from "./util";

export type Behavior = {
  behavior?: "omitted" | "mandatory" | "editable" | "displayed";
};

export type BahaviorProps = {
  readOnly?: boolean;
  required?: boolean;
  hidden?: boolean;
};

type Option = { value: string; identifier: string };

export type ExtraMetatadaProps = {
  size?: "sm" | "md" | "bg";
  breakline?: boolean;
  valueOptions?: Option[];
  query?: PlainObject;
};

export type MetadataApply = XOR<Behavior, BahaviorProps> & ExtraMetatadaProps;

export type FieldMetadataTransform = {
  // TODO: Mudar argumentos para campo, objeto
  _if?: (fieldValue: Value | Value[] | undefined, obj: InstanceObject) => boolean;
  _match?: MatchCondition;
  _apply?: MetadataApply;
};

/*
* Derramar conteúdo do match na raíz pode ser problemático
* O mesmo vale pro apply.
* Mas _apply pode aceitar que se passe shorthands para props de 
* booleans e de enums, como:
* 
* _apply: {
*   behavior: "mandatory"
* }
* 
* _apply: "displayed"
* 
* Ou:
* 
* _apply: ["readOnly"]
* 
* Não sendo possível passar valores "false" assim.
* Seria possível criar formas disso, mas criaria complexidade
* e "gambiarras".
* 
* Ainda seria possível usar o meio tradicional quando fosse necessário:
* 
* _apply: {
*   valueOptions: [{ value: "a", idenfifier: "A" }]
* }
*/

export type MetadataTransform = {
  [fieldIdentifier: string]: FieldMetadataTransform | FieldMetadataTransform[];
}

// =============================================================================

const example: FieldMetadataTransform = {
  _if: () => true,

  _match: {
    campo1: "valor1",

    _not: {
      campo2: "valor2",

      _some: {
        campo3: null,
        campo4: 0,
      },
    },
  },

  _apply: {
    // behavior: "displayed",
    readOnly: true,
    required: true,
    hidden: true,
    breakline: true,
    size: "bg",
    valueOptions: [],
    query: {},
  },
};
