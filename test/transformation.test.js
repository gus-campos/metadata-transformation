import { beforeEach, describe, expect, it } from "vitest";
import { processMetadata } from "../src/processing";

const metadataDefault = {
  fields: {
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
    rule: (obj) => obj.taxType === "iptu",
    ...defaultChangesToApply,
  },
  documentType: {
    field: "taxType",
    equal: "itbi",
    ...defaultChangesToApply,
  },
};

const falsyTruthyCase = {
  taxType: {
    rule: (obj) => obj.taxType === "itbi",
    ...defaultChangesToApply,
  },
  documentType: {
    field: "taxType",
    equal: "iptu",
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
    expect(metadata.fields.taxType).toEqual(defaultChangesToApply);
    expect(metadata.fields.documentType).toEqual(metadataDefault.fields.documentType);
  });

    it("falsyTruthyCase", (name, conditionalChange) => {
    processMetadata(metadata, falsyTruthyCase, object);
    expect(metadata.fields.taxType).toEqual(metadataDefault.fields.taxType);
    expect(metadata.fields.documentType).toEqual(defaultChangesToApply);
  });
});
