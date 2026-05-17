import { beforeEach, describe, expect, it } from "vitest";
import { Metadata, MetadataField, PlainObject } from "../src/models/common";
import { UnitValueCondition } from "../src/models/value-condition";
import { transformMetadata } from "../src/processing/process-metadata";
import { MetadataConfig } from "../src/models/metadata-config";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const metadataFieldDefault: MetadataField = {
  readonly: false,
  required: true,
  hidden: false,
  breakLine: true,
  size: "sm",
  valueOptions: [],
  query: {},
};

const metadataDefault: Metadata = {
  fields: {
    taxType:       { ...metadataFieldDefault },
    documentType:  { ...metadataFieldDefault },
    implicitField: { ...metadataFieldDefault },
  },
};

const object: PlainObject = {
  taxType: "iptu",
  documentType: "cpf",
  implicitField: "auto",
};

const changesWhenConditionMatches: MetadataConfig = {
  readonly: true,
  required: false,
  hidden: true,
  breakLine: false,
  size: "lg",
};

const metadataFieldWhenConditionMatches: MetadataField = {
  ...metadataFieldDefault,
  ...changesWhenConditionMatches,
};

// ─── Transforms ──────────────────────────────────────────────────────────────

/*
 * Dado object = { taxType: "iptu", documentType: "cpf", implicitField: "auto" }:
 *
 * taxType      → _if: obj.taxType === "iptu"   → true  → aplica mudanças
 * documentType → _field: taxType, _is: "itbi"  → false → mantém padrão
 * implicitField → _is: "auto" (field implícito) → true  → aplica mudanças
 */
const transformTruthyFalsyTruthy: Record<string, UnitValueCondition> = {
  taxType: {
    _if: (obj) => obj.taxType === "iptu",
    ...changesWhenConditionMatches,
  },
  documentType: {
    _field: "taxType",
    _is: "itbi",
    ...changesWhenConditionMatches,
  },
  implicitField: {
    _is: "auto",
    ...changesWhenConditionMatches,
  },
};

/*
 * taxType      → _if: obj.taxType === "itbi"   → false → mantém padrão
 * documentType → _field: taxType, _is: "iptu"  → true  → aplica mudanças
 * implicitField → _is: "none" (field implícito) → false → mantém padrão
 */
const transformFalsyTruthyFalsy: Record<string, UnitValueCondition> = {
  taxType: {
    _if: (obj) => obj.taxType === "itbi",
    ...changesWhenConditionMatches,
  },
  documentType: {
    _field: "taxType",
    _is: "iptu",
    ...changesWhenConditionMatches,
  },
  implicitField: {
    _is: "none",
    ...changesWhenConditionMatches,
  },
};

/*
 * documentType → array de dois transforms aplicados sequencialmente:
 *   1. _isNot: "cnpj"                  → true  → readonly: true
 *   2. _field: taxType, _isIn: [...]   → true  → hidden: true, size: "md"
 */
const transformArrayOfConditions = {
  documentType: [
    {
      _isNot: "cnpj",
      readonly: true,
    },
    {
      _field: "taxType",
      _isIn: ["iptu", "itbi"],
      hidden: true,
      size: "md",
    },
  ],
};

// ─── Casos ───────────────────────────────────────────────────────────────────

type Case = {
  transform: object;
  assert: (metadata: Metadata) => void;
};

const cases: Record<string, Case> = {
  "condições verdadeira, falsa e verdadeira (via _if, _field/_is e _field implícito)": {
    transform: transformTruthyFalsyTruthy,
    assert: (metadata) => {
      expect(metadata.fields.taxType).toEqual(metadataFieldWhenConditionMatches);
      expect(metadata.fields.documentType).toEqual(metadataDefault.fields.documentType);
      expect(metadata.fields.implicitField).toEqual(metadataFieldWhenConditionMatches);
    },
  },

  "condições falsa, verdadeira e falsa (via _if, _field/_is e _field implícito)": {
    transform: transformFalsyTruthyFalsy,
    assert: (metadata) => {
      expect(metadata.fields.taxType).toEqual(metadataDefault.fields.taxType);
      expect(metadata.fields.documentType).toEqual(metadataFieldWhenConditionMatches);
      expect(metadata.fields.implicitField).toEqual(metadataDefault.fields.implicitField);
    },
  },

  "array de transforms aplicados sequencialmente sobre o mesmo campo": {
    transform: transformArrayOfConditions,
    assert: (metadata) => {
      expect(metadata.fields.documentType).toEqual({
        ...metadataFieldDefault,
        readonly: true,
        hidden: true,
        size: "md",
      });
    },
  },
};

// ─── Testes ───────────────────────────────────────────────────────────────────

let metadata: Metadata;

describe("transformMetadata — avaliação de condições e aplicação de mudanças", () => {
  beforeEach(() => {
    metadata = structuredClone(metadataDefault);
  });

  it.each(Object.entries(cases))("%s", (_, { transform, assert }) => {
    transformMetadata(transform, { metadata, object });
    assert(metadata);
  });
});