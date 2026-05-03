import { processMetadata } from "./src/processing.js";

const _metadata = {
  _fields: {
    taxType: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    documentType: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    cep: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    adress: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
  },
};

const _object = {
  taxType: "iptu",
  documentType: "cpf",
  cep: "36000-000",
  adress: "",
};

const metadataTransform = {
  documentType: {
    _field: "taxType",
    _isIn: ["iptu", "itbi"],
    hidden: true,
    required: false,
  },
  adress: {
    _if: (object) => isValidCep(object.cep),
    readonly: true,
    size: "lg",
  },
};

processMetadata(metadataTransform, _metadata, _object);

console.log("\n\n");
console.log(_metadata);

function isValidCep() {
  return true;
}
