

import { describe, expect, it } from "vitest";
import { toApply } from "../src/models/shotcutted/shortcutted-apply";


describe("toApply", () => {
  it("should transform single apply term", () => {
    const result = toApply({
      _apply: "mandatory",
    });

    expect(result).toEqual({
      _apply: {
        hidden: false,
        required: true,
        readOnly: false,
      },
    });
  });

  it("should merge multiple apply terms", () => {
    const result = toApply({
      _apply: ["required", "readOnly"],
    });

    expect(result).toEqual({
      _apply: {
        required: true,
        readOnly: true,
      },
    });
  });

  it("should transform shortcuted metadata props inside apply", () => {
    const result = toApply({
      _apply: {
        behavior: "editable",
        name: "Nome",
      },
    });

    expect(result).toEqual({
      _apply: {
        hidden: false,
        required: false,
        readOnly: false,
        name: {
          pt: "Nome",
          _current: "Nome",
        },
      },
    });
  });

  it("should return empty object when apply is undefined", () => {
    const result = toApply({});
    expect(result).toEqual({});
  });
});