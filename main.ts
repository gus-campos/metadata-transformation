import { Metadata, MetadataField } from "./src/models/common";
import { MetadataTransform } from "./src/models/metadata-transform";
import { transformValidatedMetadata } from "./src/processing/process-metadata";

const baseMetadataField: MetadataField = {
  readonly: false,
  required: false,
  hidden: false,
  breakLine: false,
  size: "sm",
  query: {},
  valueOptions: [],
};

const _metadata: Metadata = {
  fields: {
    taxType: { ...baseMetadataField },
    documentType: { ...baseMetadataField },
    adress: { ...baseMetadataField },
    propertyType: { ...baseMetadataField },
    cityIdentification: { ...baseMetadataField },
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

const metadataTransform: MetadataTransform = {
  "taxType": {
    _is: null,
    hidden: true,
    required: false,
  },
  
  // TODO: Decidir como tratar undefined? Null contabiliza undefined?
  "documentType": {
    _valueOf: "adress",
    _notIn: [null],
    hidden: true,
    required: false,
  },

  // FIXME: Não infere tipo do argumento do lambda
  "adress": {
    _if: (obj: any) => isValidCep(obj.cep),
    readonly: true,
    size: "lg",
  },

  "propertyType": [
    {
      readonly: true,
    },
    {
      _valueOf: "taxType",
      _is: null,
      hidden: true,
    },
    {
      _valueOf: "taxType",
      _in: ["iptu", "itbi"],
      behavior: "omitted",
    },
    {
      _all: [
        {
          _valueOf: "taxType",
          _is: "teste",
        },
        {
          _not: {
            _valueOf: "documentType",
            _in: ["teste1", "teste2"],
          },
        },
      ],
      // FIXME: Não deveria deixar _in mas está deixando
      // _in: ["iptu", "itbi"],
      behavior: "displayed",
    },
  ],
};

transformValidatedMetadata(metadataTransform, {
  object: _object,
  metadata: _metadata,
});

///////////////////////////////////////////////////////////////

console.log("\n\n\n");
console.log(_metadata);
console.log("\n\n\n");

///////////////////////////////////////////////////////////////

function isValidCep(cep: string) {
  return true;
}
