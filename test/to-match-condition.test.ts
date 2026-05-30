import { describe, it, expect } from "vitest";
import { toMatchCondition } from "../src/models/shotcutted/shortcutted-match"; // ajuste o caminho

describe("toMatchCondition", () => {
  // ---------------------------------------------------------------------------
  // Passthrough — sem atalho
  // ---------------------------------------------------------------------------

  it("passa _anyOf já expandido sem alterar", () => {
    expect(
      toMatchCondition({ _match: { campo: { _anyOf: ["a", "b"] } } })
    ).toEqual({ _match: { campo: { _anyOf: ["a", "b"] } } });
  });

  it("passa _allOf já expandido sem alterar", () => {
    expect(
      toMatchCondition({ _match: { campo: { _allOf: ["a", "b"] } } })
    ).toEqual({ _match: { campo: { _allOf: ["a", "b"] } } });
  });

  // ---------------------------------------------------------------------------
  // Atalho: valor único → _anyOf unitário
  // ---------------------------------------------------------------------------

  it("converte string simples para _anyOf unitário", () => {
    expect(
      toMatchCondition({ _match: { campo: "valor" } })
    ).toEqual({ _match: { campo: { _anyOf: ["valor"] } } });
  });

  it("converte número simples para _anyOf unitário", () => {
    expect(
      toMatchCondition({ _match: { campo: 42 } })
    ).toEqual({ _match: { campo: { _anyOf: [42] } } });
  });

  it("converte booleano simples para _anyOf unitário", () => {
    expect(
      toMatchCondition({ _match: { campo: true } })
    ).toEqual({ _match: { campo: { _anyOf: [true] } } });
  });

  it("converte InstanceObject simples para _anyOf unitário", () => {
    const obj = { _classId: "Foo", name: "bar" };
    expect(
      toMatchCondition({ _match: { campo: obj } })
    ).toEqual({ _match: { campo: { _anyOf: [obj] } } });
  });

  // ---------------------------------------------------------------------------
  // _not e _some devem ser tratados recursivamente
  // ---------------------------------------------------------------------------

  it("converte valor atalho dentro de _not", () => {
    expect(
      toMatchCondition({ _match: { _not: { campo: "valor" } } })
    ).toEqual({ _match: { _not: { campo: { _anyOf: ["valor"] } } } });
  });

  it("converte valor atalho dentro de _some", () => {
    expect(
      toMatchCondition({ _match: { _some: { campo: "valor" } } })
    ).toEqual({ _match: { _some: { campo: { _anyOf: ["valor"] } } } });
  });

  // ---------------------------------------------------------------------------
  // Sem _match
  // ---------------------------------------------------------------------------

  it("retorna condição vazia quando _match não é passado", () => {
    expect(toMatchCondition({})).toEqual({});
  });
});