import { describe, expect, it } from "vitest";
import { validateConditionalChange } from "../src/validation.js"
import { areConditionsMet } from "../src/evaluation.js"

const object = {
  taxType: "iptu",
  documentType: "cpf",
};

const truthyCases = {
  truthyRule: {
    rule: (obj) => obj.taxType === "iptu",
  },
  truthyFieldEqual: {
    field: "taxType",
    equal: "iptu",
  },
  truthyFieldNotEqual: {
    field: "taxType",
    notEqual: "itbi",
  },
  truthyFieldOneOf: {
    field: "taxType",
    oneOf: ["itbi", "iptu"],
  },
  truthyFieldEqualPairwise: {
    fields: ["taxType", "documentType"],
    equalsPairwise: ["iptu", "cpf"],
  },
  truthySomeIsEqual: {
    fields: ["taxType", "documentType"],
    someIsEqual: "iptu",
  },
};

const falsyCases = {
  falsyRule: {
    rule: (obj) => obj.taxType === "itbi",
  },
  falsyFieldEqual: {
    field: "taxType",
    equal: "itbi",
  },
  falsyFieldNotEqual: {
    field: "taxType",
    notEqual: "iptu",
  },
  falsyFieldOneOf: {
    field: "taxType",
    oneOf: ["itbi", "ipva"],
  },
  falsyFieldEqualPairwise: {
    fields: ["taxType", "documentType"],
    equalsPairwise: ["itbi", "cpf"],
  },
  falsySomeIsEqual: {
    fields: ["taxType", "documentType"],
    someIsEqual: "cnpj",
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
