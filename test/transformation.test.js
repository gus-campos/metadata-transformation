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
    processMetadata(truthyFalsyCase, metadata, object);
    expect(metadata.fields.taxType).toEqual(defaultChangesToApply);
    expect(metadata.fields.documentType).toEqual(metadataDefault.fields.documentType);
  });

    it("falsyTruthyCase", (name, conditionalChange) => {
    processMetadata(falsyTruthyCase, metadata, object);
    expect(metadata.fields.taxType).toEqual(metadataDefault.fields.taxType);
    expect(metadata.fields.documentType).toEqual(defaultChangesToApply);
  });
});
