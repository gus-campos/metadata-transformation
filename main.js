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
    propertyType: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    cityIdentification: {
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
  propertyType: "urban",
  cityIdentification: "",
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
    _if: (obj) => isValidCep(obj.cep),
    readonly: true,
    size: "lg",
  },
  propertyType: [
    {
      _field: "taxType",
      _is: null,
      hidden: true,
    },
    {
      _field: "taxType",
      _isIn: ["iptu", "itbi"],
      readonly: true,
    },
  ],
  cityIdentification: {
    _fields: ["propertyType", "documentType"],
    _are: ["urban", "cpf"],
    hidden: false,
    required: true,
  },
};

processMetadata(metadataTransform, _metadata, _object);

///////////////////////////////////////////////////////////////

console.log("\n\n\n");
console.log(_metadata);
console.log("\n\n\n");














///////////////////////////////////////////////////////////////

if (!_object.taxType) {
  _metadata.fields.taxType.hidden = true;
  _metadata.fields.taxType.required = true;
}

if (_object.adress.cep) {
  _metadata.fields.documentType.hidden = true;
  _metadata.fields.documentType.required = true;
}

if (isValidCep(_object.cep)) {
  _metadata.fields.adress.readonly = true;
  _metadata.fields.adress.size = "lg";
}

if (!_object.taxType) {
  _metadata.fields.documentType.hidden = true;
}

if (["iptu", "itbi"].includes(_object.taxType)) {
  _metadata.fields.documentType.hidden = true;
}

if (_object.propertyType === "urban" && _object.documentType === "cpf") {
  _metadata.fields.cityIdentification.hidden = false;
  _metadata.fields.cityIdentification.required = true;
}

///////////////////////////////////////////////////////////////

function isValidCep() {
  return true;
}
