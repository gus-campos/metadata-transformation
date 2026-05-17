import { FieldMetadataTransform } from "../src/models/metadata-transform";
import { describe, expect, it } from "vitest";
import { printErrorBeforeThrowing } from "./utils";
import {
  assertFieldMetadataTransform,
  assertMetadataTransform,
} from "../src/validation/metadata-transform";
import { Metadata } from "../src/models/common";

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

  // Condição com _field explícito
  "condição _is com _field explícito": {
    _field: "status",
    _is: "ativo",
    required: true,
  },

  "condição _isNot com _field explícito": {
    _field: "status",
    _isNot: "inativo",
    hidden: true,
  },

  "condição _isIn com _field explícito": {
    _field: "tipo",
    _isIn: ["A", "B", "C"],
    readonly: true,
  },

  "condição _isNotIn com _field explícito": {
    _field: "tipo",
    _isNotIn: ["A", "B", "C"],
    readonly: true,
  },

  // Condição com _field implícito (usa o próprio identificador do campo)
  "condição _isNotIn com _field implícito": {
    _isNotIn: ["status"],
    readonly: true,
  },

  "condição _isNot com _field implícito": {
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
    { _isNot: "status", readonly: true },
    { _field: "tipo", _isNotIn: ["A", "B", "C"], readonly: true },
  ],
};

// ─── Casos inválidos ──────────────────────────────────────────────────────────

const invalidCases: Record<string, unknown> = {
  // Props de metadata inválidas
  "size com valor fora do enum": { size: "xl" },

  // Chaves desconhecidas
  "chave desconhecida junto de prop válida": {
    readonly: true,
    foo: "bar",
  },

  "múltiplas chaves inválidas com _field": {
    _field: "field",
    _isnot: "status",
    teste: "teste",
    readonly: true,
  },

  // Uso indevido de _field
  "_field sem operador de condição": {
    _field: "status",
  },

  "_field com múltiplos operadores de condição": {
    _field: "status",
    _is: "A",
    _isIn: ["A", "B"],
  },

  // Tipos errados nos operadores
  "_isIn com valor escalar em vez de array": {
    _field: "status",
    _isIn: "A",
  },

  "_isNotIn com valor escalar (field explícito)": {
    _field: "tipo",
    _isNotIn: "status",
    readonly: true,
  },
  "_isNotIn com valor escalar (field implícito)": {
    _isNotIn: "status",
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

  "_if combinado com _field": {
    _if: () => true,
    _field: "status",
  },

  // Array com item inválido
  "array de transforms com item inválido": [
    { _isNot: "status", readonly: true },
    { _field: ["status1", "status2"], _is: "ativo", hidden: true },
  ],
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("assertFieldMetadataTransform", () => {
  describe("casos válidos", () => {
    it.each(Object.entries(validCases))("%s", (_, data) => {
      expect(() => assertFieldMetadataTransform(data)).not.toThrow();
    });
  });

  describe("casos inválidos", () => {
    it.each(Object.entries(invalidCases))("%s", (_, data) => {
      expect(() =>
        printErrorBeforeThrowing(() => assertFieldMetadataTransform(data)),
      ).toThrow();
    });
  });
});

describe("assertMetadataTransform — validação de identificadores de campo", () => {
  it("não lança erro quando o identificador existe na metadata", () => {
    expect(() =>
      assertMetadataTransform(
        { taxType: { _field: "taxType", _isIn: ["itbi", "iptu"] } },
        metadataDefault,
      ),
    ).not.toThrow();
  });

  it("lança erro quando o identificador não existe na metadata", () => {
    expect(() =>
      assertMetadataTransform(
        { taxTypee: { _field: "taxType", _isIn: ["itbi", "iptu"] } },
        metadataDefault,
      ),
    ).toThrow();
  });
});
