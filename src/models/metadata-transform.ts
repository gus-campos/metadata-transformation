import { ExeptionHandling, PlainObject } from "./common";
import { ValueIfCondition, MatchCondition } from "./instance-condition";
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

export type FieldMetadataTransform = ValueIfCondition &
  ExeptionHandling &
  MatchCondition & {
    _apply?: MetadataApply;
  };

export type MetadataTransform = {
  [fieldIdentifier: string]: FieldMetadataTransform | FieldMetadataTransform[];
};

// =============================================================================

const example: FieldMetadataTransform = {
  _if: (value, obj) => true,

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
