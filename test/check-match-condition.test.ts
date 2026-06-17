import { describe, it, expect } from "vitest";
import { checkMatchCondition } from "../src/processing/check-match-condition";
import { InstanceObject } from "../src/models/pure/common";

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
    expect(checkMatchCondition(instance, { nome: { _anyOf: ["João"] } })).toBe(
      true,
    );
  });

  it("retorna false quando o campo não bate", () => {
    expect(checkMatchCondition(instance, { nome: { _anyOf: ["Maria"] } })).toBe(
      false,
    );
  });

  it("compara com null", () => {
    expect(checkMatchCondition(instance, { ativo: { _anyOf: [null] } })).toBe(
      true,
    );
  });

  it("compara com número", () => {
    expect(checkMatchCondition(instance, { idade: { _anyOf: [30] } })).toBe(
      true,
    );
    expect(checkMatchCondition(instance, { idade: { _anyOf: [99] } })).toBe(
      false,
    );
  });

  it("retorna false para campo inexistente", () => {
    expect(
      checkMatchCondition(instance, { inexistente: { _anyOf: ["valor"] } }),
    ).toBe(false);
  });
});

// ---- múltiplos campos (every) -----------------------------------------------

describe("checkMatchCondition — múltiplos campos", () => {
  it("retorna true quando todos os campos batem", () => {
    expect(
      checkMatchCondition(instance, {
        nome: { _anyOf: ["João"] },
        idade: { _anyOf: [30] },
      }),
    ).toBe(true);
  });

  it("retorna false quando ao menos um campo não bate", () => {
    expect(
      checkMatchCondition(instance, {
        nome: { _anyOf: ["João"] },
        idade: { _anyOf: [99] },
      }),
    ).toBe(false);
  });
});

// ---- _not -------------------------------------------------------------------

describe("checkMatchCondition — _not", () => {
  it("retorna true quando a condição interna é falsa", () => {
    expect(
      checkMatchCondition(instance, { _not: { nome: { _anyOf: ["Maria"] } } }),
    ).toBe(true);
  });

  it("retorna false quando a condição interna é verdadeira", () => {
    expect(
      checkMatchCondition(instance, { _not: { nome: { _anyOf: ["João"] } } }),
    ).toBe(false);
  });

  it("_not com múltiplos campos (todos devem falhar para o _not ser true)", () => {
    expect(
      checkMatchCondition(instance, {
        _not: { nome: { _anyOf: ["Maria"] }, idade: { _anyOf: [99] } },
      }),
    ).toBe(true);
  });

  it("_not com um campo verdadeiro continua dando _not como true", () => {
    expect(
      checkMatchCondition(instance, {
        _not: { nome: { _anyOf: ["João"] }, idade: { _anyOf: [99] } },
      }),
    ).toBe(true);
  });
});

// ---- _some ------------------------------------------------------------------

describe("checkMatchCondition — _some", () => {
  it("retorna true quando ao menos um campo bate", () => {
    expect(
      checkMatchCondition(instance, {
        _some: { nome: { _anyOf: ["João"] }, idade: { _anyOf: [99] } },
      }),
    ).toBe(true);
  });

  it("retorna false quando nenhum campo bate", () => {
    expect(
      checkMatchCondition(instance, {
        _some: { nome: { _anyOf: ["Maria"] }, idade: { _anyOf: [99] } },
      }),
    ).toBe(false);
  });

  it("retorna true quando todos os campos batem", () => {
    expect(
      checkMatchCondition(instance, {
        _some: { nome: { _anyOf: ["João"] }, idade: { _anyOf: [30] } },
      }),
    ).toBe(true);
  });
});

describe("checkMatchCondition — _match", () => {
  it("match funciona como agrupador - caso 1", () => {
    expect(
      checkMatchCondition(instance, {
        _some: {
          _match: {
            nome: { _anyOf: ["Maria"] },
            idade: { _anyOf: [99] },
          },
        },
      }),
    ).toBe(false);
  });

  it("match funciona como agrupador - caso 2", () => {
    expect(
      checkMatchCondition(instance, {
        _some: {
          nome: { _anyOf: ["Maria"] },
          _match: {
            idade: { _anyOf: [99] },
          },
        },
      }),
    ).toBe(false);
  });
});

// ---- combinações ------------------------------------------------------------

describe("checkMatchCondition — combinações", () => {
  it("campo + _not", () => {
    expect(
      checkMatchCondition(instance, {
        nome: { _anyOf: ["João"] },
        _not: { idade: { _anyOf: [99] } },
      }),
    ).toBe(true);
  });

  it("campo + _not que falha", () => {
    expect(
      checkMatchCondition(instance, {
        nome: { _anyOf: ["João"] },
        _not: { idade: { _anyOf: [30] } }, // { _anyOf: [30]} bate, então _not é false
      }),
    ).toBe(false);
  });

  it("_not aninhado com _some", () => {
    expect(
      checkMatchCondition(instance, {
        _not: {
          _some: { nome: { _anyOf: ["Maria"] }, idade: { _anyOf: [99] } }, // nenhum bate → _some false → _not true
        },
      }),
    ).toBe(true);
  });

  it("_some com _not interno", () => {
    expect(
      checkMatchCondition(instance, {
        _some: {
          nome: { _anyOf: ["Maria"] }, // false
          _not: { idade: { _anyOf: [99] } }, // true
        },
      }),
    ).toBe(true);
  });
});

// ---- acesso por path ---------------------------------------------------------

describe("checkMatchCondition — path aninhado", () => {
  it("acessa campo aninhado via path", () => {
    expect(
      checkMatchCondition(instance, { "endereco.cidade": { _anyOf: ["BH"] } }),
    ).toBe(true);
  });

  it("retorna false para path aninhado com valor errado", () => {
    expect(
      checkMatchCondition(instance, { "endereco.cidade": { _anyOf: ["TR"] } }),
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
    expect(
      checkMatchCondition(instanceWithArrays, { tags: { _anyOf: ["admin"] } }),
    ).toBe(true);
  });

  it("retorna false quando o valor não está no array", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        tags: { _anyOf: ["superadmin"] },
      }),
    ).toBe(false);
  });

  it("retorna false para array vazio", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        vazio: { _anyOf: ["qualquer"] },
      }),
    ).toBe(false);
  });

  it("encontra null dentro do array", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { misto: { _anyOf: [null] } }),
    ).toBe(true);
  });

  it("encontra número dentro do array", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { numeros: { _anyOf: [2] } }),
    ).toBe(true);
    expect(
      checkMatchCondition(instanceWithArrays, { numeros: { _anyOf: [99] } }),
    ).toBe(false);
  });

  it("encontra string dentro de array misto", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { misto: { _anyOf: ["valor"] } }),
    ).toBe(true);
  });
});

describe("checkMatchCondition — campo é valor único, busca com array", () => {
  it("retorna true quando o valor do campo está no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        status: { _anyOf: ["ativo", "inativo"] },
      }),
    ).toBe(true);
  });

  it("retorna false quando o valor do campo não está no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        status: { _anyOf: ["inativo", "bloqueado"] },
      }),
    ).toBe(false);
  });

  // Se não estou exigindo nenhum valor, o teste não tem por que falhar
  it("retorna true para array esperado vazio", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { status: { _anyOf: [] } }),
    ).toBe(true);
  });

  it("encontra null no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        status: { _anyOf: [null, "ativo"] },
      }),
    ).toBe(true);
  });

  it("encontra número no array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { numeros: { _anyOf: [1] } }),
    ).toBe(true);
  });
});

describe("checkMatchCondition — campo é array, busca em array", () => {
  it("retorna true quando há interseção entre os dois arrays", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        tags: { _anyOf: ["admin", "bloqueado"] },
      }),
    ).toBe(true);
  });

  it("retorna false quando não há interseção", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        tags: { _anyOf: ["superadmin", "bloqueado"] },
      }),
    ).toBe(false);
  });

  // Se não estou exigindo nenhum valor, o teste não tem por que falhar
  it("retorna true quando array esperado é vazio", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { tags: { _anyOf: [] } }),
    ).toBe(true);
  });

  it("retorna false quando o campo é array vazio", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        vazio: { _anyOf: ["qualquer"] },
      }),
    ).toBe(false);
  });

  it("encontra null em interseção de arrays", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        misto: { _anyOf: [null, "inexistente"] },
      }),
    ).toBe(true);
  });
});

describe("checkMatchCondition — arrays com _not e _some", () => {
  it("_not nega match de valor em array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        _not: { tags: { _anyOf: ["admin"] } },
      }),
    ).toBe(false);
  });

  it("_not verdadeiro quando valor não está no array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        _not: { tags: { _anyOf: ["superadmin"] } },
      }),
    ).toBe(true);
  });

  it("_some com campo array — basta um bater", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        _some: {
          tags: { _anyOf: ["superadmin"] },
          status: { _anyOf: ["ativo"] },
        },
      }),
    ).toBe(true);
  });

  it("_some com busca em array esperado", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        _some: {
          status: { _anyOf: ["bloqueado", "inativo"] }, // false
          tags: { _anyOf: ["admin", "inexistente"] }, // true
        },
      }),
    ).toBe(true);
  });
});

describe("checkMatchCondition — campo é array, busca com _allOf", () => {
  it("retorna true para _allOf vazio (nenhum requisito)", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { tags: { _allOf: [] } }),
    ).toBe(true);
  });

  it("retorna true quando todos os valores do _allOf estão no array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        tags: { _allOf: ["admin", "editor", "viewer"] },
      }),
    ).toBe(true);
  });

  it("retorna true quando _allOf é subconjunto do array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        tags: { _allOf: ["admin", "editor"] },
      }),
    ).toBe(true);
  });

  it("retorna false quando algum valor do _allOf não está no array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        tags: { _allOf: ["admin", "superadmin"] },
      }),
    ).toBe(false);
  });

  it("retorna false quando nenhum valor do _allOf está no array do campo", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        tags: { _allOf: ["superadmin", "bloqueado"] },
      }),
    ).toBe(false);
  });

  it("retorna false quando o campo é array vazio", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        vazio: { _allOf: ["qualquer"] },
      }),
    ).toBe(false);
  });

  it("retorna true para _allOf vazio mesmo com campo vazio", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { vazio: { _allOf: [] } }),
    ).toBe(true);
  });

  it("encontra múltiplos valores incluindo null com _allOf", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        misto: { _allOf: [null, "valor"] },
      }),
    ).toBe(true);
  });

  it("retorna false quando _allOf exige valor ausente junto de um presente", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        misto: { _allOf: ["valor", "inexistente"] },
      }),
    ).toBe(false);
  });

  it("retorna true quando _allOf com um único valor presente no array", () => {
    expect(
      checkMatchCondition(instanceWithArrays, { numeros: { _allOf: [1] } }),
    ).toBe(true);
  });

  it("retorna true quando _allOf com múltiplos números todos presentes", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        numeros: { _allOf: [1, 2] },
      }),
    ).toBe(true);
  });

  it("retorna false quando _allOf com número ausente no array", () => {
    expect(
      checkMatchCondition(instanceWithArrays, {
        numeros: { _allOf: [1, 99] },
      }),
    ).toBe(false);
  });
});

const instanceWithObject: InstanceObject = {
  endereco: {
    cidade: "BH",
    estado: "MG",
    pais: "BR",
  },
};

describe("checkMatchCondition — campo é objeto, _anyOf verifica subset profundo", () => {
  it("retorna true quando o subset passado é vazio", () => {
    expect(
      checkMatchCondition(instanceWithObject, {
        endereco: {
          _anyOf: [{}],
        },
      }),
    ).toBe(true);
  });

  it("retorna true quando um subset bate", () => {
    expect(
      checkMatchCondition(instanceWithObject, {
        endereco: {
          _allOf: [{ estado: "MG", cidade: "BH" }],
        },
      }),
    ).toBe(true);
  });

  it("retorna false quando um subset não bate", () => {
    expect(
      checkMatchCondition(instanceWithObject, {
        endereco: {
          _allOf: [{ estado: "SP", cidade: "BH" }, { pais: "BR" }],
        },
      }),
    ).toBe(false);
  });

  it("retorna false quando uma chave não bate", () => {
    expect(
      checkMatchCondition(instanceWithObject, {
        endereco: {
          _allOf: [{ estado: "SP", cidade: "BH" }],
        },
      }),
    ).toBe(false);
  });

  // Assume que _anyOf funciona de forma análoga
});
