import { describe, expect, it } from "vitest";
import { DraftTransform } from "../../src/models/draft-transform";
import { assertDraftTransform } from "../../src/validation/draft-transform";
import { printErrorBeforeThrowing } from "../utils";

// ─── Casos válidos ────────────────────────────────────────────────────────────

const validCases: Record<string, DraftTransform> = {
  // ── DraftConfig isolado ──────────────────────────────────────────────────

  "sem condição, apenas setValue": {
    taxType: {
      setValue: "iptu",
    },
  },

  "sem condição, setValue nulo": {
    taxType: {
      setValue: null,
    },
  },

  "sem condição, setValue booleano": {
    taxType: {
      setValue: false,
    },
  },

  //   "sem condição e sem props (objeto vazio)": {
  //     taxType: {},
  //   },

  // ── Condição de valor (_valueOf / _if com obj) ────────────────────────────

  "condição _is com _valueOf explícito": {
    taxType: {
      _valueOf: "status",
      _is: "ativo",
      setValue: "iptu",
    },
  },

  "condição _isNot com _valueOf implícito": {
    taxType: {
      _isNot: "inativo",
      setValue: "itbi",
    },
  },

  "condição _in com _valueOf explícito": {
    taxType: {
      _valueOf: "tipo",
      _in: ["A", "B"],
      setValue: "iptu",
    },
  },

  "condição _notIn com _valueOf implícito": {
    taxType: {
      _notIn: ["X", "Y"],
      setValue: null,
    },
  },

  "condição _if com predicado de valor (um argumento)": {
    taxType: {
      _if: (obj: any) => obj.status === "ativo",
      setValue: "iptu",
    },
  },

  // ── Condição de mudança (_changed / _anyChanged / _if com dois args) ─────

  "condição _changed com setValue": {
    taxType: {
      _changed: "status",
      setValue: "iptu",
    },
  },

  "condição _anyChanged com setValue": {
    taxType: {
      _anyChanged: ["status", "tipo"],
      setValue: null,
    },
  },

  "condição _if com predicado de mudança (dois argumentos)": {
    taxType: {
      _if: (oldObj: any, newObj: any) => oldObj.status !== newObj.status,
      setValue: "iptu",
    },
  },

  "setValue com objeto como valor": {
    taxType: {
      setValue: {
        nested: true,
      },
    },
  },

  // ── Array de transforms ──────────────────────────────────────────────────

  "array com dois transforms de valor": {
    taxType: [
      {
        _is: "iptu",
        setValue: "municipal",
      },
      {
        _valueOf: "tipo",
        _in: ["A", "B"],
        setValue: "estadual",
      },
    ],
  },

  "array com transforms de valor e de mudança misturados": {
    taxType: [
      {
        _changed: "status",
        setValue: "iptu",
      },
      {
        _isNot: "inativo",
        setValue: null,
      },
    ],
  },

  //   "array com transform vazio": {

  //     taxType: [{
  // }],
  //   },

  // ── Múltiplos campos ─────────────────────────────────────────────────────

  "múltiplos campos com condições diferentes": {
    taxType: {
      _is: "iptu",
      setValue: "municipal",
    },
    documentType: {
      _changed: "cpf",
      setValue: null,
    },
    status: {
      _anyChanged: ["a", "b"],
      setValue: "ativo",
    },
  },
};

// ─── Casos inválidos ──────────────────────────────────────────────────────────

// FIXME: Não deveria ser permitido OBJECT como valor?
// FIXME: Vários schemas reclamando do tipo aceito???
// ERRADO: Erro na validação no caminho taxType: Únicos valores aceitos são: number, boolean, string, Date, null ou objeto.

const invalidCases: Record<string, unknown> = {
  
  // ── Sem setValue ─────────────────────────────────────────────────
  
  "condição _if sem setValue (DraftConfig vazio)": {
    taxType: {
      _if: (obj: any) => obj.id !== null,
    },
  },
  // FIXME: Está reclamando de receber function???

  // ── Chaves desconhecidas ─────────────────────────────────────────────────

  "chave desconhecida no transform": {
    taxType: {
      foo: "bar",
    },
  },

  "chave desconhecida junto de setValue válido": {
    taxType: {
      setValue: "iptu",
      foo: "bar",
    },
  },

  // ── setValue com tipo inválido ───────────────────────────────────────────

  "setValue com array como valor": {
    taxType: {
      setValue: ["a", "b"],
    },
  },

  // ── Operadores de valor com tipos errados ────────────────────────────────

  "_in com escalar em vez de array": {
    taxType: {
      _valueOf: "tipo",
      _in: "A",
    },
  },

  "_notIn com escalar em vez de array": {
    taxType: {
      _notIn: "X",
    },
  },

  "_is com array em vez de escalar": {
    taxType: {
      _is: ["ativo", "inativo"],
    },
  },

  "_isNot com array em vez de escalar": {
    taxType: {
      _isNot: ["inativo"],
    },
  },

  // ── Operadores de mudança com tipos errados ──────────────────────────────

  "_changed com array em vez de string": {
    taxType: {
      _changed: ["status", "tipo"],
    },
  },

  "_anyChanged com string em vez de array": {
    taxType: {
      _anyChanged: "status",
    },
  },

  "_anyChanged com array de não-strings": {
    taxType: {
      _anyChanged: [1, 2, 3],
    },
  },

  // ── _if com tipo errado ──────────────────────────────────────────────────

  "_if com valor booleano em vez de função": {
    taxType: {
      _if: true,
    },
  },

  "_if com string em vez de função": {
    taxType: {
      _if: "() => true",
    },
  },

  // ── Combinações inválidas de condição ────────────────────────────────────

  "_valueOf sem operador de condição": {
    taxType: {
      _valueOf: "status",
    },
  },

  "múltiplos operadores de valor no mesmo transform": {
    taxType: {
      _is: "ativo",
      _in: ["ativo", "inativo"],
    },
  },

  "_if combinado com _valueOf": {
    taxType: {
      _if: () => true,
      _valueOf: "status",
    },
  },

  "_if combinado com _changed": {
    taxType: {
      _if: () => true,
      _changed: "status",
    },
  },

  // ── Estrutura inválida de array ──────────────────────────────────────────

  "array com item inválido": {
    taxType: [
      {
        _is: "iptu",
        setValue: "municipal",
      },
      {
        _valueOf: ["errado"],
        _is: "ativo",
      },
    ],
  },

  "valor do campo não é objeto nem array": {
    taxType: "string_direto",
  },

  // ── Estrutura raiz inválida ──────────────────────────────────────────────

  "raiz não é objeto": [
    "taxType",
    {
      setValue: "iptu",
    },
  ],

  "raiz é null": null,

  "raiz é string": "transform",
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("assertDraftTransform", () => {
  describe("casos válidos", () => {
    it.each(Object.entries(validCases))("%s", (_, data) => {
      expect(() => assertDraftTransform(data)).not.toThrow();
    });
  });

  describe("casos inválidos", () => {
    it.each(Object.entries(invalidCases))("%s", (_, data) => {
      expect(() =>
        printErrorBeforeThrowing(() => assertDraftTransform(data)),
      ).toThrow();
    });
  });
});
