import { processMetadata } from "./src/processing.js";

import { getPathValueFromObject } from "./src/commom.js";

const _metadata = {
  fields: {
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
  adress: {
    cep: "36000-000",
    street: "",
  },
};





///////////////////////////////////////////////////////////////

const metadataTransform = {
  taxType: {
    _is: null,
    hidden: true,
    required: false,
  },
  documentType: {
    _field: "adress.cep",
    _isNot: null,
    hidden: true,
    required: true,
  },
  adress: {
    _if: (object) => true,
    readonly: true,
    size: "lg",
  },
};

processMetadata(metadataTransform, _metadata, _object);

///////////////////////////////////////////////////////////////





console.log("\n\n");
console.log(_metadata);

console.log("\n\n\n");
