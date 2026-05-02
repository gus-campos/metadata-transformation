import { describe, it, expect } from "vitest";
import { validateConditionalChange } from "../src/validation";

const validCases = {
  
  valid_nothing: {},

  valid_onlyMetaProps: {
    readonly: true,
    required: true,
    hidden: false,
    breakLine: true,
    size: "md",
  },

  valid_field_equal: {
    _field: "status",
    _is: "ativo",
    required: true,
  },

  valid_field_notEqual: {
    _field: "status",
    _isNot: "inativo",
    hidden: true,
  },

  valid_field_oneOf: {
    _field: "tipo",
    _isIn: ["A", "B", "C"],
    readonly: true,
  },

  valid_fields_equalsPairwise: {
    _fields: ["inicio", "fim"],
    _are: ["2024-01-01", "2024-01-02"],
    required: true,
  },

  valid_fields_someIsEqual: {
    _fields: ["status1", "status2"],
    _someIs: "ativo",
    hidden: true,
  },

  valid_rule: {
    _if: (obj) => obj.id !== null,
    readonly: true,
  },

  // nenhum critério
  valid_no_condition: {
    hidden: true,
    readonly: false,
  },
};

// =========================
// NEGATIVOS (inválidos)
// =========================
const invalidCases = {
  // chave desconhecida
  invalid_unknownKeys: {
    readonly: true,
    foo: "bar",
  },

  // size inválido
  invalid_size: {
    size: "xl",
  },

  // _field sem condição
  invalid_field_without_condition: {
    _field: "status",
  },

  // _field com múltiplas condições
  invalid_field_multiple_conditions: {
    _field: "status",
    _is: "A",
    _isIn: ["A", "B"],
  },

  // _isIn não é array
  invalid_oneOf_notArray: {
    _field: "status",
    _isIn: "A",
  },

  // _fields sem condição
  invalid_fields_without_condition: {
    _fields: ["a", "b"],
  },

  // _fields com múltiplas condições
  invalid_fields_multiple_conditions: {
    _fields: ["a", "b"],
    _someIs: "A",
    _are: ["A", "B"],
  },

  // _are não é array
  invalid_equalsPairwise_notArray: {
    _fields: ["a", "b"],
    _are: "A",
  },

  // tamanho diferente de _fields
  invalid_equalsPairwise_wrong_length: {
    _fields: ["a", "b"],
    _are: ["A"],
  },

  // _someIs tipo inválido (array em vez de valor)
  invalid_someIsEqual_type: {
    _fields: ["a", "b"],
    _someIs: ["A"],
  },

  // _if não é função
  invalid_rule_notFunction: {
    _if: true,
  },

  // mistura _if com _field
  invalid_rule_with_field: {
    _if: () => true,
    _field: "status",
  },
};

describe("Process metadata validation", () => {
  it.each(Object.entries(validCases))("%s", (name, data) => {
    expect(() => validateConditionalChange(data)).not.toThrow();
  });

  it.each(Object.entries(invalidCases))("%s", (name, data) => {
    expect(() => validateConditionalChange(data)).toThrow();
  });
});

