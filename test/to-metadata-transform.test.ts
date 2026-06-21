// to-metadata-transform.spec.ts

import { describe, expect, it } from "vitest";
import { toFieldsMetadataTransform } from "../src/models/slim/slim-metadata-transform";

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
