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
    field: "status",
    equal: "ativo",
    required: true,
  },

  valid_field_notEqual: {
    field: "status",
    notEqual: "inativo",
    hidden: true,
  },

  valid_field_oneOf: {
    field: "tipo",
    oneOf: ["A", "B", "C"],
    readonly: true,
  },

  valid_fields_equalsPairwise: {
    fields: ["inicio", "fim"],
    equalsPairwise: ["2024-01-01", "2024-01-02"],
    required: true,
  },

  valid_fields_someIsEqual: {
    fields: ["status1", "status2"],
    someIsEqual: "ativo",
    hidden: true,
  },

  valid_rule: {
    rule: (obj) => obj.id !== null,
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

  // field sem condição
  invalid_field_without_condition: {
    field: "status",
  },

  // field com múltiplas condições
  invalid_field_multiple_conditions: {
    field: "status",
    equal: "A",
    oneOf: ["A", "B"],
  },

  // oneOf não é array
  invalid_oneOf_notArray: {
    field: "status",
    oneOf: "A",
  },

  // fields sem condição
  invalid_fields_without_condition: {
    fields: ["a", "b"],
  },

  // fields com múltiplas condições
  invalid_fields_multiple_conditions: {
    fields: ["a", "b"],
    someIsEqual: "A",
    equalsPairwise: ["A", "B"],
  },

  // equalsPairwise não é array
  invalid_equalsPairwise_notArray: {
    fields: ["a", "b"],
    equalsPairwise: "A",
  },

  // tamanho diferente de fields
  invalid_equalsPairwise_wrong_length: {
    fields: ["a", "b"],
    equalsPairwise: ["A"],
  },

  // someIsEqual tipo inválido (array em vez de valor)
  invalid_someIsEqual_type: {
    fields: ["a", "b"],
    someIsEqual: ["A"],
  },

  // rule não é função
  invalid_rule_notFunction: {
    rule: true,
  },

  // mistura rule com field
  invalid_rule_with_field: {
    rule: () => true,
    field: "status",
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

