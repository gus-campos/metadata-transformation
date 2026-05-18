import { FieldMetadataTransform } from "../../src/models/metadata-transform";
import { describe, expect, it } from "vitest";
import { printErrorBeforeThrowing, toCamelCase } from "../utils";
import {
  assertFieldMetadataTransform,
  assertMetadataTransform,
} from "../../src/validation/metadata-transform";
import { Metadata } from "../../src/models/common";

// TODO: Mover testes de condição de valor para outro módulo

// ─── Fixtures ────────────────────────────────────────────────────────────────

const metadataDefault: Metadata = {
  fields: {
    taxType: {
      readonly: false,
      required: true,
      hidden: false,
      breakLine: true,
      size: "sm",
      valueOptions: [],
      query: {},
    },
    documentType: {
      readonly: false,
      required: true,
      hidden: false,
      breakLine: true,
      size: "sm",
      valueOptions: [],
      query: {},
    },
  },
};

// ─── Casos válidos ────────────────────────────────────────────────────────────

const validCases: Record<string, FieldMetadataTransform> = {
  // Sem condição
  "sem condição e sem props": {},

  "sem condição, apenas props de metadata": {
    readonly: true,
    required: true,
    hidden: false,
    breakLine: true,
    size: "md",
  },

  // Condição com _valueOf explícito
  "condição _is com _valueOf explícito": {
    _valueOf: "status",
    _is: "ativo",
    required: true,
  },

  "condição _isNot com _valueOf explícito": {
    _valueOf: "status",
    _isNot: "inativo",
    hidden: true,
  },

  "condição _in com _valueOf explícito": {
    _valueOf: "tipo",
    _in: ["A", "B", "C"],
    readonly: true,
  },

  "condição _notIn com _valueOf explícito": {
    _valueOf: "tipo",
    _notIn: ["A", "B", "C"],
    readonly: true,
  },

  // Condição com _valueOf implícito (usa o próprio identificador do campo)
  "condição _notIn com _valueOf implícito": {
    _notIn: ["status"],
    readonly: true,
  },

  "condição _isNot com _valueOf implícito": {
    _isNot: "status",
    readonly: true,
  },

  // Condição com função
  "condição _if com função arbitrária": {
    _if: (obj: any) => obj.id !== null,
    readonly: true,
  },

  // Array de transforms
  "array de transforms válidos": [
    {
      _isNot: "status",
      readonly: true,
    },
    {
      _valueOf: "tipo",
      _notIn: ["A", "B", "C"],
      readonly: true,
    },
  ],
};

// ─── Casos inválidos ──────────────────────────────────────────────────────────

const invalidCases: Record<string, unknown> = {
  // Props de metadata inválidas
  "size com valor fora do enum": {
    size: "xl",
  },

  // Chaves desconhecidas
  "chave desconhecida junto de prop válida": {
    readonly: true,
    foo: "bar",
  },

  "múltiplas chaves inválidas com _valueOf": {
    _valueOf: "field",
    _isnot: "status",
    teste: "teste",
    readonly: true,
  },

  // Uso indevido de _valueOf
  "_valueOf sem operador de condição": {
    _valueOf: "status",
  },

  "_valueOf com múltiplos operadores de condição": {
    _valueOf: "status",
    _is: "A",
    _in: ["A", "B"],
  },

  // Tipos errados nos operadores
  "_in com valor escalar em vez de array": {
    _valueOf: "status",
    _in: "A",
  },

  "_notIn com valor escalar (field explícito)": {
    _valueOf: "tipo",
    _notIn: "status",
    readonly: true,
  },
  "_notIn com valor escalar (field implícito)": {
    _notIn: "status",
    readonly: true,
  },
  "_isNot com array em vez de escalar (field implícito)": {
    _isNot: ["status"],
    readonly: true,
  },

  // Uso indevido de _if
  "_if com valor não-função": {
    _if: true,
  },

  "_if combinado com _valueOf": {
    _if: () => true,
    _valueOf: "status",
  },

  // stdout | test/validation/metadata-transform.test.ts > assertFieldMetadataTransform > casos inválidos > array de transforms com item inválido
  // Erro na validação no caminho _is:
  // Invalid input: expected string, received array
  // Erro observado em:
  // {
  //   "_valueOf": [
  //     "status1",
  //     "status2"
  //   ],
  //   "_is": "ativo",
  //   "hidden": true
  // }

  // Array com item inválido
  "array de transforms com item inválido": [
    {
      _isNot: "status",
      readonly: true,
    },
    {
      _valueOf: ["status1", "status2"],
      _is: "ativo",
      hidden: true,
    },
  ],
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("assertFieldMetadataTransform", () => {
  describe("casos válidos", () => {
    it.each(Object.entries(validCases))("%s", (name, data) => {
      expect(() => assertFieldMetadataTransform(data, toCamelCase(name))).not.toThrow();
    });
  });

  describe("casos inválidos", () => {
    it.each(Object.entries(invalidCases))("%s", (name, data) => {
      expect(() =>
        printErrorBeforeThrowing(() => assertFieldMetadataTransform(data, toCamelCase(name))),
      ).toThrow();
    });
  });
});

describe("assertMetadataTransform — validação de identificadores de campo", () => {
  it("não lança erro quando o identificador existe na metadata", () => {
    expect(() =>
      assertMetadataTransform(
        {
          taxType: {
            _valueOf: "taxType",
            _in: ["itbi", "iptu"],
          },
        },
        metadataDefault,
      ),
    ).not.toThrow();
  });

  it("lança erro quando o identificador não existe na metadata", () => {
    expect(() =>
      assertMetadataTransform(
        {
          taxTypee: {
            _valueOf: "taxType",
            _in: ["itbi", "iptu"],
          },
        },
        metadataDefault,
      ),
    ).toThrow();
  });
});
