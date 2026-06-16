// to-metadata-transform.spec.ts

import { describe, expect, it } from "vitest";
import { toFieldsMetadataTransform, toRulesMetadataTransform } from "../src/models/slim/slim-metadata-transform";

describe("toFieldsMetadataTransform", () => {
  it("should normalize single transform into array", () => {
    const result = toFieldsMetadataTransform({
      name: {
        _apply: "mandatory",
      },
    });

    expect(result).toEqual({
      name: [
        {
          _apply: {
            hidden: false,
            required: true,
            readOnly: false,
          },
        },
      ],
    });
  });

  it("should preserve array transforms", () => {
    const result = toFieldsMetadataTransform({
      age: [
        {
          _apply: "required",
        },
        {
          _apply: "readOnly",
        },
      ],
    });

    expect(result).toEqual({
      age: [
        {
          _apply: {
            required: true,
          },
        },
        {
          _apply: {
            readOnly: true,
          },
        },
      ],
    });
  });

  it("should transform nested metadata props inside apply", () => {
    const result = toFieldsMetadataTransform({
      cpf: {
        _apply: {
          behavior: "displayed",
          placeholder: "CPF",
        },
      },
    });

    expect(result).toEqual({
      cpf: [
        {
          _apply: {
            hidden: false,
            required: false,
            readOnly: true,
            placeholder: {
              pt: "CPF",
              _current: "CPF",
            },
          },
        },
      ],
    });
  });

  it("should preserve existing transform properties", () => {
    const result = toFieldsMetadataTransform({
      status: {
        _match: {
          field: { _anyOf: ["ACTIVE"] },
        },
        _apply: "editable",
      },
    });

    expect(result).toEqual({
      status: [
        {
          _match: {
            field: { _anyOf: ["ACTIVE"] },
          },
          _apply: {
            hidden: false,
            required: false,
            readOnly: false,
          },
        },
      ],
    });
  });
});

describe("toRulesMetadataTransform", () => {
  it("should return an empty array when given an empty rules list", () => {
    const result = toRulesMetadataTransform([]);
    expect(result).toEqual([]);
  });

  it("should convert a single rule with string apply shorthand", () => {
    const result = toRulesMetadataTransform([
      {
        _match: { field: { _anyOf: ["ACTIVE"] } },
        _apply: { name: "mandatory" },
      },
    ]);

    expect(result).toEqual([
      {
        _match: { field: { _anyOf: ["ACTIVE"] } },
        _apply: {
          name: { hidden: false, required: true, readOnly: false },
        },
      },
    ]);
  });

  it("should convert a rule with array apply shorthand", () => {
    const result = toRulesMetadataTransform([
      {
        _match: { field: { _anyOf: ["ACTIVE"] } },
        _apply: { name: ["required", "readOnly"] },
      },
    ]);

    expect(result).toEqual([
      {
        _match: { field: { _anyOf: ["ACTIVE"] } },
        _apply: {
          name: { required: true, readOnly: true },
        },
      },
    ]);
  });

  it("should convert a rule with object-style apply containing metadata props", () => {
    const result = toRulesMetadataTransform([
      {
        _match: { type: { _anyOf: ["PF"] } },
        _apply: {
          cpf: { behavior: "displayed", placeholder: "CPF" },
        },
      },
    ]);

    expect(result).toEqual([
      {
        _match: { type: { _anyOf: ["PF"] } },
        _apply: {
          cpf: {
            hidden: false,
            required: false,
            readOnly: true,
            placeholder: { pt: "CPF", _current: "CPF" },
          },
        },
      },
    ]);
  });

  it("should convert a rule with multiple fields in _apply", () => {
    const result = toRulesMetadataTransform([
      {
        _match: { role: { _anyOf: ["ADMIN"] } },
        _apply: {
          name: "editable",
          cpf: "readOnly",
          status: "hidden",
        },
      },
    ]);

    expect(result).toEqual([
      {
        _match: { role: { _anyOf: ["ADMIN"] } },
        _apply: {
          name: { hidden: false, required: false, readOnly: false },
          cpf: { readOnly: true },
          status: { hidden: true },
        },
      },
    ]);
  });

  it("should convert multiple rules preserving their match conditions independently", () => {
    const result = toRulesMetadataTransform([
      {
        _match: { status: { _anyOf: ["ACTIVE"] } },
        _apply: { name: "editable" },
      },
      {
        _match: { status: { _anyOf: ["INACTIVE"] } },
        _apply: { name: "readOnly" },
      },
    ]);

    expect(result).toEqual([
      {
        _match: { status: { _anyOf: ["ACTIVE"] } },
        _apply: { name: { hidden: false, required: false, readOnly: false } },
      },
      {
        _match: { status: { _anyOf: ["INACTIVE"] } },
        _apply: { name: { readOnly: true } },
      },
    ]);
  });
});