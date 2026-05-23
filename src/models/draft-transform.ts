import { InstanceObject, Value } from "./common";
import { MatchCondition } from "./match-condition";

export type Swap = { from?: Value; to?: Value };

export type FieldDraftTransform = {
  _if?: (object: InstanceObject, oldObject: InstanceObject) => boolean;
  _match?: MatchCondition;
  _swapped?: Record<string, Swap>;
  _changed?: string | string[];
  _setValue?: Value | Value[];
};

export type DraftTransform = Record<
  string,
  FieldDraftTransform | FieldDraftTransform[]
>;

// =============================================================================

const example: FieldDraftTransform = {
  _if: () => true,

  _match: {
    campo1: "valor1",

    _not: {
      campo2: "valor2",
    },

    _some: {
      campo3: null,
      campo4: 0,
    },
  },

  _changed: ["campo1", "campo2", "campo3"],

  _swapped: {
    campo1: {
      from: 0,
    },
    campo2: {
      to: 10,
    },
    campo3: {
      from: 0,
      to: 10,
    },
  },

  _setValue: 101,
};
