// to-metadata-transform.spec.ts

import { describe, expect, it } from "vitest";
import { toMetadataTransform } from "../src/models/shotcutted/shortcutted-metadata-transform";

describe("toMetadataTransform", () => {
  it("should normalize single transform into array", () => {
    const result = toMetadataTransform({
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
    const result = toMetadataTransform({
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
    const result = toMetadataTransform({
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
    const result = toMetadataTransform({
      status: {
        _match: {
          field: ["ACTIVE"],
        },
        _apply: "editable",
      },
    });

    expect(result).toEqual({
      status: [
        {
          _match: {
            field: ["ACTIVE"],
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