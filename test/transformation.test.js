import { beforeEach, describe, expect, it } from "vitest";
import { processMetadata } from "../src/processing";

const metadataDefault = {
  _fields: {
    taxType: {
      readonly: false,
      required: true,
      hidden: false,
      breakLine: true,
      size: "sm",
    },
    documentType: {
      readonly: false,
      required: true,
      hidden: false,
      breakLine: true,
      size: "sm",
    },
  },
};

const object = {
  taxType: "iptu",
  documentType: "cpf",
};

const defaultChangesToApply = {
  readonly: true,
  required: false,
  hidden: true,
  breakLine: false,
  size: "lg",
};

const truthyFalsyCase = {
  taxType: {
    _if: (obj) => obj.taxType === "iptu",
    ...defaultChangesToApply,
  },
  documentType: {
    _field: "taxType",
    _is: "itbi",
    ...defaultChangesToApply,
  },
};

const falsyTruthyCase = {
  taxType: {
    _if: (obj) => obj.taxType === "itbi",
    ...defaultChangesToApply,
  },
  documentType: {
    _field: "taxType",
    _is: "iptu",
    ...defaultChangesToApply,
  },
};

let metadata;

describe("Process metadata evaluation", () => {
  beforeEach(() => {
    metadata = structuredClone(metadataDefault);
  });

  it("truthyFalsyCase", (name, conditionalChange) => {
    processMetadata(metadata, truthyFalsyCase, object);
    expect(metadata._fields.taxType).toEqual(defaultChangesToApply);
    expect(metadata._fields.documentType).toEqual(metadataDefault._fields.documentType);
  });

    it("falsyTruthyCase", (name, conditionalChange) => {
    processMetadata(metadata, falsyTruthyCase, object);
    expect(metadata._fields.taxType).toEqual(metadataDefault._fields.taxType);
    expect(metadata._fields.documentType).toEqual(defaultChangesToApply);
  });
});
