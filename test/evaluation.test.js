import { describe, expect, it } from "vitest";
import { validateConditionalChange } from "../src/validation.js";
import { areConditionsMet } from "../src/evaluation.js";

const object = {
  taxType: "iptu",
  documentType: "cpf",
  complexField: {
    innerField: {
      innerMostField: "valid",
    },
  },
};

const truthyCases = {
  truthyRule: {
    _if: (obj) => obj.taxType === "iptu",
  },
  truthyFieldEqual: {
    _field: "taxType",
    _is: "iptu",
  },
  truthyFieldNotEqual: {
    _field: "taxType",
    _isNot: "itbi",
  },
  truthyFieldOneOf: {
    _field: "taxType",
    _isIn: ["itbi", "iptu"],
  },
  truthyFieldEqualPairwise: {
    _fields: ["taxType", "documentType"],
    _are: ["iptu", "cpf"],
  },
  truthySomeIsEqual: {
    _fields: ["taxType", "documentType"],
    _someIs: "iptu",
  },
  // Path
  truthyDocumentType: {
    _field: "complexField.innerField.innerMostField",
    _is: "valid",
  },
};

const falsyCases = {
  falsyRule: {
    _if: (obj) => obj.taxType === "itbi",
  },
  falsyFieldEqual: {
    _field: "taxType",
    _is: "itbi",
  },
  falsyFieldNotEqual: {
    _field: "taxType",
    _isNot: "iptu",
  },
  falsyFieldOneOf: {
    _field: "taxType",
    _isIn: ["itbi", "ipva"],
  },
  falsyFieldEqualPairwise: {
    _fields: ["taxType", "documentType"],
    _are: ["itbi", "cpf"],
  },
  falsySomeIsEqual: {
    _fields: ["taxType", "documentType"],
    _someIs: "cnpj",
  },
  falsyDocumentType: {
    _field: "complexField.innerField.innerMostField",
    _is: "invalid",
  },
};

describe("Process metadata evaluation", () => {
  it.each(Object.entries(truthyCases))("%s", (name, conditionalChange) => {
    validateConditionalChange(conditionalChange);
    expect(areConditionsMet(conditionalChange, object)).toBeTruthy();
  });

  it.each(Object.entries(falsyCases))("%s", (name, conditionalChange) => {
    validateConditionalChange(conditionalChange);
    expect(areConditionsMet(conditionalChange, object)).toBeFalsy();
  });
});
