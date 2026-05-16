import { describe, expect, it } from "vitest";
import {
  UnitValueCondition,
} from "../src/models/value-condition";
import { PlainObject } from "../src/models/common";
import { checkValueCondition } from "../src/processing/check-value-condition";
import { printErrorBeforeThrowing } from "./utils";

const object: PlainObject = {
  taxType: "iptu",
  count: 42,
  active: true,
  nullable: null,
  documentType: "cpf",
  complexField: {
    innerField: {
      innerMostField: "valid",
    },
  },
};

const truthyCases: Record<string, UnitValueCondition> = {
  // _if
  truthyIf: {
    _if: (obj: any) => obj.taxType === "iptu",
  },

  // _is — tipos primitivos
  truthyIsString: {
    _field: "taxType",
    _is: "iptu",
  },
  truthyIsNumber: {
    _field: "count",
    _is: 42,
  },
  truthyIsBoolean: {
    _field: "active",
    _is: true,
  },
  truthyIsNull: {
    _field: "nullable",
    _is: null,
  },

  // _isNot
  truthyIsNotString: {
    _field: "taxType",
    _isNot: "itbi",
  },
  truthyIsNotNumber: {
    _field: "count",
    _isNot: 0,
  },
  truthyIsNotBoolean: {
    _field: "active",
    _isNot: false,
  },
  truthyIsNotNull: {
    _field: "taxType",
    _isNot: null,
  },

  // _isIn
  truthyIsIn: {
    _field: "taxType",
    _isIn: ["iptu", "itbi"],
  },
  truthyIsInNumber: {
    _field: "count",
    _isIn: [10, 42, 100],
  },

  // _isNotIn
  truthyIsNotIn: {
    _field: "taxType",
    _isNotIn: ["itbi", "ipva"],
  },
  truthyIsNotInNumber: {
    _field: "count",
    _isNotIn: [0, 1, 2],
  },

  // path aninhado
  truthyNestedIs: {
    _field: "complexField.innerField.innerMostField",
    _is: "valid",
  },
  truthyNestedIsNot: {
    _field: "complexField.innerField.innerMostField",
    _isNot: "invalid",
  },
  truthyNestedIsIn: {
    _field: "complexField.innerField.innerMostField",
    _isIn: ["valid", "other"],
  },
  truthyNestedIsNotIn: {
    _field: "complexField.innerField.innerMostField",
    _isNotIn: ["invalid"],
  },
};

const falsyCases: Record<string, UnitValueCondition> = {
  // _if
  falsyIf: {
    _if: (obj: any) => obj.taxType === "itbi",
  },

  // _is
  falsyIsString: {
    _field: "taxType",
    _is: "itbi",
  },
  falsyIsNumber: {
    _field: "count",
    _is: 0,
  },
  falsyIsBoolean: {
    _field: "active",
    _is: false,
  },
  falsyIsNull: {
    _field: "taxType",
    _is: null,
  },

  // _isNot
  falsyIsNotString: {
    _field: "taxType",
    _isNot: "iptu",
  },
  falsyIsNotNumber: {
    _field: "count",
    _isNot: 42,
  },
  falsyIsNotBoolean: {
    _field: "active",
    _isNot: true,
  },
  falsyIsNotNull: {
    _field: "nullable",
    _isNot: null,
  },

  // _isIn
  falsyIsIn: {
    _field: "taxType",
    _isIn: ["itbi", "ipva"],
  },
  falsyIsInNumber: {
    _field: "count",
    _isIn: [0, 1, 2],
  },

  // _isNotIn
  falsyIsNotIn: {
    _field: "taxType",
    _isNotIn: ["iptu", "itbi"],
  },
  falsyIsNotInNumber: {
    _field: "count",
    _isNotIn: [10, 42, 100],
  },

  // path aninhado
  falsyNestedIs: {
    _field: "complexField.innerField.innerMostField",
    _is: "invalid",
  },
  falsyNestedIsNot: {
    _field: "complexField.innerField.innerMostField",
    _isNot: "valid",
  },
  falsyNestedIsIn: {
    _field: "complexField.innerField.innerMostField",
    _isIn: ["invalid", "other"],
  },
  falsyNestedIsNotIn: {
    _field: "complexField.innerField.innerMostField",
    _isNotIn: ["valid"],
  },
};

const invalidsIfCases: Record<string, UnitValueCondition> = {
  wrongOutput: {
    _if: (_obj: any) => "not-a-boolean" as any,
  },
  throwsInternally: {
    _if: (_obj: any) => { throw new Error("Erro fatal!"); },
  },
};

describe("Process metadata evaluation", () => {
  it.each(Object.entries(truthyCases))("%s", (name, valueCondition) => {
    expect(checkValueCondition(valueCondition, object)).toBeTruthy();
  });

  it.each(Object.entries(falsyCases))("%s", (name, valueCondition) => {
    expect(checkValueCondition(valueCondition, object)).toBeFalsy();
  });

  it.each(Object.entries(invalidsIfCases))("%s", (name, valueCondition) => {
    expect(() =>
      printErrorBeforeThrowing(() =>
        checkValueCondition(valueCondition, object),
      ),
    ).toThrow();
  });
});
