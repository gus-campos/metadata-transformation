import { describe, it, expect } from "vitest";
import { checkMatchCondition } from "../src/processing/check-match-condition";
import { InstanceObject } from "../src/models/common";

// ---- helpers ----------------------------------------------------------------

const instance: InstanceObject = {
  nome: "João",
  idade: 30,
  ativo: null,
  endereco: {
    cidade: "BH",
    estado: "MG",
  },
};

// ---- campo simples ----------------------------------------------------------

describe("checkMatchCondition — campo simples", () => {
  it("retorna true quando o campo bate", () => {
    expect(checkMatchCondition(instance, { nome: "João" })).toBe(true);
  });

  it("retorna false quando o campo não bate", () => {
    expect(checkMatchCondition(instance, { nome: "Maria" })).toBe(false);
  });

  it("compara com null", () => {
    expect(checkMatchCondition(instance, { ativo: null })).toBe(true);
  });

  it("compara com número", () => {
    expect(checkMatchCondition(instance, { idade: 30 })).toBe(true);
    expect(checkMatchCondition(instance, { idade: 99 })).toBe(false);
  });

  it("retorna false para campo inexistente", () => {
    expect(checkMatchCondition(instance, { inexistente: "valor" })).toBe(false);
  });
});

// ---- múltiplos campos (every) -----------------------------------------------

describe("checkMatchCondition — múltiplos campos", () => {
  it("retorna true quando todos os campos batem", () => {
    expect(checkMatchCondition(instance, { nome: "João", idade: 30 })).toBe(true);
  });

  it("retorna false quando ao menos um campo não bate", () => {
    expect(checkMatchCondition(instance, { nome: "João", idade: 99 })).toBe(false);
  });
});

// ---- _not -------------------------------------------------------------------

describe("checkMatchCondition — _not", () => {
  it("retorna true quando a condição interna é falsa", () => {
    expect(checkMatchCondition(instance, { _not: { nome: "Maria" } })).toBe(true);
  });

  it("retorna false quando a condição interna é verdadeira", () => {
    expect(checkMatchCondition(instance, { _not: { nome: "João" } })).toBe(false);
  });

  it("_not com múltiplos campos (todos devem falhar para o _not ser true)", () => {
    expect(
      checkMatchCondition(instance, { _not: { nome: "Maria", idade: 99 } }),
    ).toBe(true);
  });

  it("_not com um campo verdadeiro continua dando _not como true", () => {
    expect(
      checkMatchCondition(instance, { _not: { nome: "João", idade: 99 } }),
    ).toBe(true);
  });
});

// ---- _some ------------------------------------------------------------------

describe("checkMatchCondition — _some", () => {
  it("retorna true quando ao menos um campo bate", () => {
    expect(
      checkMatchCondition(instance, { _some: { nome: "João", idade: 99 } }),
    ).toBe(true);
  });

  it("retorna false quando nenhum campo bate", () => {
    expect(
      checkMatchCondition(instance, { _some: { nome: "Maria", idade: 99 } }),
    ).toBe(false);
  });

  it("retorna true quando todos os campos batem", () => {
    expect(
      checkMatchCondition(instance, { _some: { nome: "João", idade: 30 } }),
    ).toBe(true);
  });
});

// ---- combinações ------------------------------------------------------------

describe("checkMatchCondition — combinações", () => {
  it("campo + _not", () => {
    expect(
      checkMatchCondition(instance, {
        nome: "João",
        _not: { idade: 99 },
      }),
    ).toBe(true);
  });

  it("campo + _not que falha", () => {
    expect(
      checkMatchCondition(instance, {
        nome: "João",
        _not: { idade: 30 }, // 30 bate, então _not é false
      }),
    ).toBe(false);
  });

  it("_not aninhado com _some", () => {
    expect(
      checkMatchCondition(instance, {
        _not: {
          _some: { nome: "Maria", idade: 99 }, // nenhum bate → _some false → _not true
        },
      }),
    ).toBe(true);
  });

  it("_some com _not interno", () => {
    expect(
      checkMatchCondition(instance, {
        _some: {
          nome: "Maria",          // false
          _not: { idade: 99 },    // true
        },
      }),
    ).toBe(true);
  });
});

// ---- acesso por path ---------------------------------------------------------

describe("checkMatchCondition — path aninhado", () => {
  it("acessa campo aninhado via path", () => {
    expect(
      checkMatchCondition(instance, { "endereco.cidade": "BH" }),
    ).toBe(true);
  });

  it("retorna false para path aninhado com valor errado", () => {
    expect(
      checkMatchCondition(instance, { "endereco.cidade": "TR" }),
    ).toBe(false);
  });
});

// ---- instância com arrays ---------------------------------------------------

const instanceWithArrays: InstanceObject = {
  tags: ["admin", "editor", "viewer"],
  numeros: [1, 2, 3],
  vazio: [],
  misto: [null, "valor", 42],
  status: "ativo",
};

describe("checkMatchCondition — campo é array, busca valor único", () => {
  it("retorna true quando o valor está no array", () => {
    expect(checkMatchCondition(instanceWithArrays, { tags: "admin" })).toBe(true);
  });

  it("retorna false quando o valor não está no array", () => {
    expect(checkMatchCondition(instanceWithArrays, { tags: "superadmin" })).toBe(false);
  });

  it("retorna false para array vazio", () => {
    expect(checkMatchCondition(instanceWithArrays, { vazio: "qualquer" })).toBe(false);
  });

  it("encontra null dentro do array", () => {
    expect(checkMatchCondition(instanceWithArrays, { misto: null })).toBe(true);
  });

  it("encontra número dentro do array", () => {
    expect(checkMatchCondition(instanceWithArrays, { numeros: 2 })).toBe(true);
    expect(checkMatchCondition(instanceWithArrays, { numeros: 99 })).toBe(false);
  });

  it("encontra string dentro de array misto", () => {
    expect(checkMatchCondition(instanceWithArrays, { misto: "valor" })).toBe(true);
  });
});

describe("checkMatchCondition — campo é valor único, busca com array", () => {
  it("retorna true quando o valor do campo está no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { status: ["ativo", "inativo"] }),
    ).toBe(true);
  });

  it("retorna false quando o valor do campo não está no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { status: ["inativo", "bloqueado"] }),
    ).toBe(false);
  });

  // Se não estou exigindo nenhum valor, o teste não tem por que falhar
  it("retorna true para array esperado vazio", () => {
    expect(checkMatchCondition(instanceWithArrays, { status: [] })).toBe(true);
  });

  it("encontra null no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { status: [null, "ativo"] }),
    ).toBe(true);
  });

  it("encontra número no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { numeros: [1] }),
    ).toBe(true);
  });
});

describe("checkMatchCondition — campo é array, busca em array", () => {
  it("retorna true quando há interseção entre os dois arrays", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { tags: ["admin", "bloqueado"] }),
    ).toBe(true);
  });

  it("retorna false quando não há interseção", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { tags: ["superadmin", "bloqueado"] }),
    ).toBe(false);
  });

  // Se não estou exigindo nenhum valor, o teste não tem por que falhar
  it("retorna true quando array esperado é vazio", () => {
    expect(checkMatchCondition(instanceWithArrays, { tags: [] })).toBe(true);
  });

  it("retorna false quando o campo é array vazio", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { vazio: ["qualquer"] }),
    ).toBe(false);
  });

  it("encontra null em interseção de arrays", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { misto: [null, "inexistente"] }),
    ).toBe(true);
  });
});

describe("checkMatchCondition — arrays com _not e _some", () => {
  it("_not nega match de valor em array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { _not: { tags: "admin" } }),
    ).toBe(false);
  });

  it("_not verdadeiro quando valor não está no array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { _not: { tags: "superadmin" } }),
    ).toBe(true);
  });

  it("_some com campo array — basta um bater", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        _some: { tags: "superadmin", status: "ativo" },
      }),
    ).toBe(true);
  });

  it("_some com busca em array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        _some: {
          status: ["bloqueado", "inativo"],  // false
          tags: ["admin", "inexistente"],     // true
        },
      }),
    ).toBe(true);
  });
});