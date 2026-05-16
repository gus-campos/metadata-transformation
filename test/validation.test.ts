import { FieldMetadataTransform } from "../src/models/metadata-transform";
import { describe, expect, it } from "vitest";
import { printErrorBeforeThrowing } from "./utils";
import { assertFieldMetadataTransform } from "../src/validation/metadata-transform";

const validCases: Record<string, FieldMetadataTransform> = {
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

  valid_field_isIn: {
    _field: "tipo",
    _isIn: ["A", "B", "C"],
    readonly: true,
  },

  valid_field_isNotIn: {
    _field: "tipo",
    _isNotIn: ["A", "B", "C"],
    readonly: true,
  },

  valid_implicit_field_isNotIn: {
    _isNotIn: ["status"],
    readonly: true,
  },

  valid_implicit_field_isNot: {
    _isNot: "status",
    readonly: true,
  },

  valid_rule: {
    _if: (obj: any) => obj.id !== null,
    readonly: true,
  },

  // nenhum critério
  valid_no_condition: {
    hidden: true,
    readonly: false,
  },

  valid_array_of_conditions: [
    {
      _isNot: "status",
      readonly: true,
    },
    {
      _field: "tipo",
      _isNotIn: ["A", "B", "C"],
      readonly: true,
    },
  ],
};

// =========================
// NEGATIVOS (inválidos)
// =========================
const invalidCases: Record<string, unknown> = {
  // chave desconhecida -> Aceita chave desconhecida
  // invalid_unknownKeys: {
  //   readonly: true,
  //   foo: "bar",
  // },

  // size inválido
  invalid_size: {
    size: "xl",
  },

  // _field sem condição -> Aceita field e fields sem condição
  // invalid_field_without_condition: {
  //   _field: "status",
  // },

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

  invalid_field_isNotIn: {
    _field: "tipo",
    _isNotIn: "status",
    readonly: true,
  },

  invalid_implicit_field_isNotIn: {
    _isNotIn: "status",
    readonly: true,
  },

  invalid_implicit_field_isNot: {
    _isNot: ["status"],
    readonly: true,
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

  invalid_array_of_conditions: [
    {
      _isNot: "status",
      readonly: true,
    },
    {
      _field: ["status1", "status2"], // errado
      _is: "ativo",
      hidden: true,
    },
  ],

  invalid_extra_keys: {
    _field: "field",
    _isnot: "status",
    teste: "teste",
    readonly: true,
  },
};

describe("Process metadata validation", () => {
  it.each(Object.entries(validCases))("%s", (name, data) => {
    expect(() => assertFieldMetadataTransform(data)).not.toThrow();
  });

  it.each(Object.entries(invalidCases))("%s", (name, data) => {
    expect(() =>
      printErrorBeforeThrowing(() => assertFieldMetadataTransform(data)),
    ).toThrow();
  });
});

// const metadataDefault = {
//   fields: {
//     taxTypeconstructor: {
//       readonly: false,
//       required: true,
//       hidden: false,
//       breakLine: true,
//       size: "sm",
//     },
//     documentType: {
//       readonly: false,
//       required: true,
//       hidden: false,
//       breakLine: true,
//       size: "sm",
//     },
//   },
// };

// const validIdentifierTransform = {
//   taxType: {
//     _field: "taxType",
//     _isIn: ["itbi", "iptu"],
//   },
//   documentType: {
//     _fields: ["taxType", "documentType"],
//     _are: ["iptu", "cpf"],
//   },
// };

// const invalidRootIdentifierTransform = {
//   taxType: {
//     _field: "taxType",
//     _isIn: ["itbi", "iptu"],
//   },
//   documentTypee: {
//     _fields: ["taxType", "documentType"],
//     _are: ["iptu", "cpf"],
//   },
// };

// const invalidFieldIdentifierTransform = {
//   taxType: {
//     _field: "taxTypee",
//     _isIn: ["itbi", "iptu"],
//   },
//   documentType: {
//     _fields: ["taxType", "documentType"],
//     _are: ["iptu", "cpf"],
//   },
// };

// const invalidFieldsIdentifierTransform = {
//   taxType: {
//     _field: "taxType",
//     _isIn: ["itbi", "iptu"],
//   },
//   documentType: {
//     _fields: ["taxTypee", "documentType"],
//     _are: ["iptu", "cpf"],
//   },
// };

// // Paths

// const obj = {
//   fieldA: {
//     fieldB: {
//       fieldC: "value",
//     },
//   },
// };

// const validPath = {
//   taxType: {
//     _field: "fieldA.fieldB",
//     _isIn: ["itbi", "iptu"],
//   },
// };

// const notFoundPath = {
//   taxType: {
//     _field: "fieldA.field",
//     _isIn: ["itbi", "iptu"],
//   },
// };

// const invalidPath = {
//   taxType: {
//     _field: "fieldA.",
//     _isIn: ["itbi", "iptu"],
//   },
// };

// describe("Field identifiers validation", () => {
//   it("valid_identifier_transform", () => {
//     expect(() =>
//       validateFieldsIdentifiers(validIdentifierTransform, metadataDefault),
//     ).not.toThrow();
//   });

//   it("invalid_root_identifier_transform", () => {
//     expect(() =>
//       validateFieldsIdentifiers(
//         invalidRootIdentifierTransform,
//         metadataDefault,
//       ),
//     ).toThrow();
//   });

//   it("invalid_field_identifier_transform", () => {
//     expect(() =>
//       validateFieldsIdentifiers(
//         invalidFieldIdentifierTransform,
//         metadataDefault,
//       ),
//     ).toThrow();
//   });

//   it("invalid_fields_identifier_transform", () => {
//     expect(() =>
//       validateFieldsIdentifiers(
//         invalidFieldsIdentifierTransform,
//         metadataDefault,
//       ),
//     ).toThrow();
//   });

//   ////////////////////////////

//   it("validPath", () => {
//     expect(() =>
//       validateFieldsIdentifiers(validPath, metadataDefault, obj),
//     ).not.toThrow();
//   });

//   it("notFoundPath", () => {
//     expect(() =>
//       validateFieldsIdentifiers(notFoundPath, metadataDefault, obj),
//     ).toThrow();
//   });

//   it("invalidPath", () => {
//     expect(() =>
//       validateFieldsIdentifiers(invalidPath, metadataDefault, obj),
//     ).toThrow();
//   });
// });
