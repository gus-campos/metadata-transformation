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
    implicitField: {
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
  implicitField: "auto"
};

const defaultChangesToApply = {
  readonly: true,
  required: false,
  hidden: true,
  breakLine: false,
  size: "lg",
};

const truthyFalsyTruthyCase = {
  taxType: {
    _if: (obj) => obj.taxType === "iptu",
    ...defaultChangesToApply,
  },
  documentType: {
    _field: "taxType",
    _is: "itbi",
    ...defaultChangesToApply,
  },
  // Uso implícito do _field
  implicitField: {
    _is: "auto",
    ...defaultChangesToApply,
  },
};

const falsyTruthyFalsyCase = {
  taxType: {
    _if: (obj) => obj.taxType === "itbi",
    ...defaultChangesToApply,
  },
  documentType: {
    _field: "taxType",
    _is: "iptu",
    ...defaultChangesToApply,
  },
  // Uso implícito do _field
  implicitField: {
    _is: "none",
    ...defaultChangesToApply,
  },
};

let metadata;

describe("Process metadata evaluation", () => {
  beforeEach(() => {
    metadata = structuredClone(metadataDefault);
  });

  it("truthyFalsyTruthyCase", (name, conditionalChange) => {
    processMetadata(truthyFalsyTruthyCase, metadata, object);
    expect(metadata.fields.taxType).toEqual(defaultChangesToApply);
    expect(metadata.fields.documentType).toEqual(
      metadataDefault.fields.documentType,
    );
    expect(metadata.fields.implicitField).toEqual(defaultChangesToApply);
  });

  it("falsyTruthyFalsyCase", (name, conditionalChange) => {
    processMetadata(falsyTruthyFalsyCase, metadata, object);
    expect(metadata.fields.taxType).toEqual(metadataDefault.fields.taxType);
    expect(metadata.fields.documentType).toEqual(defaultChangesToApply);
    expect(metadata.fields.implicitField).toEqual(metadataDefault.fields.implicitField);
  });
});
