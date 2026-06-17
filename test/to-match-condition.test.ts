import { describe, it, expect } from "vitest";
import { toMatchCondition } from "../src/models/slim/slim-match"; // ajuste o caminho

const MOCK_FIELD_IDENTIFIER = "CAMPO IMPLÍCITO";

describe("toMatchCondition", () => {
  // ---------------------------------------------------------------------------
  // Passthrough — sem atalho
  // ---------------------------------------------------------------------------

  it("passa _anyOf já expandido sem alterar", () => {
    expect(
      toMatchCondition(
        { _match: { campo: { _anyOf: ["a", "b"] } } },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({ _match: { campo: { _anyOf: ["a", "b"] } } });
  });

  it("passa _allOf já expandido sem alterar", () => {
    expect(
      toMatchCondition(
        { _match: { campo: { _allOf: ["a", "b"] } } },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({ _match: { campo: { _allOf: ["a", "b"] } } });
  });

  // ---------------------------------------------------------------------------
  // Atalho: valor único → _anyOf unitário
  // ---------------------------------------------------------------------------

  it("converte string simples para _anyOf unitário", () => {
    expect(
      toMatchCondition({ _match: { campo: "valor" } }, MOCK_FIELD_IDENTIFIER),
    ).toEqual({
      _match: { campo: { _anyOf: ["valor"] } },
    });
  });

  it("converte número simples para _anyOf unitário", () => {
    expect(
      toMatchCondition({ _match: { campo: 42 } }, MOCK_FIELD_IDENTIFIER),
    ).toEqual({
      _match: { campo: { _anyOf: [42] } },
    });
  });

  it("converte booleano simples para _anyOf unitário", () => {
    expect(
      toMatchCondition({ _match: { campo: true } }, MOCK_FIELD_IDENTIFIER),
    ).toEqual({
      _match: { campo: { _anyOf: [true] } },
    });
  });

  it("converte InstanceObject simples para _anyOf unitário", () => {
    const obj = { _classId: "Foo", name: "bar" };
    expect(
      toMatchCondition({ _match: { campo: obj } }, MOCK_FIELD_IDENTIFIER),
    ).toEqual({
      _match: { campo: { _anyOf: [obj] } },
    });
  });

  // ---------------------------------------------------------------------------
  // Atalho: valor único → _anyOf unitário
  // ---------------------------------------------------------------------------

  it("converte array unitário para _anyOf com mesmo array", () => {
    expect(
      toMatchCondition({ _match: { campo: [42] } }, MOCK_FIELD_IDENTIFIER),
    ).toEqual({
      _match: { campo: { _anyOf: [42] } },
    });
  });

  it("converte array para _anyOf com mesmo array", () => {
    expect(
      toMatchCondition(
        { _match: { campo: ["valor1", "valor2"] } },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({
      _match: { campo: { _anyOf: ["valor1", "valor2"] } },
    });
  });

  // ---------------------------------------------------------------------------
  // _not e _some devem ser tratados recursivamente preservando campos adicionais
  // ---------------------------------------------------------------------------

  it("converte valor atalho dentro de _not", () => {
    expect(
      toMatchCondition(
        { _match: { _not: { campo: "valor" } } },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({
      _match: { _not: { campo: { _anyOf: ["valor"] } } },
    });
  });

  it("converte valor atalho dentro de _some", () => {
    expect(
      toMatchCondition(
        { _match: { _some: { campo: "valor" } } },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({ _match: { _some: { campo: { _anyOf: ["valor"] } } } });
  });

  it("preserva campos adicionais", () => {
    expect(
      toMatchCondition(
        {
          _match: {
            campo1: "valor",
            _not: {
              campo2: "valor",
              _some: {
                campo3: "valor",
              },
            },
          },
        },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({
      _match: {
        campo1: { _anyOf: ["valor"] },
        _not: {
          campo2: { _anyOf: ["valor"] },
          _some: {
            campo3: { _anyOf: ["valor"] },
          },
        },
      },
    });
  });

  // ---------------------------------------------------------------------------
  // Sem campo
  // ---------------------------------------------------------------------------

  it("assume que é referente ao próprio campos quando passado sem objeto de match", () => {
    expect(toMatchCondition({ _match: null }, MOCK_FIELD_IDENTIFIER)).toEqual({
      _match: { [MOCK_FIELD_IDENTIFIER]: { _anyOf: [null] } },
    });
  });

  it("assume que é referente ao próprio campos quando passado para match interno", () => {
    expect(
      toMatchCondition(
        {
          _match: {
            _match: null,
            campo1: null,
          },
        },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({
      _match: {
        campo1: { _anyOf: [null] },
        _match: {
          [MOCK_FIELD_IDENTIFIER]: { _anyOf: [null] },
        },
      },
    });
  });

  it("assume que é referente ao próprio campos em vários níveis de profundidade", () => {
    expect(
      toMatchCondition(
        {
          _match: {
            _not: {
              _some: ["A", "B"],
            },
          },
        },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({
      _match: {
        _not: {
          _some: {
            [MOCK_FIELD_IDENTIFIER]: { _anyOf: ["A", "B"] },
          },
        },
      },
    });
  });

  it("assume que é referente ao próprio campos em vários níveis de profundidade", () => {
    expect(
      toMatchCondition(
        {
          _match: {
            _not: {
              _some: ["A", "B"],
            },
          },
        },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({
      _match: {
        _not: {
          _some: {
            [MOCK_FIELD_IDENTIFIER]: { _anyOf: ["A", "B"] },
          },
        },
      },
    });
  });

  it("assume que é referente ao próprio campos sem perder outros campos", () => {
    expect(
      toMatchCondition(
        {
          _match: {
            campo1: "valor",
            _not: ["A", "B"],
          },
        },
        MOCK_FIELD_IDENTIFIER,
      ),
    ).toEqual({
      _match: {
        campo1: {
          _anyOf: ["valor"],
        },
        _not: {
          [MOCK_FIELD_IDENTIFIER]: { _anyOf: ["A", "B"] },
        },
      },
    });
  });

  // ---------------------------------------------------------------------------
  // Sem _match
  // ---------------------------------------------------------------------------

  it("retorna condição vazia quando _match não é passado", () => {
    expect(toMatchCondition({}, MOCK_FIELD_IDENTIFIER)).toEqual({});
  });
});
