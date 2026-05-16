import { beforeEach, describe, expect, it } from "vitest";
import { Metadata, MetadataField, PlainObject } from "../src/models/common";
import { UnitValueCondition } from "../src/models/value-condition";
import { transformMetadata } from "../src/processing/process-metadata";
import { MetadataConfig } from "../src/models/metadata-config";

const metadataConfigDefault: MetadataField = {
  readonly: false,
  required: true,
  hidden: false,
  breakLine: true,
  size: "sm",
  options: [],
  query: {},
};

const metadataDefault: Metadata = {
  fields: {
    taxType: { ...metadataConfigDefault },
    documentType: { ...metadataConfigDefault },
    implicitField: { ...metadataConfigDefault },
  },
};

const object: PlainObject = {
  taxType: "iptu",
  documentType: "cpf",
  implicitField: "auto",
};

const defaultChangesToApply: MetadataConfig = {
  readonly: true,
  required: false,
  hidden: true,
  breakLine: false,
  size: "lg",
};

const expectedMetadataFieldOnTruthy = {
  ...metadataConfigDefault,
  ...defaultChangesToApply
};

const truthyFalsyTruthyCase: Record<string, UnitValueCondition> = {
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

const falsyTruthyFalsyCase: Record<string, UnitValueCondition> = {
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

const array_of_conditions = {
  documentType: [
    {
      _isNot: "cnpj",
      readonly: true,
    },
    {
      _field: "taxType", // errado
      _isIn: ["iptu", "itbi"],
      hidden: true,
      size: "md",
    },
  ],
};

const cases = {
  truthyFalsyTruthyCase: {
    transform: truthyFalsyTruthyCase,
    checkTestConditions: (metadata: Metadata) => {
      expect(metadata.fields.taxType).toEqual(expectedMetadataFieldOnTruthy);
      expect(metadata.fields.documentType).toEqual(
        metadataDefault.fields.documentType,
      );
      expect(metadata.fields.implicitField).toEqual(expectedMetadataFieldOnTruthy);
    },
  },

  falsyTruthyFalsyCase: {
    transform: falsyTruthyFalsyCase,
    checkTestConditions: (metadata: Metadata) => {
      expect(metadata.fields.taxType).toEqual(metadataDefault.fields.taxType);
      expect(metadata.fields.documentType).toEqual(expectedMetadataFieldOnTruthy);
      expect(metadata.fields.implicitField).toEqual(
        metadataDefault.fields.implicitField,
      );
    },
  },

  array_of_conditions: {
    transform: array_of_conditions,
    checkTestConditions: (metadata: Metadata) => {
      expect(metadata.fields.documentType).toEqual({
        readonly: true,
        required: true,
        hidden: true,
        breakLine: true,
        size: "md",
        options: [],
        query: {},
      });
    },
  },
};

let metadata: Metadata;

describe("Process metadata evaluation", () => {
  beforeEach(() => {
    metadata = structuredClone(metadataDefault);
  });

  it.each(Object.entries(cases))(
    "%s",
    (_name, { transform, checkTestConditions }) => {
      transformMetadata(metadata, object, transform);
      checkTestConditions(metadata);
    },
  );
});
