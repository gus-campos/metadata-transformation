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
    _valueOf: "taxType",
    _is: "iptu",
  },
  truthyIsNumber: {
    _valueOf: "count",
    _is: 42,
  },
  truthyIsBoolean: {
    _valueOf: "active",
    _is: true,
  },
  truthyIsNull: {
    _valueOf: "nullable",
    _is: null,
  },

  // _isNot
  truthyIsNotString: {
    _valueOf: "taxType",
    _isNot: "itbi",
  },
  truthyIsNotNumber: {
    _valueOf: "count",
    _isNot: 0,
  },
  truthyIsNotBoolean: {
    _valueOf: "active",
    _isNot: false,
  },
  truthyIsNotNull: {
    _valueOf: "taxType",
    _isNot: null,
  },

  // _in
  truthyIsIn: {
    _valueOf: "taxType",
    _in: ["iptu", "itbi"],
  },
  truthyIsInNumber: {
    _valueOf: "count",
    _in: [10, 42, 100],
  },

  // _notIn
  truthyIsNotIn: {
    _valueOf: "taxType",
    _notIn: ["itbi", "ipva"],
  },
  truthyIsNotInNumber: {
    _valueOf: "count",
    _notIn: [0, 1, 2],
  },

  // path aninhado
  truthyNestedIs: {
    _valueOf: "complexField.innerField.innerMostField",
    _is: "valid",
  },
  truthyNestedIsNot: {
    _valueOf: "complexField.innerField.innerMostField",
    _isNot: "invalid",
  },
  truthyNestedIsIn: {
    _valueOf: "complexField.innerField.innerMostField",
    _in: ["valid", "other"],
  },
  truthyNestedIsNotIn: {
    _valueOf: "complexField.innerField.innerMostField",
    _notIn: ["invalid"],
  },
};

const falsyCases: Record<string, UnitValueCondition> = {
  // _if
  falsyIf: {
    _if: (obj: any) => obj.taxType === "itbi",
  },

  // _is
  falsyIsString: {
    _valueOf: "taxType",
    _is: "itbi",
  },
  falsyIsNumber: {
    _valueOf: "count",
    _is: 0,
  },
  falsyIsBoolean: {
    _valueOf: "active",
    _is: false,
  },
  falsyIsNull: {
    _valueOf: "taxType",
    _is: null,
  },

  // _isNot
  falsyIsNotString: {
    _valueOf: "taxType",
    _isNot: "iptu",
  },
  falsyIsNotNumber: {
    _valueOf: "count",
    _isNot: 42,
  },
  falsyIsNotBoolean: {
    _valueOf: "active",
    _isNot: true,
  },
  falsyIsNotNull: {
    _valueOf: "nullable",
    _isNot: null,
  },

  // _in
  falsyIsIn: {
    _valueOf: "taxType",
    _in: ["itbi", "ipva"],
  },
  falsyIsInNumber: {
    _valueOf: "count",
    _in: [0, 1, 2],
  },

  // _notIn
  falsyIsNotIn: {
    _valueOf: "taxType",
    _notIn: ["iptu", "itbi"],
  },
  falsyIsNotInNumber: {
    _valueOf: "count",
    _notIn: [10, 42, 100],
  },

  // path aninhado
  falsyNestedIs: {
    _valueOf: "complexField.innerField.innerMostField",
    _is: "invalid",
  },
  falsyNestedIsNot: {
    _valueOf: "complexField.innerField.innerMostField",
    _isNot: "valid",
  },
  falsyNestedIsIn: {
    _valueOf: "complexField.innerField.innerMostField",
    _in: ["invalid", "other"],
  },
  falsyNestedIsNotIn: {
    _valueOf: "complexField.innerField.innerMostField",
    _notIn: ["valid"],
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
